import { User } from '../models/User.js';
import { TARGET_MODELS } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { track } from '../services/analyticsService.js';

const CARD_FIELDS = 'name title slug district images kind type category categories shortDescription startDate endDate location isDemo status rating priceRange priceBand hiddenGem verification.verifiedAt';

/** Resolve [{targetType, targetId}] into card documents, preserving order. */
export async function hydrate(refs) {
  const byType = {};
  for (const r of refs) (byType[r.targetType] ||= []).push(r.targetId);
  const docs = new Map();
  await Promise.all(
    Object.entries(byType).map(async ([type, ids]) => {
      const Model = TARGET_MODELS[type];
      if (!Model) return;
      const found = await Model.find({ _id: { $in: ids } }).select(CARD_FIELDS).lean();
      for (const d of found) docs.set(`${type}:${d._id}`, { ...d, targetType: type });
    }),
  );
  return refs.map((r) => ({ ...r, item: docs.get(`${r.targetType}:${r.targetId}`) || null })).filter((r) => r.item);
}

export async function updateProfile(req, res) {
  const { preferences, ...rest } = req.body;
  req.user.set(rest);
  if (preferences) req.user.preferences = { ...req.user.preferences.toObject(), ...preferences };
  await req.user.save();
  return ok(res, { user: req.user.toSafeJSON(), trustedContacts: req.user.trustedContacts });
}

export async function getProfile(req, res) {
  return ok(res, { user: req.user.toSafeJSON(), trustedContacts: req.user.trustedContacts });
}

export async function changePassword(req, res) {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw ApiError.badRequest('Current password is incorrect');
  user.password = req.body.newPassword;
  await user.save();
  return ok(res, { changed: true });
}

export async function listSaved(req, res) {
  const refs = req.user.saved.map((s) => ({ targetType: s.targetType, targetId: s.targetId, savedAt: s.savedAt })).reverse();
  return ok(res, await hydrate(refs));
}

export async function savedIds(req, res) {
  return ok(res, req.user.saved.map((s) => `${s.targetType}:${s.targetId}`));
}

async function assertTarget(targetType, targetId) {
  const Model = TARGET_MODELS[targetType];
  if (!Model || !(await Model.exists({ _id: targetId }))) throw ApiError.notFound('Item not found');
  return Model;
}

export async function save(req, res) {
  const { targetType, targetId } = req.body;
  const Model = await assertTarget(targetType, targetId);
  const exists = req.user.saved.some((s) => s.targetType === targetType && String(s.targetId) === targetId);
  if (!exists) {
    req.user.saved.push({ targetType, targetId });
    await req.user.save();
    await Model.updateOne({ _id: targetId }, { $inc: { 'stats.saves': 1 } });
    track('save', { targetType, targetId, user: req.user._id });
  }
  return ok(res, { saved: true });
}

export async function unsave(req, res) {
  const { targetType, targetId } = req.params;
  const before = req.user.saved.length;
  req.user.saved = req.user.saved.filter((s) => !(s.targetType === targetType && String(s.targetId) === targetId));
  if (req.user.saved.length !== before) {
    await req.user.save();
    const Model = TARGET_MODELS[targetType];
    if (Model) await Model.updateOne({ _id: targetId, 'stats.saves': { $gt: 0 } }, { $inc: { 'stats.saves': -1 } });
    track('unsave', { targetType, targetId, user: req.user._id });
  }
  return ok(res, { saved: false });
}

/** Merge items saved while browsing as a guest (localStorage) into the account. */
export async function syncSaved(req, res) {
  const existing = new Set(req.user.saved.map((s) => `${s.targetType}:${s.targetId}`));
  let added = 0;
  for (const { targetType, targetId } of req.body.items) {
    const key = `${targetType}:${targetId}`;
    if (existing.has(key)) continue;
    const Model = TARGET_MODELS[targetType];
    if (!Model || !(await Model.exists({ _id: targetId }))) continue;
    req.user.saved.push({ targetType, targetId });
    existing.add(key);
    added++;
  }
  if (added) await req.user.save();
  return ok(res, { added, total: req.user.saved.length });
}

export async function recent(req, res) {
  const refs = [...req.user.recentlyViewed].reverse().map((r) => ({ targetType: r.targetType, targetId: r.targetId, viewedAt: r.viewedAt }));
  return ok(res, await hydrate(refs));
}
