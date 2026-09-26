import { Place, Business, Stay, TransportNode } from '../models/index.js';
import { NEARBY_CATEGORIES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { smartSearch, suggest } from '../services/search/searchService.js';
import { getTrending } from '../services/trendingService.js';
import { geoList, CARD_PROJECTION } from '../services/geoQuery.js';
import { publicFilter } from './helpers.js';
import { getWeather } from '../services/weatherService.js';
import { isValidLngLat } from '../utils/geo.js';

const COLLECTIONS = { place: Place, business: Business, stay: Stay, transport: TransportNode };

export async function search(req, res) {
  const lat = req.query.lat !== undefined ? Number(req.query.lat) : undefined;
  const lng = req.query.lng !== undefined ? Number(req.query.lng) : undefined;
  const data = await smartSearch({ q: String(req.query.q || '').slice(0, 200), lat, lng, limit: Math.min(20, Number(req.query.limit) || 8), userId: req.user?._id });
  return ok(res, data);
}

export async function suggestions(req, res) {
  const q = String(req.query.q || '').slice(0, 80);
  if (q.trim().length < 2) return ok(res, []);
  return ok(res, await suggest(q));
}

export async function trending(req, res) {
  const type = ['places', 'events', 'cafes', 'food', 'seasonal'].includes(req.query.type) ? req.query.type : 'places';
  return ok(res, await getTrending({ type, limit: Math.min(20, Number(req.query.limit) || 8), district: req.query.district }));
}

/** GET /nearby?lat=&lng=&category=hospitals&radius=10 */
export async function nearby(req, res) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!isValidLngLat(lng, lat)) throw ApiError.badRequest('Valid lat and lng are required');
  const category = req.query.category || 'attractions';
  const def = NEARBY_CATEGORIES[category];
  if (!def) throw ApiError.badRequest(`Unknown category. Use one of: ${Object.keys(NEARBY_CATEGORIES).join(', ')}`);
  const radius = Math.min(100, Math.max(1, Number(req.query.radius) || 15));
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const Model = COLLECTIONS[def.collection];
  const { items } = await geoList(Model, { ...publicFilter, ...(def.filter || {}) }, { near: { lat, lng, maxKm: radius }, limit, project: CARD_PROJECTION });
  return ok(res, items.map((i) => ({ ...i, targetType: def.collection })), { category, radius, count: items.length });
}

export async function weather(req, res) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!isValidLngLat(lng, lat)) throw ApiError.badRequest('Valid lat and lng are required');
  return ok(res, await getWeather(lat, lng));
}
