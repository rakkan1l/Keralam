import { Category } from '../models/index.js';
import { ok } from '../utils/response.js';

export async function list(req, res) {
  const filter = { active: true };
  if (req.query.type) filter.type = req.query.type;
  const items = await Category.find(filter).sort({ type: 1, order: 1 }).lean();
  return ok(res, items);
}
