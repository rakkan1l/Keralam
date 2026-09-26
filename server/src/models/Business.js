import mongoose from 'mongoose';
import { BUSINESS_KINDS, DISTRICT_SLUGS, FOOD_CATEGORIES, PRICE_BANDS, DIETARY_TAGS } from '../config/constants.js';
import {
  pointSchema,
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

/**
 * One collection for restaurants, cafes, shops, theatres, parks and essential services.
 * A "Restaurant" is a Business whose kind is in FOOD_KINDS; kind-specific details live
 * in the `food`, `theatre` and `shopping` sub-documents. A single collection keeps
 * geo queries (Near Me, along-route) to one $geoNear per request.
 */
const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    nameMl: String,
    alternateNames: [String],
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: BUSINESS_KINDS, required: true, index: true },
    description: String,
    descriptionMl: String,
    location: { type: pointSchema, required: true },
    district: { type: String, enum: DISTRICT_SLUGS, required: true, index: true },
    locality: String,
    images: [imageSchema],
    priceRange: { type: String, enum: PRICE_BANDS, default: 'unknown' },
    openingHours: openingHoursSchema,
    facilities: [String],
    contact: contactSchema,
    officialWebsite: String,
    accessibility: { type: accessibilitySchema, default: () => ({}) },
    tags: [{ type: String, lowercase: true, trim: true }],

    food: {
      categories: [{ type: String, enum: FOOD_CATEGORIES }],
      cuisines: [String],
      dietary: [{ type: String, enum: DIETARY_TAGS }],
      signatureDishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }],
      lateNight: { type: Boolean, default: false },
    },
    theatre: {
      languages: [String],
      screens: Number,
      showtimesUrl: String,
      parking: String,
    },
    shopping: {
      productTypes: [String],
    },

    // Phase 3: business claims.
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    searchKeys: { type: [String], index: true },
    ...ratingFields,
    ...statsFields,
    ...workflowFields,
  },
  { timestamps: true },
);

businessSchema.index({ location: '2dsphere' });
businessSchema.index({ status: 1, kind: 1, district: 1 });
businessSchema.index({ status: 1, 'food.categories': 1 });
businessSchema.index({ name: 'text', tags: 'text', description: 'text' }, { name: 'business_text' });

businessSchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.name, this.nameMl, this.alternateNames, this.locality, this.tags);
});

export const Business = mongoose.model('Business', businessSchema);
