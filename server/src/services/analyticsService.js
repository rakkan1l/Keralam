import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { env } from '../config/env.js';

/** Fire-and-forget analytics; failures never break the user request. */
export function track(type, data = {}) {
  AnalyticsEvent.create({ type, ...data }).catch((err) => {
    if (!env.isTest) console.warn('[analytics] failed to record', type, err.message);
  });
}

export async function trackAwait(type, data = {}) {
  return AnalyticsEvent.create({ type, ...data });
}
