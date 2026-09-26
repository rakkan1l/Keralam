import { Review, CommunityUpdate, Report, EmergencyContact, SafetyNotice, Translation } from '../models/index.js';
import { TARGET_MODELS } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/response.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { objectId } from '../validators/common.js';

async function assertTarget(targetType, targetId) {
  const Model = TARGET_MODELS[targetType];
  const doc = Model && (await Model.findById(targetId, { name: 1, title: 1 }).lean());
  if (!doc) throw ApiError.notFound('Item not found');
  return doc;
}

export async function listReviews(req, res) {
  const { targetType, targetId } = req.query;
  if (!TARGET_MODELS[targetType] || !objectId.safeParse(targetId).success) throw ApiError.badRequest('targetType and targetId are required');
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = { targetType, targetId, status: 'approved' };
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name').lean(),
    Review.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta({ page, limit }, total));
}

export async function createReview(req, res) {
  await assertTarget(req.body.targetType, req.body.targetId);
  const existing = await Review.findOne({ user: req.user._id, targetType: req.body.targetType, targetId: req.body.targetId });
  if (existing) {
    // Editing a review sends it back to moderation.
    existing.set({ ...req.body, status: 'pending' });
    await existing.save();
    return ok(res, existing);
  }
  const review = await Review.create({ ...req.body, user: req.user._id, status: 'pending' });
  return created(res, review);
}

export async function myReviews(req, res) {
  return ok(res, await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).lean());
}

export async function listUpdates(req, res) {
  const { targetType, targetId } = req.query;
  if (!TARGET_MODELS[targetType] || !objectId.safeParse(targetId).success) throw ApiError.badRequest('targetType and targetId are required');
  const items = await CommunityUpdate.find({ targetType, targetId, status: 'approved', expiresAt: { $gte: new Date() } })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('user', 'name')
    .lean();
  return ok(res, items);
}

export async function createUpdate(req, res) {
  await assertTarget(req.body.targetType, req.body.targetId);
  const update = await CommunityUpdate.create({ ...req.body, user: req.user._id });
  return created(res, update);
}

export async function createReport(req, res) {
  let targetName = req.body.targetName;
  if (req.body.targetType && req.body.targetId) {
    const doc = await assertTarget(req.body.targetType, req.body.targetId);
    targetName = doc.name || doc.title;
  }
  const report = await Report.create({ ...req.body, targetName, reporter: req.user?._id, reporterEmail: req.body.reporterEmail || req.user?.email });
  return created(res, { id: report._id, status: report.status });
}

export async function emergency(req, res) {
  const now = new Date();
  const districtFilter = req.query.district ? { $or: [{ scope: { $ne: 'district' } }, { district: req.query.district }] } : {};
  const [contacts, notices] = await Promise.all([
    EmergencyContact.find({ active: true, ...districtFilter }).sort({ order: 1, name: 1 }).lean(),
    SafetyNotice.find({
      active: true,
      validFrom: { $lte: now },
      $or: [{ validUntil: null }, { validUntil: { $exists: false } }, { validUntil: { $gte: now } }],
      ...(req.query.district ? { district: req.query.district } : {}),
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
  ]);
  return ok(res, { contacts, notices });
}

export async function translations(req, res) {
  const rows = await Translation.find({ lang: req.params.lang }).lean();
  const out = {};
  for (const r of rows) {
    (out[r.namespace] ||= {})[r.key] = r.value;
  }
  res.set('Cache-Control', 'public, max-age=300');
  return ok(res, out);
}
