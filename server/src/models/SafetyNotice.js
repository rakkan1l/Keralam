import mongoose from 'mongoose';
import { SAFETY_NOTICE_TYPES, DISTRICT_SLUGS, TARGET_TYPES } from '../config/constants.js';

const { Schema } = mongoose;

/** Temporary warnings. Every notice must name its source and shows its last-updated time. */
const safetyNoticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    titleMl: String,
    message: { type: String, required: true },
    messageMl: String,
    // Malayalam text for safety info must be human-reviewed before display.
    mlReviewed: { type: Boolean, default: false },
    type: { type: String, enum: SAFETY_NOTICE_TYPES, default: 'other' },
    severity: { type: String, enum: ['info', 'caution', 'warning', 'danger'], default: 'caution' },
    district: { type: String, enum: DISTRICT_SLUGS },
    targetType: { type: String, enum: TARGET_TYPES },
    targetId: Schema.Types.ObjectId,
    source: { type: String, required: true },
    sourceUrl: String,
    validFrom: { type: Date, default: Date.now },
    validUntil: Date,
    active: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

safetyNoticeSchema.index({ active: 1, district: 1, validUntil: 1 });
safetyNoticeSchema.index({ targetType: 1, targetId: 1 });

export const SafetyNotice = mongoose.model('SafetyNotice', safetyNoticeSchema);
