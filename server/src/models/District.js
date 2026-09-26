import mongoose from 'mongoose';
import { DISTRICT_SLUGS } from '../config/constants.js';
import { pointSchema, workflowFields, imageSchema } from './shared.js';

const { Schema } = mongoose;

const districtSchema = new Schema(
  {
    slug: { type: String, enum: DISTRICT_SLUGS, required: true, unique: true },
    name: { type: String, required: true },
    nameMl: String,
    alternateNames: [String],
    headquarters: String,
    tagline: String,
    taglineMl: String,
    intro: String,
    introMl: String,
    location: pointSchema,
    heroImage: imageSchema,
    highlights: [String],
    neighbours: [{ type: String, enum: DISTRICT_SLUGS }],
    transport: {
      summary: String,
      railway: String,
      airport: String,
      bus: String,
      notes: String,
    },
    essentials: {
      summary: String,
      notes: String,
    },
    ...workflowFields,
  },
  { timestamps: true },
);

export const District = mongoose.model('District', districtSchema);
