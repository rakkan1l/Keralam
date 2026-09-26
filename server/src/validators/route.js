import { z } from 'zod';
import { ROUTE_STOP_KINDS } from '../config/constants.js';

const lngLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const routePlanSchema = z.object({
  from: lngLat,
  to: lngLat,
  waypoints: z.array(lngLat).max(8).default([]),
  profile: z.enum(['driving', 'cycling', 'walking']).default('driving'),
});

export const ALONG_CATEGORIES = [
  'viewpoints',
  'food',
  'fuel',
  'ev-charging',
  'toilets',
  'hospitals',
  'attractions',
  'tea-coffee',
  'rest-areas',
];

export const alongRouteSchema = z.object({
  line: z.array(lngLat).min(2).max(5000),
  categories: z.array(z.enum(ALONG_CATEGORIES)).default(['attractions', 'food', 'fuel']),
  bufferKm: z.number().min(0.5).max(20).default(5),
  limit: z.number().int().min(1).max(100).default(40),
});

export { ROUTE_STOP_KINDS };
