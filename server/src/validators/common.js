import { z } from 'zod';
import { TRI_STATE, TARGET_TYPES } from '../config/constants.js';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => /^https?:\/\//i.test(v), 'Must be an http(s) URL');
export const optionalUrl = z.union([httpUrl, z.literal('')]).optional();
export const tri = z.enum(TRI_STATE).optional();
export const str = (max = 500) => z.string().trim().max(max);
export const optStr = (max = 500) => str(max).optional();
export const strList = (max = 60) => z.array(str(max)).max(100).optional();

export const point = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
  approximate: z.boolean().optional(),
});

export const image = z.object({
  url: httpUrl,
  alt: optStr(200),
  credit: optStr(200),
  publicId: optStr(200),
});

export const source = z.object({
  label: optStr(200),
  url: optionalUrl,
  accessedAt: z.coerce.date().optional(),
});

const hours = z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Use HH:MM-HH:MM')).optional();
export const openingHours = z.object({
  mon: hours,
  tue: hours,
  wed: hours,
  thu: hours,
  fri: hours,
  sat: hours,
  sun: hours,
  open24h: z.boolean().optional(),
  notes: optStr(500),
  verified: z.boolean().optional(),
});

export const contact = z.object({
  phone: optStr(40),
  email: z.union([z.email(), z.literal('')]).optional(),
  website: optionalUrl,
  address: optStr(300),
});

export const accessibility = z.object({
  wheelchair: tri,
  elderlyFriendly: tri,
  strollerFriendly: tri,
  accessibleToilets: tri,
  lift: tri,
  stairsOrSlopes: tri,
  parkingDistanceM: z.number().min(0).optional(),
  walkingDistanceM: z.number().min(0).optional(),
  notes: optStr(1000),
  confirmed: z.boolean().optional(),
});

export const link = z.object({ label: optStr(100), url: httpUrl });

export const targetRef = {
  targetType: z.enum(TARGET_TYPES),
  targetId: objectId,
};
