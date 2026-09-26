import { UserList } from '../models/UserList.js';
import { TARGET_MODELS } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/response.js';
import { randomToken } from '../utils/slugify.js';
import { hydrate } from './meController.js';

async function ownList(req) {
  const list = await UserList.findOne({ _id: req.params.id, user: req.user._id });
  if (!list) throw ApiError.notFound('List not found');
  return list;
}

export async function mine(req, res) {
  const lists = await UserList.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();
  return ok(res, lists);
}

export async function create(req, res) {
  const list = await UserList.create({ ...req.body, user: req.user._id, shareSlug: req.body.isPublic ? randomToken(12) : undefined });
  return created(res, list);
}

export async function get(req, res) {
  const list = await ownList(req);
  return ok(res, { ...list.toObject(), items: await hydrate(list.items.map((i) => i.toObject())) });
}

export async function update(req, res) {
  const list = await ownList(req);
  list.set(req.body);
  if (list.isPublic && !list.shareSlug) list.shareSlug = randomToken(12);
  await list.save();
  return ok(res, list);
}

export async function remove(req, res) {
  const list = await ownList(req);
  await list.deleteOne();
  return ok(res, { deleted: true });
}

export async function addItem(req, res) {
  const list = await ownList(req);
  const { targetType, targetId, note } = req.body;
  if (!(await TARGET_MODELS[targetType].exists({ _id: targetId }))) throw ApiError.notFound('Item not found');
  if (!list.items.some((i) => i.targetType === targetType && String(i.targetId) === targetId)) {
    if (list.items.length >= 200) throw ApiError.badRequest('A list can hold up to 200 items');
    list.items.push({ targetType, targetId, note });
    await list.save();
  }
  return ok(res, list);
}

export async function removeItem(req, res) {
  const list = await ownList(req);
  list.items = list.items.filter((i) => !(i.targetType === req.params.targetType && String(i.targetId) === req.params.targetId));
  await list.save();
  return ok(res, list);
}

export async function shared(req, res) {
  const list = await UserList.findOne({ shareSlug: req.params.slug, isPublic: true }).populate('user', 'name').lean();
  if (!list) throw ApiError.notFound('This list is private or no longer exists');
  return ok(res, { name: list.name, description: list.description, owner: list.user?.name, items: await hydrate(list.items) });
}
