import { haversineKm, estimateRoad, round1 } from '../../utils/geo.js';
import {
  INTEREST_MAP,
  resolveStart,
  nearbyPlaces,
  nearestBusiness,
  nearestStay,
  activeNotices,
} from './retrievalService.js';

/**
 * Turns an ordered list of places per day into a complete itinerary: timings, travel
 * estimates, meals, stays, opening-hour checks, costs, weather alternatives and safety
 * notes. All facts come from database records; missing facts are reported as unavailable.
 * Planning (which places, in which order) is done either by `planDemo` below or by an AI
 * provider — both feed this builder, so AI output can never introduce new facts.
 */

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const PACE = { relaxed: { stops: 3, capMin: 180 }, balanced: { stops: 4, capMin: 150 }, packed: { stops: 6, capMin: 100 } };
const RADIUS_KM = { 'few-hours': 35, 'one-day': 80, weekend: 140, 'multi-day': 220 };
const SPEED_KMH = { car: 35, taxi: 35, bike: 32, public: 22 };
// Transparent planning heuristics, always labelled "estimated" in the output.
const PER_KM_COST = { car: 8, bike: 3, taxi: 22 };

export function dayCount(inputs) {
  if (inputs.duration === 'weekend') return 2;
  if (inputs.duration === 'multi-day') return Math.min(7, Math.max(2, inputs.days || 3));
  return 1;
}

function dayWindow(inputs) {
  if (inputs.duration === 'few-hours') return { start: 9 * 60, end: 13 * 60 };
  return { start: 9 * 60, end: 18 * 60 + 30 };
}

const fmt = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(Math.round(min % 60)).padStart(2, '0')}`;
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function openingStatus(place, date, startMin, durationMin) {
  const oh = place.openingHours;
  if (!oh) return 'unknown';
  if (oh.open24h) return 'ok';
  const ranges = oh[DAY_KEYS[date.getDay()]];
  if (!Array.isArray(ranges)) return 'unknown';
  if (!ranges.length) return 'conflict'; // closed that day
  const fits = ranges.some((r) => {
    const [a, b] = r.split('-').map(toMin);
    return startMin >= a && startMin + Math.min(durationMin, 60) <= b;
  });
  return fits ? 'ok' : 'conflict';
}

function costFor(place) {
  const fee = place.entryFee || {};
  if (fee.isFree) return { amount: 0, confidence: fee.verified ? 'verified' : 'estimated', note: 'Free entry' };
  if (typeof fee.amount === 'number') {
    return { amount: fee.amount, confidence: fee.verified ? 'verified' : 'estimated', note: fee.notes || 'Per person entry fee' };
  }
  return { confidence: 'unavailable', note: 'Entry fee not available — check locally or on the official site' };
}

function safetyWarnings(place, month) {
  const s = place.safety || {};
  const w = [];
  if (s.swimmingRestricted === 'yes') w.push('Swimming is restricted here.');
  if (s.strongCurrents === 'yes') w.push('Strong currents reported — stay out of the water.');
  if (s.slipperyTerrain === 'yes') w.push('Slippery terrain — wear good footwear.');
  if (s.wildlifeRisk === 'yes') w.push('Wildlife in the area — follow forest department guidance.');
  if (s.nightAccessRestricted === 'yes') w.push('Night access is restricted.');
  if (s.monsoonClosure === 'yes' && month >= 6 && month <= 9) w.push('May be closed during the monsoon — confirm before travelling.');
  if (place.status === 'temporarily_closed') w.push('Listed as temporarily closed.');
  if (place.status === 'needs_update') w.push('Some details may be outdated.');
  return w;
}

/** Score candidates for interest match, accessibility and season. */
export function scoreCandidates(candidates, inputs, month) {
  const wantedCats = new Set(inputs.interests.flatMap((i) => INTEREST_MAP[i]?.categories || []));
  const wantedMoods = new Set(inputs.interests.flatMap((i) => INTEREST_MAP[i]?.moods || []));
  const lowMobility = inputs.withElderly || inputs.accessibilityNeeds.includes('minimal-walking') || inputs.accessibilityNeeds.includes('wheelchair');

  return candidates
    .filter((p) => {
      if (p.status === 'temporarily_closed') return false;
      if (lowMobility && (p.gemDetails?.accessDifficulty === 'difficult' || p.categories?.includes('treks'))) return false;
      if (inputs.accessibilityNeeds.includes('wheelchair') && p.accessibility?.wheelchair === 'no') return false;
      if (inputs.withChildren && p.familyFriendly === 'no') return false;
      if (month >= 6 && month <= 9 && p.safety?.monsoonClosure === 'yes') return false;
      return true;
    })
    .map((p) => {
      let score = 0;
      for (const c of p.categories || []) if (wantedCats.has(c)) score += 3;
      for (const m of p.moods || []) if (wantedMoods.has(m)) score += 2;
      if (!inputs.interests.length) score += 1;
      if (p.featured) score += 1.5;
      if (p.bestMonths?.includes(month)) score += 1;
      if (inputs.withChildren && p.familyFriendly === 'yes') score += 1.5;
      if (inputs.budget === 'budget' && ['free', 'budget'].includes(p.budgetLevel)) score += 1;
      score += (p.rating?.average || 0) / 2;
      score -= (p.distanceMeters || 0) / 1000 / 60;
      return { ...p, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

/** Deterministic planner: best-scoring places, grouped by day, nearest-neighbour ordered. */
export function planDemo(scored, inputs, startCoords) {
  const days = dayCount(inputs);
  const pace = PACE[inputs.pace] || PACE.balanced;
  const perDay = inputs.duration === 'few-hours' ? Math.min(3, pace.stops - 1) : pace.stops;
  const pool = scored.slice(0, Math.max(perDay * days * 2, 10));
  const used = new Set();
  const plan = [];
  let cursor = startCoords;
  for (let d = 0; d < days; d++) {
    const dayStops = [];
    for (let i = 0; i < perDay; i++) {
      let best = null;
      let bestCost = Infinity;
      for (const p of pool) {
        if (used.has(String(p._id))) continue;
        // Balance interest score against travel distance from the current position.
        const cost = haversineKm(cursor, p.location.coordinates) / 15 - p._score;
        if (cost < bestCost) {
          bestCost = cost;
          best = p;
        }
      }
      if (!best) break;
      used.add(String(best._id));
      dayStops.push(best);
      cursor = best.location.coordinates;
    }
    plan.push({ places: dayStops });
  }
  return plan;
}

export async function gatherCandidates(inputs) {
  const start = await resolveStart(inputs.start);
  const radius = RADIUS_KM[inputs.duration] || 80;
  const extra = inputs.districts?.length ? { district: { $in: inputs.districts } } : {};
  const candidates = await nearbyPlaces(start.coordinates, radius, extra, 150);
  return { start, candidates, radius };
}

export async function buildItinerary({ inputs, plan, start, candidates, generator, title }) {
  const month = (inputs.startDate ? new Date(inputs.startDate) : new Date()).getMonth() + 1;
  const pace = PACE[inputs.pace] || PACE.balanced;
  const window = dayWindow(inputs);
  const speed = SPEED_KMH[inputs.transport] || 35;
  const firstDate = inputs.startDate ? new Date(inputs.startDate) : new Date(Date.now() + 24 * 3600 * 1000);

  let totalKm = 0;
  let totalTravelMin = 0;
  let knownCost = 0;
  const unknownCosts = [];
  const warnings = [];
  const days = [];
  let cursor = start.coordinates;

  for (let d = 0; d < plan.length; d++) {
    const date = new Date(firstDate.getTime() + d * 24 * 3600 * 1000);
    let clock = window.start;
    const items = [];
    let lunchDone = inputs.duration === 'few-hours';

    for (const place of plan[d].places) {
      const leg = estimateRoad(cursor, place.location.coordinates);
      const travelMin = Math.round((leg.distanceKm / speed) * 60);
      if (clock + travelMin > window.end - 30) {
        warnings.push(`${place.name} was dropped from day ${d + 1}: not enough time in the day.`);
        continue;
      }
      if (leg.distanceKm > 1) {
        totalKm += leg.distanceKm;
        totalTravelMin += travelMin;
      }
      clock += travelMin;

      // Lunch once the clock passes 12:30.
      if (!lunchDone && clock >= 12 * 60 + 30) {
        clock = await addMeal(items, 'Lunch', cursor, clock, inputs);
        lunchDone = true;
      }

      const durationMin = Math.min(pace.capMin, Math.round((place.visitDurationHours || 1.5) * 60));
      const status = openingStatus(place, date, clock, durationMin);
      const cost = costFor(place);
      if (cost.confidence === 'unavailable') unknownCosts.push(`Entry fee: ${place.name}`);
      else knownCost += cost.amount;
      const itemWarnings = safetyWarnings(place, month);
      if (status === 'conflict') {
        itemWarnings.push('Listed opening hours conflict with this time — adjust the order or check before visiting.');
        if (inputs.respectOpeningHours) warnings.push(`Opening-hour conflict at ${place.name} on day ${d + 1}.`);
      }
      if (place.isDemo) itemWarnings.push('Demo listing — details are sample data, not verified.');

      items.push({
        kind: 'place',
        targetType: 'place',
        targetId: place._id,
        title: place.name,
        slug: place.slug,
        district: place.district,
        coordinates: place.location.coordinates,
        startTime: fmt(clock),
        durationMin,
        travelFromPrevious: { distanceKm: leg.distanceKm, durationMin: travelMin, estimated: true },
        costEstimate: cost,
        openingHoursStatus: status,
        notes: [place.shortDescription].filter(Boolean),
        warnings: itemWarnings,
      });
      clock += durationMin;
      cursor = place.location.coordinates;
    }

    if (!lunchDone && items.length) clock = await addMeal(items, 'Lunch', cursor, clock, inputs);

    const isLastDay = d === plan.length - 1;
    let stay;
    if (!isLastDay || inputs.duration === 'multi-day') {
      if (!isLastDay) {
        const s = await nearestStay(cursor, inputs.budget);
        if (s) {
          stay = { targetId: s._id, title: s.name, slug: s.slug };
          items.push({
            kind: 'stay',
            targetType: 'stay',
            targetId: s._id,
            title: s.name,
            slug: s.slug,
            district: s.district,
            coordinates: s.location.coordinates,
            startTime: fmt(Math.max(clock, 18 * 60)),
            costEstimate:
              s.priceVerified && s.priceFrom
                ? { amount: s.priceFrom, confidence: 'verified', note: 'From, per night' }
                : { confidence: 'unavailable', note: 'Price not verified — check the booking link' },
            notes: [s.isDemo ? 'Demo listing' : `${s.type} stay`],
            warnings: [],
          });
          if (!(s.priceVerified && s.priceFrom)) unknownCosts.push(`Stay: ${s.name}`);
        } else {
          warnings.push(`No listed stay found near the end of day ${d + 1}.`);
        }
      }
    }
    if (!isLastDay || plan.length > 1) {
      clock = await addMeal(items, 'Dinner', cursor, Math.max(clock, 19 * 60), inputs);
    }

    days.push({
      day: d + 1,
      date,
      title: items.find((i) => i.kind === 'place')?.district ? `Day ${d + 1} · ${items.find((i) => i.kind === 'place').district}` : `Day ${d + 1}`,
      items,
      stay,
    });
  }

  // Return leg for day trips.
  if (plan.length && inputs.duration !== 'multi-day') {
    const back = estimateRoad(cursor, start.coordinates);
    totalKm += back.distanceKm;
    totalTravelMin += Math.round((back.distanceKm / speed) * 60);
  }

  // Travel cost heuristic.
  let travelCost = null;
  if (PER_KM_COST[inputs.transport]) {
    travelCost = Math.round(totalKm * PER_KM_COST[inputs.transport]);
  } else {
    unknownCosts.push('Public transport fares (check KSRTC / Indian Railways)');
  }
  unknownCosts.push('Meals (prices vary by restaurant)');

  // Weather-aware alternatives: indoor options near outdoor stops.
  const outdoor = days.flatMap((d) => d.items).filter((i) => i.kind === 'place');
  const indoorPool = candidates.filter((c) => c.indoor || c.moods?.includes('rainy-day'));
  const usedIds = new Set(outdoor.map((i) => String(i.targetId)));
  const weatherAlternatives = [];
  for (const item of outdoor) {
    const src = candidates.find((c) => String(c._id) === String(item.targetId));
    if (!src || src.indoor) continue;
    const alt = indoorPool
      .filter((c) => !usedIds.has(String(c._id)))
      .map((c) => ({ c, km: haversineKm(item.coordinates, c.location.coordinates) }))
      .filter((x) => x.km < 40)
      .sort((a, b) => a.km - b.km)[0];
    if (alt) weatherAlternatives.push({ forItem: item.title, alternative: alt.c.name, slug: alt.c.slug });
    if (weatherAlternatives.length >= 4) break;
  }

  const seasonalNotes = [];
  if (month >= 6 && month <= 9) seasonalNotes.push('Monsoon season: expect heavy rain, slippery paths and possible closures of waterfalls, beaches and hill roads. Check official advisories before travelling.');
  if (month >= 3 && month <= 5) seasonalNotes.push('Pre-monsoon summer: midday heat can be intense — plan outdoor stops for early morning or evening.');
  const notices = await activeNotices({
    placeIds: outdoor.map((i) => i.targetId),
    districts: [...new Set(outdoor.map((i) => i.district))],
  });
  for (const n of notices) seasonalNotes.push(`${n.title} — ${n.message} (Source: ${n.source}, updated ${new Date(n.updatedAt).toISOString().slice(0, 10)})`);

  return {
    title: title || defaultTitle(inputs, start),
    inputs: { ...inputs, start: { label: start.label, coordinates: start.coordinates } },
    days,
    summary: {
      totalDistanceKm: round1(totalKm),
      totalTravelMin,
      estimatedCost: {
        min: knownCost + (travelCost || 0),
        max: knownCost + (travelCost || 0),
        note: `Includes known entry fees${travelCost ? ` and an estimated ${inputs.transport} travel cost of ₹${travelCost} (₹${PER_KM_COST[inputs.transport]}/km heuristic)` : ''}. Items listed as unavailable are not included.`,
      },
      unknownCosts: [...new Set(unknownCosts)],
      warnings,
      weatherAlternatives,
      seasonalNotes,
    },
    generator,
    disclaimer:
      'Distances and times are straight-line road estimates without traffic. Opening hours and fees are shown only when present in our database; always confirm locally.',
  };
}

async function addMeal(items, label, coords, clock, inputs) {
  const kinds = inputs.budget === 'budget' ? ['street-food', 'restaurant', 'cafe', 'bakery'] : ['restaurant', 'cafe'];
  const r = await nearestBusiness(coords, kinds, 20);
  if (r) {
    items.push({
      kind: 'meal',
      targetType: 'business',
      targetId: r._id,
      title: `${label}: ${r.name}`,
      slug: r.slug,
      district: r.district,
      coordinates: r.location.coordinates,
      startTime: fmt(clock),
      durationMin: 60,
      costEstimate: { confidence: 'unavailable', note: r.priceRange && r.priceRange !== 'unknown' ? `Price band: ${r.priceRange}` : 'Price not available' },
      notes: [r.isDemo ? 'Demo listing' : r.kind],
      warnings: [],
    });
  } else {
    items.push({
      kind: 'meal',
      title: `${label} break`,
      startTime: fmt(clock),
      durationMin: 60,
      notes: ['No listed restaurant within 20 km of this stop — look for local options nearby.'],
      costEstimate: { confidence: 'unavailable' },
      warnings: [],
    });
  }
  return clock + 60;
}

function defaultTitle(inputs, start) {
  const len = { 'few-hours': 'A few hours', 'one-day': 'Day trip', weekend: 'Weekend', 'multi-day': `${dayCount(inputs)}-day trip` }[inputs.duration];
  return `${len} from ${start.label}`;
}
