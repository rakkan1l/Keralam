import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, TARGET_TYPES, LANGUAGE_CODES } from '../config/constants.js';

const { Schema } = mongoose;

const savedItemSchema = new Schema(
  {
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    avatarUrl: String,
    homeDistrict: String,
    preferences: {
      language: { type: String, enum: LANGUAGE_CODES, default: 'en' },
      interests: [String],
      travellerType: String,
    },
    saved: [savedItemSchema],
    recentlyViewed: [
      {
        _id: false,
        targetType: { type: String, enum: TARGET_TYPES },
        targetId: Schema.Types.ObjectId,
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    trustedContacts: [{ _id: false, name: String, phone: String }],
    // Future contributor programme (Phase 3).
    contributor: {
      level: { type: String, enum: ['none', 'contributor', 'trusted', 'local-guide'], default: 'none' },
      verifiedAt: Date,
      districts: [String],
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const { _id, name, email, role, avatarUrl, homeDistrict, preferences, contributor, createdAt } = this;
  return { id: _id, name, email, role, avatarUrl, homeDistrict, preferences, contributor, createdAt };
};

export const User = mongoose.model('User', userSchema);
