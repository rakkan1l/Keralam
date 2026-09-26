import { Event } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pageMeta, toList } from '../utils/pagination.js';
import { keywordClause } from '../services/placeQuery.js';
import { CARD_PROJECTION } from '../services/geoQuery.js';
import { track } from '../services/analyticsService.js';
import { recordView, detailExtras, publicFilter } from './helpers.js';

/** Date window for the "when" filter, computed in India Standard Time. */
export function eventWindow(when, now = new Date()) {
  const IST = 5.5 * 3600 * 1000;
  const local = new Date(now.getTime() + IST);
  const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - IST);
  const today = startOfDay(local);
  const day = 24 * 3600 * 1000;
  switch (when) {
    case 'today':
      return { from: today, to: new Date(today.getTime() + day) };
    case 'weekend': {
      const dow = local.getUTCDay(); // 0 Sun … 6 Sat
      const toSat = dow === 0 ? -1 : 6 - dow;
      const sat = new Date(today.getTime() + toSat * day);
      return { from: dow === 0 ? today : sat, to: new Date(sat.getTime() + 2 * day) };
    }
    case 'week':
      return { from: now, to: new Date(today.getTime() + 7 * day) };
    case 'month':
      return { from: now, to: new Date(today.getTime() + 31 * day) };
    default:
      return { from: now, to: null };
  }
}

/** GET /events?when=today|weekend|week|month|upcoming|past&district=&category=&free=&q= */
export async function list(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 60 });
  const filter = { ...publicFilter };
  const when = req.query.when || 'upcoming';
  let sort = { startDate: 1 };
  if (when === 'past') {
    filter.endDate = { $lt: new Date() };
    sort = { startDate: -1 };
  } else {
    // Expired events never appear in upcoming results.
    const { from, to } = eventWindow(when);
    filter.endDate = { $gte: from };
    if (to) filter.startDate = { $lt: to };
  }
  const districts = toList(req.query.district);
  if (districts.length) filter.district = { $in: districts };
  const cats = toList(req.query.category);
  if (cats.length) filter.category = { $in: cats };
  if (req.query.free === 'true') filter.$or = [{ 'entryFee.isFree': true }, { ticketStatus: 'free' }];
  const kw = keywordClause(toList(req.query.q).flatMap((s) => s.split(/\s+/)));
  if (kw) filter.$and = [...(filter.$and || []), kw];
  const [items, total] = await Promise.all([
    Event.find(filter, CARD_PROJECTION).sort(sort).skip(skip).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function detail(req, res) {
  const event = await Event.findOne({ slug: req.params.slug, ...publicFilter }, { searchKeys: 0 }).populate('place', 'name slug').lean();
  if (!event) throw ApiError.notFound('Event not found');
  recordView(Event, event, 'event', req);
  const [extras, related] = await Promise.all([
    detailExtras('event', event),
    Event.find({ ...publicFilter, _id: { $ne: event._id }, endDate: { $gte: new Date() }, $or: [{ district: event.district }, { category: event.category }] }, CARD_PROJECTION)
      .sort({ startDate: 1 })
      .limit(4)
      .lean(),
  ]);
  return ok(res, { event, ...extras, related, expired: new Date(event.endDate) < new Date() });
}

export async function interest(req, res) {
  const event = await Event.findOneAndUpdate({ _id: req.params.id, ...publicFilter }, { $inc: { interestCount: 1 } }, { new: true, projection: { interestCount: 1 } });
  if (!event) throw ApiError.notFound('Event not found');
  track('event_interest', { targetType: 'event', targetId: event._id, user: req.user?._id });
  return ok(res, { interestCount: event.interestCount });
}
