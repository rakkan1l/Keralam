import { PUBLIC_STATUSES } from '../config/constants.js';
import { User } from '../models/User.js';
import { SafetyNotice, CommunityUpdate, Review } from '../models/index.js';
import { track } from '../services/analyticsService.js';

export const publicFilter = { status: { $in: PUBLIC_STATUSES } };

/** Count a view, log analytics, and remember it in the user's recently viewed list. */
export function recordView(Model, doc, targetType, req) {
  Model.updateOne({ _id: doc._id }, { $inc: { 'stats.views': 1 } }).catch(() => {});
  track('view', { targetType, targetId: doc._id, user: req.user?._id });
  if (req.user) {
    User.updateOne(
      { _id: req.user._id },
      [
        {
          $set: {
            recentlyViewed: {
              $slice: [
                {
                  $concatArrays: [
                    {
                      $filter: {
                        input: { $ifNull: ['$recentlyViewed', []] },
                        cond: { $ne: ['$$this.targetId', doc._id] },
                      },
                    },
                    [{ targetType, targetId: doc._id, viewedAt: '$$NOW' }],
                  ],
                },
                -30,
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    ).catch(() => {});
  }
}

/** Safety notices, live community updates and approved reviews for a detail page. */
export async function detailExtras(targetType, doc) {
  const now = new Date();
  const [notices, updates, reviews] = await Promise.all([
    SafetyNotice.find({
      active: true,
      validFrom: { $lte: now },
      $and: [
        { $or: [{ validUntil: null }, { validUntil: { $exists: false } }, { validUntil: { $gte: now } }] },
        { $or: [{ targetType, targetId: doc._id }, ...(doc.district ? [{ district: doc.district, targetId: { $exists: false } }] : [])] },
      ],
    })
      .sort({ severity: -1, updatedAt: -1 })
      .limit(10)
      .lean(),
    CommunityUpdate.find({ targetType, targetId: doc._id, status: 'approved', expiresAt: { $gte: now } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .lean(),
    Review.find({ targetType, targetId: doc._id, status: 'approved' }).sort({ createdAt: -1 }).limit(10).populate('user', 'name').lean(),
  ]);
  return { notices, updates, reviews };
}
