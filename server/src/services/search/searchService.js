import { Place, Business, Stay, Event, Dish, District } from '../../models/index.js';
import { PUBLIC_STATUSES, DISTRICTS } from '../../config/constants.js';
import { parseQuery } from './queryParser.js';
import { buildPlaceFilter, keywordClause } from '../placeQuery.js';
import { geoList, CARD_PROJECTION } from '../geoQuery.js';
import { track } from '../analyticsService.js';

const pub = { status: { $in: PUBLIC_STATUSES } };

function districtCentre(slug) {
  return District.findOne({ slug }, { location: 1 }).lean();
}

const FOOD_TERM_TO_CATEGORY = {
  biriyani: 'biriyani',
  biryani: 'biriyani',
  mandhi: 'mandhi',
  cafe: 'cafes',
  cafes: 'cafes',
  coffee: 'cafes',
  seafood: 'seafood',
  breakfast: 'breakfast',
  dessert: 'desserts',
};

/**
 * Unified smart search across places, food, stays and events.
 * Input: { q, lat, lng, limit, userId }. Returns grouped results + interpretation.
 */
export async function smartSearch({ q = '', lat, lng, limit = 8, userId, filters: extra = {} }) {
  const parsed = parseQuery(q);
  const f = { ...parsed.filters, ...extra };
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);

  let near = null;
  if (f.originDistrict && f.maxDistanceKm) {
    const d = await districtCentre(f.originDistrict);
    if (d?.location) near = { lng: d.location.coordinates[0], lat: d.location.coordinates[1], maxKm: f.maxDistanceKm };
  } else if ((f.nearMe || f.maxDistanceKm) && hasPoint) {
    near = { lng, lat, maxKm: f.maxDistanceKm || 50 };
  } else if (hasPoint) {
    near = { lng, lat, sortByDistance: false };
  }

  const placeFilter = buildPlaceFilter({
    district: f.district,
    categories: f.categories,
    moods: f.moods,
    maxHours: f.maxHours,
    weekend: f.weekend,
    budget: f.budget,
    familyFriendly: f.familyFriendly,
    accessible: f.accessible,
    keywordKeys: parsed.keywords,
  });

  const kw = keywordClause(parsed.keywords);
  const districtClause = f.district ? { district: f.district } : {};
  const foodCats = parsed.intentTerms.map((t) => FOOD_TERM_TO_CATEGORY[t]).filter(Boolean);
  if (f.budget === 'budget') foodCats.push('budget');

  const wantPlaces = !f.intent || parsed.keywords.length > 0 || f.categories.length > 0;
  const wantFood = !f.intent || f.intent === 'food';
  const wantStays = !f.intent || f.intent === 'stay';
  const wantEvents = !f.intent || f.intent === 'event';
  const generic = !kw && !f.intent;

  const businessFilter = {
    ...pub,
    ...districtClause,
    kind: { $in: ['restaurant', 'cafe', 'street-food', 'bakery'] },
    ...(foodCats.length ? { 'food.categories': { $in: foodCats } } : {}),
    ...(kw || {}),
  };
  const stayFilter = { ...pub, ...districtClause, ...(kw || {}) };
  if (f.budget === 'budget') stayFilter.priceBand = { $in: ['budget', 'unknown'] };
  const eventFilter = { ...pub, ...districtClause, endDate: { $gte: new Date() }, ...(kw || {}) };
  const dishCats = foodCats.length > 1 ? foodCats.filter((c) => c !== 'budget') : foodCats;
  const dishFilter = { ...pub, ...(kw ? kw : dishCats.length ? { categories: { $in: dishCats } } : {}) };

  const opts = { near, limit, project: CARD_PROJECTION };
  const [places, food, stays, events, dishes] = await Promise.all([
    wantPlaces ? geoList(Place, placeFilter, { ...opts, sort: { featured: -1, 'stats.views': -1 } }) : { items: [], total: 0 },
    wantFood && (!generic || f.intent === 'food') ? geoList(Business, businessFilter, opts) : { items: [], total: 0 },
    wantStays && (!generic || f.intent === 'stay') ? geoList(Stay, stayFilter, opts) : { items: [], total: 0 },
    wantEvents && (!generic || f.intent === 'event')
      ? Event.find(eventFilter, CARD_PROJECTION).sort({ startDate: 1 }).limit(limit).lean().then((items) => ({ items, total: items.length }))
      : { items: [], total: 0 },
    wantFood && (kw || foodCats.length)
      ? Dish.find(dishFilter, CARD_PROJECTION).limit(limit).lean().then((items) => ({ items, total: items.length }))
      : { items: [], total: 0 },
  ]);

  const matchedDistricts = parsed.keywords.length
    ? DISTRICTS.filter((d) => parsed.keywords.some((k) => d.slug.startsWith(k) || d.aliases.some((a) => a.startsWith(k))))
    : [];

  const total = places.total + food.total + stays.total + events.total + dishes.total;
  if (q.trim()) {
    track(total ? 'search' : 'zero_result_search', { query: q.slice(0, 200), resultsCount: total, user: userId });
  }

  return {
    query: q,
    interpretation: parsed.interpretation,
    engine: parsed.engine,
    needsLocation: Boolean(f.nearMe && !hasPoint),
    total,
    results: {
      places: places.items,
      food: food.items,
      stays: stays.items,
      events: events.items,
      dishes: dishes.items,
      districts: matchedDistricts.map((d) => ({ slug: d.slug, name: d.name, nameMl: d.nameMl })),
    },
  };
}

/** Lightweight typeahead suggestions from names across collections. */
export async function suggest(q, limit = 8) {
  const kw = keywordClause(String(q).split(/\s+/));
  if (!kw) return [];
  const [places, businesses, events] = await Promise.all([
    Place.find({ ...pub, ...kw }, { name: 1, slug: 1, district: 1 }).limit(limit).lean(),
    Business.find({ ...pub, ...kw }, { name: 1, slug: 1, district: 1, kind: 1 }).limit(4).lean(),
    Event.find({ ...pub, ...kw, endDate: { $gte: new Date() } }, { title: 1, slug: 1, district: 1 }).limit(3).lean(),
  ]);
  const districts = DISTRICTS.filter((d) => [d.slug, d.name.toLowerCase(), ...d.aliases].some((v) => v.startsWith(String(q).toLowerCase().trim()))).map(
    (d) => ({ type: 'district', label: d.name, slug: d.slug }),
  );
  return [
    ...districts,
    ...places.map((p) => ({ type: 'place', label: p.name, slug: p.slug, district: p.district })),
    ...businesses.map((b) => ({ type: 'business', label: b.name, slug: b.slug, district: b.district, kind: b.kind })),
    ...events.map((e) => ({ type: 'event', label: e.title, slug: e.slug, district: e.district })),
  ].slice(0, limit);
}
