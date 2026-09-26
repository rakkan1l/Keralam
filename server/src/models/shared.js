import mongoose from 'mongoose';
import { CONTENT_STATUSES, TRI_STATE } from '../config/constants.js';

const { Schema } = mongoose;

/** GeoJSON Point stored as [lng, lat]. */
export const pointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 && Math.abs(v[0]) <= 180 && Math.abs(v[1]) <= 90,
        message: 'coordinates must be [lng, lat]',
      },
    },
    approximate: { type: Boolean, default: false },
  },
  { _id: false },
);

export const tri = { type: String, enum: TRI_STATE, default: 'unknown' };

export const sourceSchema = new Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true },
    accessedAt: Date,
  },
  { _id: false },
);

/** Verification + workflow metadata shared by all curated content. */
export const workflowFields = {
  status: { type: String, enum: CONTENT_STATUSES, default: 'draft', index: true },
  isDemo: { type: Boolean, default: false },
  verification: {
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  sources: [sourceSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
};

export const openingHoursSchema = new Schema(
  {
    // Each day: array of "HH:MM-HH:MM" ranges. Empty array = closed, missing = unknown.
    mon: [String],
    tue: [String],
    wed: [String],
    thu: [String],
    fri: [String],
    sat: [String],
    sun: [String],
    open24h: { type: Boolean, default: false },
    notes: String,
    verified: { type: Boolean, default: false },
  },
  { _id: false },
);

export const contactSchema = new Schema(
  {
    phone: String,
    email: String,
    website: String,
    address: String,
  },
  { _id: false },
);

export const accessibilitySchema = new Schema(
  {
    wheelchair: tri,
    elderlyFriendly: tri,
    strollerFriendly: tri,
    accessibleToilets: tri,
    lift: tri,
    stairsOrSlopes: tri,
    parkingDistanceM: Number,
    walkingDistanceM: Number,
    notes: String,
    confirmed: { type: Boolean, default: false },
  },
  { _id: false },
);

export const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: String,
    credit: String,
    publicId: String,
  },
  { _id: false },
);

export const ratingFields = {
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
};

export const statsFields = {
  stats: {
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
  },
  featured: { type: Boolean, default: false, index: true },
  editorialRank: { type: Number, default: 0 },
};
