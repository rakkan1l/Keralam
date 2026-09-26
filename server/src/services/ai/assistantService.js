import { features } from '../../config/env.js';
import { parseQuery } from '../search/queryParser.js';
import { retrieveForQuestion } from './retrievalService.js';
import { answerWithClaude } from './anthropicProvider.js';

/**
 * Travel assistant (RAG). Retrieval always runs against the platform database. When an
 * AI provider is configured the retrieved context is passed to it for a natural-language
 * answer; otherwise the structured retrieval result is returned in "preview" mode.
 */
export async function ask({ question, context = {} }) {
  const parsed = parseQuery(question);
  const retrieved = await retrieveForQuestion({
    keywords: parsed.keywords,
    filters: { ...parsed.filters, district: parsed.filters.district || context.district },
    coordinates: context.coordinates,
  });

  const base = { question, interpretation: parsed.interpretation, sources: retrieved };

  if (!features.ai) {
    return {
      ...base,
      mode: 'preview',
      answer: retrieved.places.length
        ? `AI answers are not configured yet. Based on the platform database, here are ${retrieved.places.length} matching places. Details marked "unavailable" are not in our records.`
        : 'AI answers are not configured yet, and no matching places were found in the database for this question.',
    };
  }

  try {
    const result = await answerWithClaude({ question, context: retrieved });
    const validIds = new Set(retrieved.places.map((p) => p.id));
    return { ...base, mode: 'ai', answer: result.answer, usedPlaceIds: result.usedPlaceIds.filter((id) => validIds.has(id)), missingInformation: result.missingInformation };
  } catch (err) {
    return { ...base, mode: 'preview', answer: `The AI assistant is temporarily unavailable (${err.message}). Showing database matches instead.` };
  }
}
