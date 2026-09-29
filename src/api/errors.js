// src/api/errors.js
// What to tell the customer about a failed request. One place for both axios clients (they used to keep a copy each).

// The backend's own sentence for a refused request (`errors[0]`, else `error`; docs/API_CONTRACT.md), if it sent one.
const backendSentence = (error) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0 && typeof data.errors[0] === 'string') return data.errors[0];
  if (typeof data?.error === 'string' && data.error) return data.error;
  return null;
};

// `Retry-After` is a number of seconds (the backend's throttles send it with a 429).
const secondsToWait = (error) => {
  const seconds = Number(error?.response?.headers?.['retry-after']);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

export const apiErrorMessage = (error) => {
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';

  const status = error.response.status;
  if (status >= 500) return 'Something went wrong on our side. Please try again in a moment.';
  if (status === 429) {
    const seconds = secondsToWait(error);
    return seconds ? `Too many requests. Please try again in ${seconds} seconds.` : 'Too many requests. Please try again in a moment.';
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
