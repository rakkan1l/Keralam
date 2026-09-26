import { Stay } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pageMeta, toList } from '../utils/pagination.js';
import { keywordClause, parseNear } from '../services/placeQuery.js';
import { geoList, CARD_PROJECTION } from '../services/geoQuery.js';
import { recordView, detailExtras, publicFilter } from './helpers.js';

/** GET /stays?type=&district=&price=&facility=&traveller=&experience=&accessible=&q=&lat=&lng= */
export async function list(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 60 });
  const filter = { ...publicFilter };
  const types = toList(req.query.type);
  if (types.length) filter.type = { $in: types };
  const districts = toList(req.query.district);
  if (districts.length) filter.district = { $in: districts };
  const prices = toList(req.query.price);
  if (prices.length) filter.priceBand = { $in: prices };
  const facilities = toList(req.query.facility);
  if (facilities.length) filter.facilities = { $all: facilities };
  const travellers = toList(req.query.traveller);
  if (travellers.length) filter.travellerTypes = { $in: travellers };
  const experiences = toList(req.query.experience);
  if (experiences.length) filter.experiences = { $in: experiences };
  if (req.query.accessible === 'true') filter['accessibility.wheelchair'] = { $in: ['yes', 'partial'] };
  const kw = keywordClause(toList(req.query.q).flatMap((s) => s.split(/\s+/)));
  if (kw) Object.assign(filter, kw);
  const { items, total } = await geoList(Stay, filter, {
    near: parseNear(req.query),
    sort: { featured: -1, 'rating.average': -1, name: 1 },
    skip,
    limit,
    project: CARD_PROJECTION,
  });
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function detail(req, res) {
  const stay = await Stay.findOne({ slug: req.params.slug, ...publicFilter }, { searchKeys: 0 }).lean();
  if (!stay) throw ApiError.notFound('Stay not found');
  recordView(Stay, stay, 'stay', req);
  const [extras, nearby] = await Promise.all([
    detailExtras('stay', stay),
    Stay.find({ ...publicFilter, _id: { $ne: stay._id }, location: { $near: { $geometry: stay.location, $maxDistance: 30000 } } }, CARD_PROJECTION)
      .limit(4)
      .lean(),
  ]);
  return ok(res, { stay, ...extras, nearby });
}
