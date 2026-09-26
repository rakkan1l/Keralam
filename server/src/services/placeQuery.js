import { PUBLIC_STATUSES, TIME_BUCKETS } from '../config/constants.js';
import { toList, escapeRegex } from '../utils/pagination.js';
import { foldKey } from '../utils/searchKeys.js';

export const PLACE_SORTS = {
  popular: { featured: -1, 'stats.views': -1, 'stats.saves': -1, name: 1 },
  rating: { 'rating.average': -1, 'rating.count': -1 },
  name: { name: 1 },
  newest: { createdAt: -1 },
};

/** Build a keyword clause that tolerates Malayalam/English spelling variants. */
export function keywordClause(keys) {
  const folded = keys.map(foldKey).filter((k) => k.length > 1);
  if (!folded.length) return null;
  return {
    $and: folded.map((k) => ({
      $or: [{ searchKeys: { $regex: escapeRegex(k) } }, { tags: k }],
    })),
  };
}

/**
 * Translate Explore filters (query-string or parsed search filters) to a Mongo filter.
 * Accepts: district, category, mood, time, budget, month/season, hiddenGem, featured,
 * family, accessible, crowd, q (keywords), verified.
 */
export function buildPlaceFilter(params = {}, { includeAllStatuses = false } = {}) {
  const and = [];
  const filter = includeAllStatuses ? {} : { status: { $in: PUBLIC_STATUSES } };

  const districts = toList(params.district);
  if (districts.length) filter.district = { $in: districts };

  const categories = toList(params.category ?? params.categories);
  if (categories.length) filter.categories = { $in: categories };

  const moods = toList(params.mood ?? params.moods);
  if (moods.length) filter.moods = { $in: moods };

  if (params.time && TIME_BUCKETS[params.time] !== undefined) {
    if (params.time === 'weekend' || params.time === '3-days-plus') filter.weekendGetaway = true;
    else and.push({ visitDurationHours: { $lte: TIME_BUCKETS[params.time] } });
  }
  if (params.maxHours) and.push({ visitDurationHours: { $lte: Number(params.maxHours) } });
  if (params.weekend === true || params.weekend === 'true') filter.weekendGetaway = true;

  const budget = params.budget;
  if (budget === 'free') and.push({ $or: [{ budgetLevel: 'free' }, { 'entryFee.isFree': true }] });
  else if (budget === 'budget') filter.budgetLevel = { $in: ['free', 'budget'] };
  else if (budget === 'moderate') filter.budgetLevel = { $in: ['free', 'budget', 'moderate'] };
  else if (budget === 'premium') filter.budgetLevel = 'premium';

  const month = params.month ? Number(params.month) : params.season === 'now' ? new Date().getMonth() + 1 : null;
  if (month >= 1 && month <= 12) filter.bestMonths = month;
  if (params.season === 'monsoon') filter['gemDetails.monsoonSuitable'] = 'yes';

  if (params.hiddenGem === 'true' || params.hiddenGem === true) filter.hiddenGem = true;
  if (params.featured === 'true') filter.featured = true;
  if (params.family === 'true' || params.familyFriendly === true) filter.familyFriendly = { $in: ['yes', 'partial'] };
  if (params.accessible === 'true' || params.accessible === true) filter['accessibility.wheelchair'] = { $in: ['yes', 'partial'] };
  if (params.crowd === 'low') filter.crowdLevel = 'low';
  if (params.indoor === 'true') filter.indoor = true;
  if (params.verified === 'true') filter['verification.verifiedAt'] = { $exists: true };

  const keys = params.keywordKeys || toList(params.q).flatMap((s) => s.split(/\s+/));
  const kw = keywordClause(keys);
  if (kw) and.push(kw);

  if (and.length) filter.$and = and;
  return filter;
}

export function parseNear(query) {
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const maxKm = query.radius ? Math.min(500, Number(query.radius)) : undefined;
  return { lat, lng, maxKm, sortByDistance: query.sort === 'distance' || !query.sort };
}
