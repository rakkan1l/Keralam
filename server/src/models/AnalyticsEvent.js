import mongoose from 'mongoose';
import { ANALYTICS_TYPES, TARGET_TYPES } from '../config/constants.js';

const analyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ANALYTICS_TYPES, required: true },
    targetType: { type: String, enum: TARGET_TYPES },
    targetId: mongoose.Schema.Types.ObjectId,
    query: String,
    resultsCount: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    meta: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
// Keep raw analytics for 180 days.
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
