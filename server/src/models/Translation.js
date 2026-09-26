import mongoose from 'mongoose';
import { LANGUAGE_CODES } from '../config/constants.js';

/** Admin-editable UI string overrides, merged over the bundled i18n resources on the client. */
const translationSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: LANGUAGE_CODES, required: true },
    namespace: { type: String, default: 'common' },
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true },
    reviewed: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

translationSchema.index({ lang: 1, namespace: 1, key: 1 }, { unique: true });

export const Translation = mongoose.model('Translation', translationSchema);
