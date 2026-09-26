import mongoose from 'mongoose';
import { TARGET_TYPES, REPORT_KINDS, REPORT_STATUSES } from '../config/constants.js';

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    kind: { type: String, enum: REPORT_KINDS, required: true },
    targetType: { type: String, enum: TARGET_TYPES },
    targetId: Schema.Types.ObjectId,
    targetName: String,
    message: { type: String, required: true, maxlength: 2000 },
    evidenceUrl: String,
    reporter: { type: Schema.Types.ObjectId, ref: 'User' },
    reporterEmail: { type: String, lowercase: true, trim: true },
    status: { type: String, enum: REPORT_STATUSES, default: 'open', index: true },
    resolution: {
      by: { type: Schema.Types.ObjectId, ref: 'User' },
      at: Date,
      note: String,
    },
  },
  { timestamps: true },
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
