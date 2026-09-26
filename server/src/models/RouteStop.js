import mongoose from 'mongoose';
import { ROUTE_STOP_KINDS, DISTRICT_SLUGS } from '../config/constants.js';
import { pointSchema, workflowFields, tri } from './shared.js';

/** Curated roadside stops (rest areas, tea stops, viewpoints) used for along-the-way suggestions. */
const routeStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ROUTE_STOP_KINDS, required: true, index: true },
    description: String,
    location: { type: pointSchema, required: true },
    district: { type: String, enum: DISTRICT_SLUGS, required: true },
    highway: String,
    toilets: tri,
    parking: tri,
    ...workflowFields,
  },
  { timestamps: true },
);

routeStopSchema.index({ location: '2dsphere' });

export const RouteStop = mongoose.model('RouteStop', routeStopSchema);
