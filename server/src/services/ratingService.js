import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { TARGET_MODELS } from '../models/index.js';

/** Recompute the approved-review average on the reviewed document. */
export async function refreshRating(targetType, targetId) {
  const Model = TARGET_MODELS[targetType];
  if (!Model || !Model.schema.path('rating.average')) return;
  const [agg] = await Review.aggregate([
    { $match: { targetType, targetId: new mongoose.Types.ObjectId(String(targetId)), status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Model.updateOne(
    { _id: targetId },
    { $set: { 'rating.average': agg ? Math.round(agg.avg * 10) / 10 : 0, 'rating.count': agg?.count || 0 } },
  );
}
