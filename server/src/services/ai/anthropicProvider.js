import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { env } from '../../config/env.js';

/**
 * Optional Claude integration. The model only *selects and orders* database records
 * (by id) and writes short explanations. It never supplies facts: hours, prices, safety
 * and transport details are filled in afterwards from the database by the itinerary
 * builder. The API key stays on the server.
 */

let client;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: env.ai.anthropicApiKey, timeout: 60_000, maxRetries: 2 });
  return client;
}

const TripPlan = z.object({
  title: z.string(),
  days: z.array(
    z.object({
      placeIds: z.array(z.string()),
      theme: z.string(),
    }),
  ),
});

const SYSTEM_TRIP = `You plan Kerala trips for a travel platform.
You may ONLY use places from the CANDIDATES list, referenced by their exact "id".
Never mention or invent destinations, opening hours, prices, safety details or transport schedules — the platform adds verified facts itself.
Choose places that match the traveller's interests, pace and constraints, and order each day to minimise backtracking.
If the candidates cannot satisfy a request, return fewer places rather than inventing any.`;

export async function planTripWithClaude({ inputs, candidates, days, perDay }) {
  const response = await getClient().messages.parse({
    model: env.ai.anthropicModel,
    max_tokens: 16000,
    system: SYSTEM_TRIP,
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          traveller: {
            duration: inputs.duration,
            days,
            maxPlacesPerDay: perDay,
            budget: inputs.budget,
            groupType: inputs.groupType,
            interests: inputs.interests,
            transport: inputs.transport,
            pace: inputs.pace,
            withChildren: inputs.withChildren,
            withElderly: inputs.withElderly,
            accessibilityNeeds: inputs.accessibilityNeeds,
          },
          CANDIDATES: candidates,
        }),
      },
    ],
    output_config: { format: zodOutputFormat(TripPlan) },
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('AI provider returned no usable plan');
  }
  return response.parsed_output;
}

const Answer = z.object({
  answer: z.string(),
  usedPlaceIds: z.array(z.string()),
  missingInformation: z.array(z.string()),
});

const SYSTEM_ASSISTANT = `You are a Kerala travel assistant for a travel platform.
Answer ONLY from the CONTEXT provided (places and knowledge notes from the platform database).
Each fact in CONTEXT has a confidence of "verified", "estimated" or "unavailable":
- state verified facts plainly,
- mark estimated facts as estimates,
- say clearly when information is unavailable; never guess opening hours, prices, safety information or transport schedules.
Never mention places that are not in CONTEXT. Keep answers concise and practical.`;

export async function answerWithClaude({ question, context }) {
  const response = await getClient().messages.parse({
    model: env.ai.anthropicModel,
    max_tokens: 16000,
    system: SYSTEM_ASSISTANT,
    messages: [{ role: 'user', content: JSON.stringify({ question, CONTEXT: context }) }],
    output_config: { format: zodOutputFormat(Answer) },
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('AI provider returned no usable answer');
  }
  return response.parsed_output;
}
