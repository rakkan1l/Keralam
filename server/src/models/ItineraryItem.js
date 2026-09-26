import mongoose from 'mongoose';

/**
 * A single stop in a trip day. Embedded in Trip.days[].items. Facts are copied from the
 * referenced record at generation time and tagged with a confidence so the UI can show
 * verified / estimated / unavailable information distinctly.
 */
export const itineraryItemSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['place', 'meal', 'stay', 'travel', 'note', 'event'], required: true },
    targetType: { type: String, enum: ['place', 'business', 'stay', 'event'] },
    targetId: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    slug: String,
    district: String,
    coordinates: [Number], // [lng, lat]
    startTime: String, // "HH:MM"
    durationMin: Number,
    travelFromPrevious: {
      distanceKm: Number,
      durationMin: Number,
      estimated: { type: Boolean, default: true },
    },
    costEstimate: {
      amount: Number,
      confidence: { type: String, enum: ['verified', 'estimated', 'unavailable'], default: 'unavailable' },
      note: String,
    },
    openingHoursStatus: { type: String, enum: ['ok', 'conflict', 'unknown'], default: 'unknown' },
    notes: [String],
    warnings: [String],
  },
  { _id: true },
);

export const ItineraryItem = mongoose.model('ItineraryItem', itineraryItemSchema);
