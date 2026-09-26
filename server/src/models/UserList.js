import mongoose from 'mongoose';
import { TARGET_TYPES } from '../config/constants.js';

const { Schema } = mongoose;

const userListSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 500 },
    items: [
      {
        _id: false,
        targetType: { type: String, enum: TARGET_TYPES, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        note: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const UserList = mongoose.model('UserList', userListSchema);
