import mongoose from 'mongoose';
import {
  Place,
  Business,
  Stay,
  Event,
  Dish,
  User,
  Review,
  Report,
  CommunityUpdate,
  AnalyticsEvent,
  KnowledgeNote,
  Trip,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pageMeta, escapeRegex } from '../utils/pagination.js';
import { refreshRating } from '../services/ratingService.js';
import { features } from '../config/env.js';
import { PUBLIC_STATUSES } from '../config/constants.js';

const since = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

export async function overview(_req, res) {
  const [totalPlaces, published, pendingVerification, users, events, reviews, pendingReviews, openReports, recentReports, searches, zeroResults, statusBreakdown] = await Promise.all([
    Place.countDocuments(),
    Place.countDocuments({ status: 'published' }),
    Place.countDocuments({ status: { $in: ['needs_verification', 'needs_update'] } }),
    User.countDocuments(),
    Event.countDocuments({ status: { $ne: 'archived' } }),
    Review.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: { $in: ['open', 'in_review'] } }),
    Report.find().sort({ createdAt: -1 }).limit(6).lean(),
    AnalyticsEvent.countDocuments({ type: 'search', createdAt: { $gte: since(7) } }),
    AnalyticsEvent.countDocuments({ type: 'zero_result_search', createdAt: { $gte: since(7) } }),
    Place.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  return ok(res, {
    totals: { totalPlaces, published, pendingVerification, users, events, reviews, pendingReviews, openReports },
    searchActivity: { last7Days: searches, zeroResultLast7Days: zeroResults },
    statusBreakdown: Object.fromEntries(statusBreakdown.map((s) => [s._id, s.n])),
    recentReports,
  });
}

export async function analytics(req, res) {
  const days = Math.min(180, Math.max(1, Number(req.query.days) || 30));
  const from = since(days);
  const [byType, daily, topSearches, zeroResultSearches, topViewed] = await Promise.all([
    AnalyticsEvent.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: '$type', n: { $sum: 1 } } }]),
    AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { d: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, t: '$type' }, n: { $sum: 1 } } },
      { $sort: { '_id.d': 1 } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { type: 'search', createdAt: { $gte: from } } },
      { $group: { _id: { $toLower: '$query' }, n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 15 },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { type: 'zero_result_search', createdAt: { $gte: from } } },
      { $group: { _id: { $toLower: '$query' }, n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 15 },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { type: 'view', targetType: 'place', createdAt: { $gte: from } } },
      { $group: { _id: '$targetId', n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'places', localField: '_id', foreignField: '_id', as: 'place', pipeline: [{ $project: { name: 1, slug: 1, district: 1 } }] } },
      { $unwind: '$place' },
    ]),
  ]);
  return ok(res, {
    days,
    totals: Object.fromEntries(byType.map((t) => [t._id, t.n])),
    daily: daily.map((d) => ({ date: d._id.d, type: d._id.t, count: d.n })),
    topSearches: topSearches.map((s) => ({ query: s._id, count: s.n })),
    zeroResultSearches: zeroResultSearches.map((s) => ({ query: s._id, count: s.n })),
    topViewed: topViewed.map((v) => ({ ...v.place, views: v.n })),
  });
}

// ---- Reports ----
export async function listReports(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.kind) filter.kind = req.query.kind;
  const [items, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('reporter', 'name email').lean(),
    Report.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function updateReport(req, res) {
  const { status, note } = req.body;
  if (!['open', 'in_review', 'resolved', 'dismissed'].includes(status)) throw ApiError.badRequest('Invalid status');
  const report = await Report.findByIdAndUpdate(req.params.id, { status, resolution: { by: req.user._id, at: new Date(), note } }, { new: true });
  if (!report) throw ApiError.notFound();
  return ok(res, report);
}

// ---- Moderation ----
export async function listReviews(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const filter = { status: req.query.status || 'pending' };
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    Review.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function moderateReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound();
  review.status = req.body.status;
  review.moderation = { by: req.user._id, at: new Date(), note: req.body.note };
  await review.save();
  await refreshRating(review.targetType, review.targetId);
  return ok(res, review);
}

export async function listUpdates(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    CommunityUpdate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    CommunityUpdate.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function moderateUpdate(req, res) {
  const update = await CommunityUpdate.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!update) throw ApiError.notFound();
  return ok(res, update);
}

// ---- Users ----
export async function listUsers(req, res) {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter, { name: 1, email: 1, role: 1, isActive: 1, createdAt: 1, lastLoginAt: 1, contributor: 1 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function updateUser(req, res) {
  if (String(req.params.id) === String(req.user._id) && (req.body.role || req.body.isActive === false)) {
    throw ApiError.badRequest('You cannot change your own role or disable your own account');
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound();
  return ok(res, user.toSafeJSON());
}

// ---- AI knowledge readiness ----
export async function aiReadiness(_req, res) {
  const pub = { status: { $in: PUBLIC_STATUSES } };
  const [places, verifiedPlaces, withHours, withFees, notes, approvedNotes, demoPlaces, trips] = await Promise.all([
    Place.countDocuments(pub),
    Place.countDocuments({ ...pub, 'verification.verifiedAt': { $exists: true } }),
    Place.countDocuments({ ...pub, 'openingHours.verified': true }),
    Place.countDocuments({ ...pub, 'entryFee.verified': true }),
    KnowledgeNote.countDocuments(),
    KnowledgeNote.countDocuments({ approved: true }),
    Place.countDocuments({ ...pub, isDemo: true }),
    Trip.countDocuments(),
  ]);
  const [food, stays, dishes] = await Promise.all([Business.countDocuments(pub), Stay.countDocuments(pub), Dish.countDocuments(pub)]);
  return ok(res, {
    provider: features.ai ? 'anthropic' : 'none (demo planner active)',
    retrievableRecords: { places, food, stays, dishes, approvedNotes },
    verification: { verifiedPlaces, withVerifiedHours: withHours, withVerifiedFees: withFees, demoPlaces },
    knowledgeNotes: { total: notes, approved: approvedNotes },
    savedTrips: trips,
    dbConnected: mongoose.connection.readyState === 1,
  });
}
