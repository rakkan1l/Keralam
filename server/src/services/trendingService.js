import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { Place, Business, Event } from '../models/index.js';
import { PUBLIC_STATUSES } from '../config/constants.js';

/**
 * Trending score = recent views + 3×saves + 2×event interest + search hits on the name,
 * plus an editorial boost for featured content. Social-media popularity is not an input.
 */
const WEIGHTS = { view: 1, save: 3, event_interest: 2 };
const EDITORIAL_BOOST = 25;
const WINDOW_DAYS = 14;
const CACHE_MS = 5 * 60 * 1000;

const cache = new Map();

export function clearTrendingCache() {
  cache.clear();
}

async function recentScores(targetType) {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000);
  const rows = await AnalyticsEvent.aggregate([
    { $match: { targetType, createdAt: { $gte: since }, type: { $in: Object.keys(WEIGHTS) } } },
    {
      $group: {
        _id: '$targetId',
        score: {
          $sum: {
            $switch: {
              branches: Object.entries(WEIGHTS).map(([type, w]) => ({ case: { $eq: ['$type', type] }, then: w })),
              default: 0,
            },
          },
        },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.score]));
}

async function searchHits() {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000);
  const rows = await AnalyticsEvent.aggregate([
    { $match: { type: 'search', createdAt: { $gte: since } } },
    { $group: { _id: { $toLower: '$query' }, n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 50 },
  ]);
  return rows;
}

function rank(docs, scores, hits, nameField = 'name') {
  return docs
    .map((d) => {
      const name = String(d[nameField] || '').toLowerCase();
      const searchScore = hits.reduce((s, h) => (h._id && name.includes(h._id) ? s + h.n : s), 0);
      const score = (scores.get(String(d._id)) || 0) + searchScore + (d.featured ? EDITORIAL_BOOST : 0) + (d.editorialRank || 0);
      return { ...d, trendingScore: score };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

export async function getTrending({ type = 'places', limit = 8, district } = {}) {
  const key = `${type}:${limit}:${district || ''}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const base = { status: { $in: PUBLIC_STATUSES }, ...(district ? { district } : {}) };
  const projection = { searchKeys: 0, description: 0, descriptionMl: 0, sources: 0 };
  let data;
  const hits = await searchHits();
  if (type === 'events') {
    const docs = await Event.find({ ...base, endDate: { $gte: new Date() } }, projection).limit(100).lean();
    data = rank(docs, await recentScores('event'), hits, 'title');
    data = data.map((d) => ({ ...d, trendingScore: d.trendingScore + (d.interestCount || 0) }));
  } else if (type === 'cafes' || type === 'food') {
    const kinds = type === 'cafes' ? ['cafe'] : ['restaurant', 'cafe', 'street-food', 'bakery'];
    const docs = await Business.find({ ...base, kind: { $in: kinds } }, projection).limit(100).lean();
    data = rank(docs, await recentScores('business'), hits);
  } else if (type === 'seasonal') {
    const month = new Date().getMonth() + 1;
    const docs = await Place.find({ ...base, bestMonths: month }, projection).limit(100).lean();
    data = rank(docs, await recentScores('place'), hits);
  } else {
    const docs = await Place.find(base, projection).limit(200).lean();
    data = rank(docs, await recentScores('place'), hits);
  }
  data = data.slice(0, limit);
  cache.set(key, { data, expires: Date.now() + CACHE_MS });
  return data;
}
