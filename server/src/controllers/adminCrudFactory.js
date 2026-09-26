import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/response.js';
import { getPagination, pageMeta, escapeRegex } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slugify.js';
import { clearTrendingCache } from '../services/trendingService.js';

/**
 * Generic admin CRUD for a content model. Content creation/editing is open to editors;
 * status (verification/publishing) changes go through `setStatus`, which is admin-only
 * (enforced in the router).
 */
export function createAdminCrud(Model, { schema, nameField = 'name', hasSlug = true, hasWorkflow = true, searchFields, defaultSort = { updatedAt: -1 }, check } = {}) {
  const fields = searchFields || [nameField];
  const updateSchema = typeof schema.partial === 'function' ? schema.partial() : schema;

  async function list(req, res) {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.kind) filter.kind = req.query.kind;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter[Model.schema.path('category') ? 'category' : 'categories'] = req.query.category;
    if (req.query.lang) filter.lang = req.query.lang;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q), 'i');
      filter.$or = fields.map((f) => ({ [f]: rx }));
    }
    const [items, total] = await Promise.all([
      Model.find(filter, { searchKeys: 0 }).sort(defaultSort).skip(skip).limit(limit).lean(),
      Model.countDocuments(filter),
    ]);
    return ok(res, items, pageMeta({ page, limit }, total));
  }

  async function get(req, res) {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) throw ApiError.notFound();
    return ok(res, doc);
  }

  function parse(body, partial) {
    const result = (partial ? updateSchema : schema).safeParse(body);
    if (!result.success) {
      throw ApiError.badRequest(
        'Validation failed',
        result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      );
    }
    return result.data;
  }

  async function create(req, res) {
    const data = parse(req.body, false);
    if (hasSlug) data.slug = await uniqueSlug(Model, data.slug || data[nameField]);
    if (hasWorkflow) {
      data.createdBy = req.user._id;
      data.updatedBy = req.user._id;
      data.status = 'draft';
    }
    const problems = check?.(data);
    if (problems) throw ApiError.badRequest('Validation failed', problems);
    const doc = await Model.create(data);
    clearTrendingCache();
    return created(res, doc);
  }

  async function update(req, res) {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    const data = parse(req.body, true);
    if (hasSlug && data.slug !== undefined) data.slug = await uniqueSlug(Model, data.slug || data[nameField] || doc[nameField], doc._id);
    doc.set(data);
    const problems = check?.(doc);
    if (problems) throw ApiError.badRequest('Validation failed', problems);
    if (hasWorkflow) {
      doc.updatedBy = req.user._id;
      // Editing verified/published content by a non-admin sends it back for re-verification.
      if (req.user.role !== 'admin' && ['verified', 'published'].includes(doc.status)) doc.status = 'needs_verification';
    }
    await doc.save();
    clearTrendingCache();
    return ok(res, doc);
  }

  async function remove(req, res) {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    if (hasWorkflow && req.query.hard !== 'true') {
      doc.status = 'archived';
      await doc.save();
      return ok(res, { archived: true, id: doc._id });
    }
    await doc.deleteOne();
    clearTrendingCache();
    return ok(res, { deleted: true, id: doc._id });
  }

  async function setStatus(req, res) {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    const { status, note, markVerified } = req.body;
    doc.status = status;
    if (status === 'verified' || markVerified) {
      doc.verification = { verifiedAt: new Date(), verifiedBy: req.user._id, notes: note };
    } else if (note) {
      doc.verification = { ...(doc.verification?.toObject?.() || {}), notes: note };
    }
    doc.updatedBy = req.user._id;
    await doc.save();
    clearTrendingCache();
    return ok(res, doc);
  }

  async function setFeatured(req, res) {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    if (typeof req.body.featured === 'boolean') doc.featured = req.body.featured;
    if (Number.isInteger(req.body.editorialRank)) doc.editorialRank = Math.max(0, Math.min(1000, req.body.editorialRank));
    await doc.save();
    clearTrendingCache();
    return ok(res, doc);
  }

  return { list, get, create, update, remove, setStatus, setFeatured };
}
