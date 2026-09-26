import mongoose from 'mongoose';
import { TRANSPORT_KINDS, DISTRICT_SLUGS } from '../config/constants.js';
import { pointSchema, workflowFields, contactSchema } from './shared.js';
import { buildSearchKeys } from '../utils/searchKeys.js';

const transportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameMl: String,
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: TRANSPORT_KINDS, required: true, index: true },
    code: String, // station / airport code
    location: { type: pointSchema, required: true },
    district: { type: String, enum: DISTRICT_SLUGS, required: true, index: true },
    description: String,
    contact: contactSchema,
    officialUrl: String,
    // Live schedules are not stored — link to the operator instead.
    scheduleUrl: String,
    searchKeys: { type: [String], index: true },
    ...workflowFields,
  },
  { timestamps: true },
);

transportSchema.index({ location: '2dsphere' });
transportSchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.name, this.nameMl, this.code);
});

export const TransportNode = mongoose.model('TransportNode', transportSchema);
