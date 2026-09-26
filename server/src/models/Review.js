import mongoose from 'mongoose';
import { TARGET_TYPES, MODERATION_STATUSES } from '../config/constants.js';

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, maxlength: 120 },
    text: { type: String, maxlength: 2000 },
    photos: [{ _id: false, url: String, alt: String }],
    visitedOn: Date,
    status: { type: String, enum: MODERATION_STATUSES, default: 'pending', index: true },
    moderation: {
      by: { type: Schema.Types.ObjectId, ref: 'User' },
      at: Date,
      note: String,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
