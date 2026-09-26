import { Place, Business, Stay, District, SafetyNotice, KnowledgeNote } from '../../models/index.js';
import { PUBLIC_STATUSES } from '../../config/constants.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Retrieval layer shared by the trip builder and the travel assistant (RAG).
 * Everything an AI provider sees comes from here, so it can only reference records
 * that exist in the platform database. Each fact carries a confidence label:
 *   verified    — confirmed by an editor (verification.verifiedAt or field-level flag)
 *   estimated   — present but not verified
 *   unavailable — unknown; must be shown as such, never guessed
 */

export const INTEREST_MAP = {
  nature: { categories: ['beaches', 'waterfalls', 'hill-stations', 'forests', 'wildlife', 'backwaters', 'lakes-dams', 'nature-walks', 'viewpoints'], moods: ['peaceful'] },
  food: { categories: [], moods: ['food'] },
  culture: { categories: ['heritage', 'museums', 'religious', 'villages'], moods: ['local-culture'] },
  adventure: { categories: ['adventure', 'treks'], moods: ['adventure'] },
  shopping: { categories: [], moods: ['shopping'] },
  photography: { categories: ['photography', 'viewpoints'], moods: ['photography', 'sunrise-sunset'] },
};

const pub = { status: { $in: PUBLIC_STATUSES } };

export async function resolveStart(start = {}) {
  if (Array.isArray(start.coordinates) && start.coordinates.length === 2) {
    return { coordinates: start.coordinates, label: start.label || 'Your starting point' };
  }
  if (start.district) {
    const d = await District.findOne({ slug: start.district }, { name: 1, location: 1 }).lean();
    if (d?.location?.coordinates) return { coordinates: d.location.coordinates, label: start.label || d.name, district: start.district };
  }
  throw ApiError.badRequest('A starting location (coordinates or district) is required');
}

export async function nearbyPlaces(coordinates, maxKm, extraFilter = {}, limit = 150) {
  return Place.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates },
        distanceField: 'distanceMeters',
        maxDistance: maxKm * 1000,
        spherical: true,
        query: { ...pub, ...extraFilter },
        key: 'location',
      },
    },
    { $limit: limit },
    { $project: { searchKeys: 0, descriptionMl: 0, sources: 0 } },
  ]);
}

export async function nearestBusiness(coordinates, kinds, maxKm = 15) {
  return Business.findOne(
    {
      ...pub,
      kind: { $in: kinds },
      location: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: maxKm * 1000 } },
    },
    { name: 1, slug: 1, district: 1, location: 1, priceRange: 1, kind: 1, isDemo: 1, openingHours: 1 },
  ).lean();
}

export async function nearestStay(coordinates, budget, maxKm = 30) {
  const bands = { budget: ['budget', 'unknown'], moderate: ['budget', 'mid', 'unknown'], premium: ['premium', 'luxury', 'mid', 'unknown'] }[budget] || undefined;
  return Stay.findOne(
    {
      ...pub,
      ...(bands ? { priceBand: { $in: bands } } : {}),
      location: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: maxKm * 1000 } },
    },
    { name: 1, slug: 1, district: 1, location: 1, priceBand: 1, priceFrom: 1, priceVerified: 1, type: 1, isDemo: 1, bookingLinks: 1 },
  ).lean();
}

export async function activeNotices({ placeIds = [], districts = [] }) {
  const now = new Date();
  return SafetyNotice.find({
    active: true,
    validFrom: { $lte: now },
    $and: [
      { $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }] },
      { $or: [{ targetType: 'place', targetId: { $in: placeIds } }, { district: { $in: districts }, targetId: { $exists: false } }] },
    ],
  })
    .limit(20)
    .lean();
}

/** Compact, confidence-labelled facts for one place — the only form an AI provider sees. */
export function placeFacts(p) {
  const verified = Boolean(p.verification?.verifiedAt);
  const fee = p.entryFee || {};
  let entryFee = { value: null, confidence: 'unavailable' };
  if (fee.isFree) entryFee = { value: 0, confidence: fee.verified ? 'verified' : 'estimated' };
  else if (typeof fee.amount === 'number') entryFee = { value: fee.amount, confidence: fee.verified ? 'verified' : 'estimated' };
  const hasHours = p.openingHours && ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].some((d) => Array.isArray(p.openingHours[d]) && p.openingHours[d].length);
  return {
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    district: p.district,
    categories: p.categories,
    moods: p.moods,
    typicalVisitHours: p.visitDurationHours ?? null,
    indoor: Boolean(p.indoor),
    distanceKmFromStart: p.distanceMeters ? Math.round(p.distanceMeters / 100) / 10 : undefined,
    openingHours: hasHours || p.openingHours?.open24h ? { value: p.openingHours, confidence: p.openingHours.verified ? 'verified' : 'estimated' } : { value: null, confidence: 'unavailable' },
    entryFee,
    recordVerified: verified,
    isDemoContent: Boolean(p.isDemo),
  };
}

/** Free-text retrieval for the assistant: places, food and approved knowledge notes. */
export async function retrieveForQuestion({ keywords = [], filters = {}, coordinates, limit = 8 }) {
  const placeFilter = { ...pub };
  if (filters.district) placeFilter.district = filters.district;
  if (filters.categories?.length) placeFilter.categories = { $in: filters.categories };
  if (filters.moods?.length) placeFilter.moods = { $in: filters.moods };
  if (filters.maxHours) placeFilter.visitDurationHours = { $lte: filters.maxHours };

  const places = coordinates
    ? await nearbyPlaces(coordinates, filters.maxDistanceKm || 60, placeFilter, limit)
    : await Place.find(placeFilter, { searchKeys: 0, descriptionMl: 0 }).sort({ featured: -1, 'stats.views': -1 }).limit(limit).lean();

  const noteQuery = { approved: true, ...(filters.district ? { district: filters.district } : {}) };
  const notes = keywords.length
    ? await KnowledgeNote.find({ ...noteQuery, $text: { $search: keywords.join(' ') } }).limit(5).lean().catch(() => [])
    : await KnowledgeNote.find(noteQuery).limit(3).lean();

  return {
    places: places.map(placeFacts),
    notes: notes.map((n) => ({ id: String(n._id), title: n.title, body: n.body, confidence: n.confidence, source: n.source || null })),
  };
}
