import * as C from '../config/constants.js';
import { features, env } from '../config/env.js';
import { ok } from '../utils/response.js';
import { uploadBuffer } from '../services/uploadService.js';
import { ApiError } from '../utils/ApiError.js';
import { Place, Event, District } from '../models/index.js';

export function meta(_req, res) {
  res.set('Cache-Control', 'public, max-age=300');
  return ok(res, {
    districts: C.DISTRICTS,
    placeCategories: C.PLACE_CATEGORIES,
    moods: C.MOODS,
    timeBuckets: Object.keys(C.TIME_BUCKETS),
    budgetLevels: C.BUDGET_LEVELS,
    businessSections: C.BUSINESS_SECTIONS,
    foodCategories: C.FOOD_CATEGORIES,
    dietaryTags: C.DIETARY_TAGS,
    priceBands: C.PRICE_BANDS,
    stayTypes: C.STAY_TYPES,
    travellerTypes: C.TRAVELLER_TYPES,
    stayExperiences: C.STAY_EXPERIENCES,
    eventCategories: C.EVENT_CATEGORIES,
    ticketStatuses: C.TICKET_STATUSES,
    transportKinds: C.TRANSPORT_KINDS,
    nearbyCategories: Object.keys(C.NEARBY_CATEGORIES),
    contentStatuses: C.CONTENT_STATUSES,
    reportKinds: C.REPORT_KINDS,
    updateKinds: C.UPDATE_KINDS,
    languages: C.LANGUAGES,
    features: {
      uploads: features.uploads,
      ai: features.ai,
      liveRouting: features.liveRouting,
      weather: features.weather,
    },
  });
}

export async function upload(req, res) {
  if (!req.file) throw ApiError.badRequest('No image file received (field name: "image")');
  const result = await uploadBuffer(req.file.buffer, { folder: `kerala-travel/${req.user.role === 'user' ? 'community' : 'content'}` });
  return ok(res, result);
}

export async function sitemap(_req, res) {
  const base = env.clientUrls[0].replace(/\/$/, '');
  const [places, events, districts] = await Promise.all([
    Place.find({ status: { $in: C.PUBLIC_STATUSES } }, { slug: 1, updatedAt: 1 }).lean(),
    Event.find({ status: { $in: C.PUBLIC_STATUSES }, endDate: { $gte: new Date() } }, { slug: 1, updatedAt: 1 }).lean(),
    District.find({}, { slug: 1, updatedAt: 1 }).lean(),
  ]);
  const staticPaths = ['/', '/explore', '/hidden-gems', '/food', '/stays', '/events', '/shopping', '/theatres', '/activities', '/districts', '/help', '/directions'];
  const url = (loc, lastmod) => `<url><loc>${base}${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticPaths.map((p) => url(p)),
    ...districts.map((d) => url(`/districts/${d.slug}`, d.updatedAt)),
    ...places.map((p) => url(`/places/${p.slug}`, p.updatedAt)),
    ...events.map((e) => url(`/events/${e.slug}`, e.updatedAt)),
    '</urlset>',
  ].join('');
  res.type('application/xml').send(xml);
}
