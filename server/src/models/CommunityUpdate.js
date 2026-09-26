import mongoose from 'mongoose';
import { TARGET_TYPES, UPDATE_KINDS, MODERATION_STATUSES } from '../config/constants.js';

const { Schema } = mongoose;

/**
 * Short-lived crowd / parking / road / condition updates. They are shown immediately
 * with an "unverified community update" label, expire automatically, and can be hidden
 * by moderators.
 */
const communityUpdateSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: UPDATE_KINDS, required: true },
    level: { type: String, enum: ['low', 'moderate', 'high', 'good', 'fair', 'poor', 'closed', 'unknown'], default: 'unknown' },
    note: { type: String, maxlength: 500 },
    status: { type: String, enum: MODERATION_STATUSES, default: 'approved' },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 3600 * 1000) },
  },
  { timestamps: true },
);

communityUpdateSchema.index({ targetType: 1, targetId: 1, expiresAt: -1 });
communityUpdateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });

export const CommunityUpdate = mongoose.model('CommunityUpdate', communityUpdateSchema);
