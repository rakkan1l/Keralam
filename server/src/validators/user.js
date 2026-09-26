import { z } from 'zod';
import { TARGET_TYPES, LANGUAGE_CODES, REPORT_KINDS, UPDATE_KINDS, DISTRICT_SLUGS } from '../config/constants.js';
import { objectId, str, optStr, optionalUrl, httpUrl, targetRef } from './common.js';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const registerSchema = z.object({
  name: str(80).min(2, 'Name is required'),
  email: z.email().trim().toLowerCase(),
  password,
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const profileSchema = z.object({
  name: str(80).min(2).optional(),
  avatarUrl: optionalUrl,
  homeDistrict: z.union([z.enum(DISTRICT_SLUGS), z.literal('')]).optional(),
  preferences: z
    .object({
      language: z.enum(LANGUAGE_CODES).optional(),
      interests: z.array(str(40)).max(20).optional(),
      travellerType: optStr(40),
    })
    .optional(),
  trustedContacts: z
    .array(z.object({ name: str(80).min(1), phone: str(30).min(3) }))
    .max(5)
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const saveSchema = z.object(targetRef);
export const syncSavedSchema = z.object({ items: z.array(z.object(targetRef)).max(200) });

export const listSchema = z.object({
  name: str(80).min(1),
  description: optStr(500),
  isPublic: z.boolean().optional(),
});
export const listItemSchema = z.object({ ...targetRef, note: optStr(300) });

export const reviewSchema = z.object({
  ...targetRef,
  rating: z.number().int().min(1).max(5),
  title: optStr(120),
  text: optStr(2000),
  photos: z.array(z.object({ url: httpUrl, alt: optStr(200) })).max(6).optional(),
  visitedOn: z.coerce.date().optional(),
});

export const reportSchema = z.object({
  kind: z.enum(REPORT_KINDS),
  targetType: z.enum(TARGET_TYPES).optional(),
  targetId: objectId.optional(),
  targetName: optStr(200),
  message: str(2000).min(5, 'Please describe the problem'),
  evidenceUrl: optionalUrl,
  reporterEmail: z.union([z.email(), z.literal('')]).optional(),
});

export const communityUpdateSchema = z.object({
  ...targetRef,
  kind: z.enum(UPDATE_KINDS),
  level: z.enum(['low', 'moderate', 'high', 'good', 'fair', 'poor', 'closed', 'unknown']),
  note: optStr(500),
});

export const moderationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  note: optStr(500),
});

export const roleSchema = z.object({
  role: z.enum(['user', 'contributor', 'editor', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export { TARGET_TYPES };
