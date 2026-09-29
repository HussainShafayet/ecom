// src/api/errors.js
// What to tell the customer about a failed request. One place for both axios clients (they used to keep a copy each).

// The backend's own sentence for a refused request (`errors[0]`, else `error`; docs/API_CONTRACT.md), if it sent one.
const backendSentence = (error) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0 && typeof data.errors[0] === 'string') return data.errors[0];
  if (typeof data?.error === 'string' && data.error) return data.error;
  return null;
};

// How long the customer has to wait when the shop said "too many" (HTTP 429): the `Retry-After` header when the browser lets us
// read it (a cross-origin page only sees the headers the backend exposes), else the sentence DRF writes for a throttled request
// ("Request was throttled. Expected available in 15 seconds."). A 429 that says nothing about how long is `fallback` seconds;
// anything that is not a 429 is null.
export const DEFAULT_WAIT_SECONDS = 30;
export const retryAfterSeconds = (error, fallback = DEFAULT_WAIT_SECONDS) => {
  if (error?.response?.status !== 429) return null;
  const header = Number(error.response.headers?.['retry-after']);
  if (Number.isFinite(header) && header > 0) return Math.ceil(header);
  const data = error.response.data;
  const sentence = [...(Array.isArray(data?.errors) ? data.errors : []), data?.error, data?.message].filter(Boolean).join(' ');
  const match = /available in (\d+) second/i.exec(sentence);
  return match ? Number(match[1]) : fallback;
};

// A wait in words a customer reads: "15 seconds", "2 minutes", "1 hour" (a code limit per hour can be long).
export const formatWait = (seconds) => {
  const total = Math.max(0, Math.ceil(seconds));
  if (total < 90) return `${total} ${total === 1 ? 'second' : 'seconds'}`;
  const minutes = Math.ceil(total / 60);
  if (minutes < 90) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

export const apiErrorMessage = (error) => {
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';

  const status = error.response.status;
  if (status >= 500) return 'Something went wrong on our side. Please try again in a moment.';
  if (status === 429) {
    const seconds = retryAfterSeconds(error, null);
    return seconds ? `Too many requests. Please try again in ${formatWait(seconds)}.` : 'Too many requests. Please try again in a moment.';
  }
  if (status === 401) return 'Please sign in to continue.';

  // A refusal the backend explained (out of stock, not found, not allowed, ...) is worth more than a general sentence
  const sentence = backendSentence(error);
  if (sentence) return sentence;
  if (status === 400) return 'Invalid request. Please check your input.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  return 'Something went wrong. Please try again.';
};
