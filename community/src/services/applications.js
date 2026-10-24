import { applications } from '../config/site.js';

/**
 * Sends an application to the configured backend endpoint.
 * Returns { status: 'sent', reference } only after a successful 2xx response.
 * With no endpoint configured it returns { status: 'not-configured' } and sends nothing.
 */
export async function submitApplication(payload) {
  if (!applications.acceptingOnline) return { status: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(applications.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        status: 'error',
        message:
          response.status === 429
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : data.message || 'The application could not be submitted. Please try again later.',
      };
    }
    return { status: 'sent', reference: data.reference ?? null };
  } catch {
    return { status: 'error', message: 'We could not reach the application service. Check your connection and try again.' };
  } finally {
    clearTimeout(timer);
  }
}
