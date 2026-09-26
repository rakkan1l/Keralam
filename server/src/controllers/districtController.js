import { District, Place, Business, Stay, Event, TransportNode, Dish } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { publicFilter } from './helpers.js';
import { CARD_PROJECTION } from '../services/geoQuery.js';
import { FOOD_KINDS } from '../config/constants.js';

export async function list(_req, res) {
  const [districts, counts] = await Promise.all([
    District.find({}, { intro: 0, introMl: 0, sources: 0 }).lean(),
    Place.aggregate([{ $match: publicFilter }, { $group: { _id: '$district', n: { $sum: 1 } } }]),
  ]);
  const byDistrict = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const order = ['thiruvananthapuram', 'kollam', 'pathanamthitta', 'alappuzha', 'kottayam', 'idukki', 'ernakulam', 'thrissur', 'palakkad', 'malappuram', 'kozhikode', 'wayanad', 'kannur', 'kasaragod'];
  districts.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  return ok(res, districts.map((d) => ({ ...d, placeCount: byDistrict[d.slug] || 0 })));
}

export async function detail(req, res) {
  const district = await District.findOne({ slug: req.params.slug }).lean();
  if (!district) throw ApiError.notFound('District not found');
  const slug = district.slug;
  const now = new Date();
  const base = { ...publicFilter, district: slug };
  const [popular, hiddenGems, restaurants, events, stays, transport, services, neighbours, dishes] = await Promise.all([
    Place.find({ ...base, hiddenGem: { $ne: true } }, CARD_PROJECTION).sort({ featured: -1, 'stats.views': -1 }).limit(8).lean(),
    Place.find({ ...base, hiddenGem: true }, CARD_PROJECTION).sort({ 'stats.views': -1 }).limit(6).lean(),
    Business.find({ ...base, kind: { $in: FOOD_KINDS } }, CARD_PROJECTION).sort({ featured: -1, 'rating.average': -1 }).limit(6).lean(),
    Event.find({ ...base, endDate: { $gte: now } }, CARD_PROJECTION).sort({ startDate: 1 }).limit(6).lean(),
    Stay.find(base, CARD_PROJECTION).sort({ featured: -1 }).limit(6).lean(),
    TransportNode.find({ ...base }, { searchKeys: 0 }).limit(20).lean(),
    Business.find({ ...base, kind: { $in: ['hospital', 'pharmacy', 'police'] } }, CARD_PROJECTION).limit(10).lean(),
    District.find({ slug: { $in: district.neighbours || [] } }, { slug: 1, name: 1, nameMl: 1, tagline: 1, heroImage: 1 }).lean(),
    Dish.find({ ...publicFilter, region: { $in: [district.name, 'Statewide', ...(['kozhikode', 'malappuram', 'kannur', 'kasaragod', 'wayanad'].includes(slug) ? ['Malabar'] : ['Central Kerala', 'South Kerala'])] } }, CARD_PROJECTION)
      .limit(6)
      .lean(),
  ]);
  return ok(res, { district, popular, hiddenGems, restaurants, events, stays, transport, services, neighbours, dishes });
}
