import mongoose from 'mongoose';
import { itineraryItemSchema } from './ItineraryItem.js';

const { Schema } = mongoose;

const tripSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    inputs: {
      start: { label: String, coordinates: [Number] },
      duration: { type: String, enum: ['few-hours', 'one-day', 'weekend', 'multi-day'] },
      days: Number,
      budget: { type: String, enum: ['budget', 'moderate', 'premium'] },
      groupType: String,
      interests: [String],
      transport: { type: String, enum: ['car', 'bike', 'public', 'taxi'] },
      pace: { type: String, enum: ['relaxed', 'balanced', 'packed'] },
      withChildren: Boolean,
      withElderly: Boolean,
      accessibilityNeeds: [String],
      respectOpeningHours: { type: Boolean, default: true },
      startDate: Date,
      districts: [String],
    },
    days: [
      {
        _id: false,
        day: Number,
        date: Date,
        title: String,
        items: [itineraryItemSchema],
        stay: { targetId: Schema.Types.ObjectId, title: String, slug: String },
      },
    ],
    summary: {
      totalDistanceKm: Number,
      totalTravelMin: Number,
      estimatedCost: { min: Number, max: Number, note: String },
      unknownCosts: [String],
      warnings: [String],
      weatherAlternatives: [{ _id: false, forItem: String, alternative: String, slug: String }],
      seasonalNotes: [String],
    },
    generator: { type: String, enum: ['demo', 'ai', 'manual'], default: 'demo' },
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const Trip = mongoose.model('Trip', tripSchema);
