import mongoose from 'mongoose';
import { DISTRICT_SLUGS, TARGET_TYPES } from '../config/constants.js';

/**
 * Curated, admin-approved facts for the AI assistant's retrieval layer (RAG).
 * Only `approved` notes are ever passed to an AI provider.
 */
const knowledgeNoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true, maxlength: 4000 },
    district: { type: String, enum: DISTRICT_SLUGS },
    targetType: { type: String, enum: TARGET_TYPES },
    targetId: mongoose.Schema.Types.ObjectId,
    topics: [String],
    confidence: { type: String, enum: ['verified', 'estimated'], default: 'estimated' },
    source: String,
    sourceUrl: String,
    approved: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

knowledgeNoteSchema.index({ title: 'text', body: 'text', topics: 'text' });

export const KnowledgeNote = mongoose.model('KnowledgeNote', knowledgeNoteSchema);
