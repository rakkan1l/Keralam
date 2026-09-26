import mongoose from 'mongoose';
import { FOOD_CATEGORIES, DIETARY_TAGS, PRICE_BANDS } from '../config/constants.js';
import { workflowFields, imageSchema, statsFields } from './shared.js';
import { buildSearchKeys } from '../utils/searchKeys.js';

const { Schema } = mongoose;

const dishSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameMl: String,
    alternateNames: [String],
    slug: { type: String, required: true, unique: true },
    description: String,
    descriptionMl: String,
    images: [imageSchema],
    region: String, // e.g. "Malabar", "Central Kerala", "Statewide"
    categories: [{ type: String, enum: FOOD_CATEGORIES }],
    dietary: [{ type: String, enum: DIETARY_TAGS }],
    typicalPrice: {
      band: { type: String, enum: PRICE_BANDS, default: 'unknown' },
      note: String,
      estimated: { type: Boolean, default: true },
    },
    recommendedPlaces: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
    searchKeys: { type: [String], index: true },
    ...statsFields,
    ...workflowFields,
  },
  { timestamps: true },
);

dishSchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.name, this.nameMl, this.alternateNames);
});

export const Dish = mongoose.model('Dish', dishSchema);
