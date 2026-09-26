import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAdminCrud } from '../controllers/adminCrudFactory.js';
import * as admin from '../controllers/adminController.js';
import * as V from '../validators/content.js';
import { moderationSchema, roleSchema } from '../validators/user.js';
import {
  Place,
  Business,
  Dish,
  Stay,
  Event,
  District,
  TransportNode,
  RouteStop,
  SafetyNotice,
  EmergencyContact,
  Translation,
  KnowledgeNote,
  Category,
} from '../models/index.js';
import { z } from 'zod';

const r = Router();
r.use(requireAuth, requireRole('editor', 'admin'));
const adminOnly = requireRole('admin');

/**
 * Resource registry. `workflow: true` resources carry the content status workflow;
 * their status changes are admin-only. `adminOnly: true` resources can only be
 * edited by admins (emergency info, translations, AI knowledge).
 */
const RESOURCES = {
  places: { Model: Place, schema: V.placeSchema, searchFields: ['name', 'alternateNames', 'locality'] },
  businesses: { Model: Business, schema: V.businessSchema },
  dishes: { Model: Dish, schema: V.dishSchema },
  stays: { Model: Stay, schema: V.staySchema },
  events: { Model: Event, schema: V.eventSchema, nameField: 'title', defaultSort: { startDate: -1 }, check: V.checkEventDates },
  transport: { Model: TransportNode, schema: V.transportSchema },
  'route-stops': { Model: RouteStop, schema: V.routeStopSchema },
  districts: { Model: District, schema: V.districtSchema, hasSlug: false, hasWorkflow: false, noCreate: true },
  'safety-notices': { Model: SafetyNotice, schema: V.safetyNoticeSchema, nameField: 'title', hasSlug: false, hasWorkflow: false, adminOnly: true },
  'emergency-contacts': { Model: EmergencyContact, schema: V.emergencyContactSchema, hasSlug: false, hasWorkflow: false, adminOnly: true, defaultSort: { order: 1 } },
  translations: { Model: Translation, schema: V.translationSchema, nameField: 'key', hasSlug: false, hasWorkflow: false, adminOnly: true, searchFields: ['key', 'value'] },
  knowledge: { Model: KnowledgeNote, schema: V.knowledgeNoteSchema, nameField: 'title', hasSlug: false, hasWorkflow: false, adminOnly: true, searchFields: ['title', 'body'] },
  categories: {
    Model: Category,
    schema: z.object({
      slug: z.string().min(1).max(60),
      type: z.enum(['place', 'food', 'business', 'stay', 'event', 'mood']),
      name: z.string().min(1).max(80),
      nameMl: z.string().max(120).optional(),
      description: z.string().max(500).optional(),
      icon: z.string().max(40).optional(),
      order: z.number().int().optional(),
      active: z.boolean().optional(),
    }),
    hasSlug: false,
    hasWorkflow: false,
  },
};

// Dashboard & analytics
r.get('/overview', admin.overview);
r.get('/analytics', admin.analytics);
r.get('/ai', admin.aiReadiness);

// Reports & moderation
r.get('/reports', admin.listReports);
r.patch('/reports/:id', admin.updateReport);
r.get('/reviews', admin.listReviews);
r.patch('/reviews/:id', validate(moderationSchema), admin.moderateReview);
r.get('/community-updates', admin.listUpdates);
r.patch('/community-updates/:id', validate(moderationSchema), admin.moderateUpdate);

// Users (admin only)
r.get('/users', adminOnly, admin.listUsers);
r.patch('/users/:id', adminOnly, validate(roleSchema), admin.updateUser);

// Content resources
for (const [name, cfg] of Object.entries(RESOURCES)) {
  const crud = createAdminCrud(cfg.Model, cfg);
  const writeGuard = cfg.adminOnly ? [adminOnly] : [];
  r.get(`/${name}`, crud.list);
  r.get(`/${name}/:id`, crud.get);
  if (!cfg.noCreate) r.post(`/${name}`, ...writeGuard, crud.create);
  r.patch(`/${name}/:id`, ...writeGuard, crud.update);
  if (!cfg.noCreate) r.delete(`/${name}/:id`, ...writeGuard, crud.remove);
  if (cfg.hasWorkflow !== false) {
    r.patch(`/${name}/:id/status`, adminOnly, validate(V.statusChangeSchema), crud.setStatus);
    r.patch(`/${name}/:id/feature`, adminOnly, crud.setFeatured);
  }
}

export default r;
