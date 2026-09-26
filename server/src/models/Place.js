import mongoose from 'mongoose';
import {
  DISTRICT_SLUGS,
  PLACE_CATEGORIES,
  MOODS,
  BUDGET_LEVELS,
  CROWD_LEVELS,
  DIFFICULTY_LEVELS,
  ROAD_CONDITIONS,
  NETWORK_LEVELS,
} from '../config/constants.js';
import {
  pointSchema,
  tri,
  workflowFields,
  openingHoursSchema,
  contactSchema,
  accessibilitySchema,
  imageSchema,
  ratingFields,
  statsFields,
} from './shared.js';
import { buildSearchKeys } from '../utils/searchKeys.js';

const { Schema } = mongoose;

const placeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    nameMl: String,
    alternateNames: [String],
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, maxlength: 280 },
    shortDescriptionMl: String,
    description: String,
    descriptionMl: String,
    location: { type: pointSchema, required: true },
    district: { type: String, enum: DISTRICT_SLUGS, required: true, index: true },
    locality: String,
    categories: [{ type: String, enum: PLACE_CATEGORIES }],
    tags: [{ type: String, lowercase: true, trim: true }],
    moods: [{ type: String, enum: MOODS }],
    images: [imageSchema],

    visitDurationHours: { type: Number, min: 0 }, // typical visit length
    weekendGetaway: { type: Boolean, default: false },
    budgetLevel: { type: String, enum: BUDGET_LEVELS, default: 'unknown' },
    bestMonths: [{ type: Number, min: 1, max: 12 }],
    indoor: { type: Boolean, default: false }, // good rainy-day alternative
    familyFriendly: tri,
    crowdLevel: { type: String, enum: CROWD_LEVELS, default: 'unknown' },

    openingHours: openingHoursSchema,
    entryFee: {
      amount: Number, // INR; null/undefined = unknown
      isFree: Boolean,
      notes: String,
      verified: { type: Boolean, default: false },
    },
    contact: contactSchema,
    officialLinks: [{ _id: false, label: String, url: String }],
    facilities: [String],
    accessibility: { type: accessibilitySchema, default: () => ({}) },

    safety: {
      swimmingRestricted: tri,
      strongCurrents: tri,
      slipperyTerrain: tri,
      wildlifeRisk: tri,
      restrictedAreas: tri,
      nightAccessRestricted: tri,
      monsoonClosure: tri,
      notes: String,
      verified: { type: Boolean, default: false },
      lastReviewedAt: Date,
    },

    hiddenGem: { type: Boolean, default: false, index: true },
    gemDetails: {
      accessDifficulty: { type: String, enum: DIFFICULTY_LEVELS, default: 'unknown' },
      roadCondition: { type: String, enum: ROAD_CONDITIONS, default: 'unknown' },
      parking: tri,
      mobileNetwork: { type: String, enum: NETWORK_LEVELS, default: 'unknown' },
      monsoonSuitable: tri,
      bestTimeToVisit: String,
    },

    searchKeys: { type: [String], index: true },
    ...ratingFields,
    ...statsFields,
    ...workflowFields,
  },
  { timestamps: true },
);

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ status: 1, district: 1, categories: 1 });
placeSchema.index({ status: 1, moods: 1 });
placeSchema.index(
  { name: 'text', alternateNames: 'text', tags: 'text', shortDescription: 'text', description: 'text' },
  { weights: { name: 10, alternateNames: 8, tags: 5, shortDescription: 2, description: 1 }, name: 'place_text' },
);

placeSchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.name, this.nameMl, this.alternateNames, this.locality, this.tags);
});

export const Place = mongoose.model('Place', placeSchema);
