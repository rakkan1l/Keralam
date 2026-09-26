import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const base = { standardHeaders: 'draft-7', legacyHeaders: false, skip: () => env.isTest };
const message = { success: false, error: { message: 'Too many requests, please try again later.' } };

export const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: env.rateLimitMax, message });
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 30, message });
export const writeLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 60, message });
