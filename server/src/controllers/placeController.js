import { Place, Business, Stay } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { buildPlaceFilter, parseNear, PLACE_SORTS } from '../services/placeQuery.js';
import { geoList, CARD_PROJECTION } from '../services/geoQuery.js';
import { recordView, detailExtras, publicFilter } from './helpers.js';

export async function list(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 60 });
  const filter = buildPlaceFilter(req.query);
  const near = parseNear(req.query);
  const sort = PLACE_SORTS[req.query.sort] || PLACE_SORTS.popular;
  const { items, total } = await geoList(Place, filter, { near, sort, skip, limit, project: CARD_PROJECTION });
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function mapPoints(req, res) {
  const filter = buildPlaceFilter(req.query);
  const items = await Place.find(filter, { name: 1, slug: 1, location: 1, categories: 1, district: 1, hiddenGem: 1 }).limit(500).lean();
  return ok(res, items);
}

export async function detail(req, res) {
  const place = await Place.findOne({ slug: req.params.slug, ...publicFilter }, { searchKeys: 0 }).lean();
  if (!place) throw ApiError.notFound('Destination not found');
  recordView(Place, place, 'place', req);

  const geo = (maxKm) => ({ $near: { $geometry: place.location, $maxDistance: maxKm * 1000 } });
  const [extras, nearbyPlaces, nearbyFood, nearbyStays] = await Promise.all([
    detailExtras('place', place),
    Place.find({ ...publicFilter, _id: { $ne: place._id }, location: geo(30) }, CARD_PROJECTION).limit(6).lean(),
    Business.find({ ...publicFilter, kind: { $in: ['restaurant', 'cafe', 'street-food', 'bakery'] }, location: geo(15) }, CARD_PROJECTION).limit(4).lean(),
    Stay.find({ ...publicFilter, location: geo(25) }, CARD_PROJECTION).limit(4).lean(),
  ]);
  return ok(res, { place, ...extras, nearby: { places: nearbyPlaces, food: nearbyFood, stays: nearbyStays } });
}
