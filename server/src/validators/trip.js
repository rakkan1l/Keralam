import { z } from 'zod';
import { DISTRICT_SLUGS } from '../config/constants.js';
import { objectId, str, optStr } from './common.js';

export const INTERESTS = ['nature', 'food', 'culture', 'adventure', 'shopping', 'photography'];

export const tripInputSchema = z.object({
  start: z.object({
    label: optStr(120),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
    district: z.enum(DISTRICT_SLUGS).optional(),
  }),
  duration: z.enum(['few-hours', 'one-day', 'weekend', 'multi-day']),
  days: z.number().int().min(1).max(7).optional(),
  budget: z.enum(['budget', 'moderate', 'premium']).default('moderate'),
  groupType: z.enum(['solo', 'couple', 'family', 'friends', 'group']).default('couple'),
  interests: z.array(z.enum(INTERESTS)).max(6).default([]),
  transport: z.enum(['car', 'bike', 'public', 'taxi']).default('car'),
  pace: z.enum(['relaxed', 'balanced', 'packed']).default('balanced'),
  withChildren: z.boolean().default(false),
  withElderly: z.boolean().default(false),
  accessibilityNeeds: z.array(z.enum(['wheelchair', 'minimal-walking', 'stroller'])).default([]),
  respectOpeningHours: z.boolean().default(true),
  startDate: z.coerce.date().optional(),
  districts: z.array(z.enum(DISTRICT_SLUGS)).max(5).optional(),
});

const item = z.object({
  _id: objectId.optional(),
  kind: z.enum(['place', 'meal', 'stay', 'travel', 'note', 'event']),
  targetType: z.enum(['place', 'business', 'stay', 'event']).optional(),
  targetId: objectId.optional(),
  title: str(200).min(1),
  slug: optStr(120),
  district: optStr(40),
  coordinates: z.array(z.number()).length(2).optional(),
  startTime: optStr(5),
  durationMin: z.number().min(0).max(1440).optional(),
  notes: z.array(str(500)).max(10).optional(),
});

export const tripSaveSchema = z.object({
  title: str(120).min(1),
  inputs: z.record(z.string(), z.any()).optional(),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        date: z.coerce.date().optional(),
        title: optStr(120),
        items: z.array(item).max(30),
        stay: z.object({ targetId: objectId.optional(), title: optStr(200), slug: optStr(120) }).optional(),
      }),
    )
    .max(14),
  summary: z.record(z.string(), z.any()).optional(),
  generator: z.enum(['demo', 'ai', 'manual']).optional(),
  isPublic: z.boolean().optional(),
});

export const tripUpdateSchema = tripSaveSchema.partial();

export const assistantSchema = z.object({
  question: str(1000).min(3),
  context: z
    .object({
      coordinates: z.tuple([z.number(), z.number()]).optional(),
      district: z.enum(DISTRICT_SLUGS).optional(),
      tripId: objectId.optional(),
    })
    .optional(),
});
