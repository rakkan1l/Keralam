import mongoose from 'mongoose';
import { EMERGENCY_CATEGORIES, DISTRICT_SLUGS } from '../config/constants.js';

/**
 * Admin-managed emergency numbers. `verified` must only be set after an admin has
 * confirmed the number against the attributed official source.
 */
const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameMl: String,
    mlReviewed: { type: Boolean, default: false },
    number: { type: String, required: true, trim: true },
    category: { type: String, enum: EMERGENCY_CATEGORIES, default: 'general' },
    description: String,
    scope: { type: String, enum: ['national', 'state', 'district'], default: 'state' },
    district: { type: String, enum: DISTRICT_SLUGS },
    source: String,
    sourceUrl: String,
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
