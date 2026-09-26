import mongoose from 'mongoose';
import { STAY_TYPES, DISTRICT_SLUGS, PRICE_BANDS, TRAVELLER_TYPES, STAY_EXPERIENCES } from '../config/constants.js';
import {
  pointSchema,
  workflowFields,
  contactSchema,
  accessibilitySchema,
  imageSchema,
  ratingFields,
  statsFields,
} from './shared.js';
import { buildSearchKeys } from '../utils/searchKeys.js';

const { Schema } = mongoose;

const staySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameMl: String,
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: STAY_TYPES, required: true, index: true },
    description: String,
    descriptionMl: String,
    images: [imageSchema],
    location: { type: pointSchema, required: true },
    district: { type: String, enum: DISTRICT_SLUGS, required: true, index: true },
    locality: String,
    priceBand: { type: String, enum: PRICE_BANDS, default: 'unknown' },
    priceFrom: Number, // INR per night, only when verified
    priceVerified: { type: Boolean, default: false },
    facilities: [String],
    travellerTypes: [{ type: String, enum: TRAVELLER_TYPES }],
    experiences: [{ type: String, enum: STAY_EXPERIENCES }],
    accessibility: { type: accessibilitySchema, default: () => ({}) },
    contact: contactSchema,
    bookingLinks: [{ _id: false, label: String, url: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
    searchKeys: { type: [String], index: true },
    ...ratingFields,
    ...statsFields,
    ...workflowFields,
  },
  { timestamps: true },
);

staySchema.index({ location: '2dsphere' });
staySchema.index({ status: 1, type: 1, district: 1, priceBand: 1 });

staySchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.name, this.nameMl, this.locality, this.tags);
});

export const Stay = mongoose.model('Stay', staySchema);
