import mongoose from 'mongoose';
import { EVENT_CATEGORIES, DISTRICT_SLUGS, TICKET_STATUSES } from '../config/constants.js';
import { pointSchema, workflowFields, imageSchema, statsFields } from './shared.js';
import { buildSearchKeys } from '../utils/searchKeys.js';

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    titleMl: String,
    slug: { type: String, required: true, unique: true },
    description: String,
    descriptionMl: String,
    category: { type: String, enum: EVENT_CATEGORIES, required: true, index: true },
    organizer: String,
    venue: String,
    location: pointSchema,
    district: { type: String, enum: DISTRICT_SLUGS, required: true, index: true },
    place: { type: Schema.Types.ObjectId, ref: 'Place' },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    images: [imageSchema],
    entryFee: { amount: Number, isFree: Boolean, notes: String },
    ticketStatus: { type: String, enum: TICKET_STATUSES, default: 'unknown' },
    ticketUrl: String,
    ageRestriction: String,
    parking: String,
    publicTransport: String,
    languages: [String],
    officialSourceUrl: String,
    lastVerifiedAt: Date,
    interestCount: { type: Number, default: 0 },
    searchKeys: { type: [String], index: true },
    ...statsFields,
    ...workflowFields,
  },
  { timestamps: true },
);

eventSchema.index({ location: '2dsphere' }, { sparse: true });
eventSchema.index({ status: 1, endDate: 1, startDate: 1 });

eventSchema.pre('save', function computeKeys() {
  this.searchKeys = buildSearchKeys(this.title, this.titleMl, this.venue, this.organizer);
  if (this.endDate && this.startDate && this.endDate < this.startDate) this.endDate = this.startDate;
});

export const Event = mongoose.model('Event', eventSchema);
