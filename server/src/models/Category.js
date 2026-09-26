import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    type: { type: String, enum: ['place', 'food', 'business', 'stay', 'event', 'mood'], required: true },
    name: { type: String, required: true },
    nameMl: String,
    description: String,
    icon: String, // lucide icon name, resolved on the client
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ type: 1, slug: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);
