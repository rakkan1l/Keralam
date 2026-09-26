import { Business, Dish } from '../models/index.js';
import { BUSINESS_SECTIONS } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pageMeta, toList } from '../utils/pagination.js';
import { keywordClause, parseNear } from '../services/placeQuery.js';
import { geoList, CARD_PROJECTION } from '../services/geoQuery.js';
import { recordView, detailExtras, publicFilter } from './helpers.js';

/**
 * GET /businesses?section=food|shopping|theatres|activities|services&kind=&district=
 *   &foodCategory=&price=&language=&lateNight=&q=&lat=&lng=&radius=
 */
export async function list(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 60 });
  const filter = { ...publicFilter };
  const kinds = toList(req.query.kind);
  if (kinds.length) filter.kind = { $in: kinds };
  else if (BUSINESS_SECTIONS[req.query.section]) filter.kind = { $in: BUSINESS_SECTIONS[req.query.section] };
  const districts = toList(req.query.district);
  if (districts.length) filter.district = { $in: districts };
  const foodCats = toList(req.query.foodCategory);
  if (foodCats.length) filter['food.categories'] = { $in: foodCats };
  const prices = toList(req.query.price);
  if (prices.length) filter.priceRange = { $in: prices };
  if (req.query.language) filter['theatre.languages'] = new RegExp(`^${req.query.language.replace(/[^a-z]/gi, '')}$`, 'i');
  if (req.query.lateNight === 'true') filter['food.lateNight'] = true;
  if (req.query.dietary) filter['food.dietary'] = { $in: toList(req.query.dietary) };
  if (req.query.accessible === 'true') filter['accessibility.wheelchair'] = { $in: ['yes', 'partial'] };
  const kw = keywordClause(toList(req.query.q).flatMap((s) => s.split(/\s+/)));
  if (kw) Object.assign(filter, kw);

  const sort = req.query.sort === 'rating' ? { 'rating.average': -1 } : { featured: -1, 'stats.views': -1, name: 1 };
  const { items, total } = await geoList(Business, filter, { near: parseNear(req.query), sort, skip, limit, project: CARD_PROJECTION });
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function detail(req, res) {
  const business = await Business.findOne({ slug: req.params.slug, ...publicFilter }, { searchKeys: 0 })
    .populate('food.signatureDishes', 'name slug images')
    .lean();
  if (!business) throw ApiError.notFound('Listing not found');
  recordView(Business, business, 'business', req);
  const [extras, nearby] = await Promise.all([
    detailExtras('business', business),
    Business.find(
      { ...publicFilter, _id: { $ne: business._id }, kind: business.kind, location: { $near: { $geometry: business.location, $maxDistance: 20000 } } },
      CARD_PROJECTION,
    )
      .limit(4)
      .lean(),
  ]);
  return ok(res, { business, ...extras, nearby });
}

export async function dishes(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 24, maxLimit: 60 });
  const filter = { ...publicFilter };
  const cats = toList(req.query.category);
  if (cats.length) filter.categories = { $in: cats };
  if (req.query.region) filter.region = req.query.region;
  if (req.query.dietary) filter.dietary = { $in: toList(req.query.dietary) };
  const kw = keywordClause(toList(req.query.q).flatMap((s) => s.split(/\s+/)));
  if (kw) Object.assign(filter, kw);
  const [items, total] = await Promise.all([
    Dish.find(filter, CARD_PROJECTION).sort({ featured: -1, name: 1 }).skip(skip).limit(limit).lean(),
    Dish.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function dishDetail(req, res) {
  const dish = await Dish.findOne({ slug: req.params.slug, ...publicFilter }, { searchKeys: 0 }).lean();
  if (!dish) throw ApiError.notFound('Dish not found');
  recordView(Dish, dish, 'dish', req);
  const places = await Business.find(
    {
      ...publicFilter,
      $or: [{ _id: { $in: dish.recommendedPlaces || [] } }, { 'food.signatureDishes': dish._id }, ...(dish.categories?.length ? [{ 'food.categories': { $in: dish.categories } }] : [])],
    },
    CARD_PROJECTION,
  )
    .limit(8)
    .lean();
  return ok(res, { dish, places });
}
