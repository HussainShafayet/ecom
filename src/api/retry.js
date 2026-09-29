// src/api/retry.js
// A read that fails because of the connection or a briefly unavailable server is tried again before anyone is told.
// Only GETs (asking twice changes nothing), only for "no answer" and 502/503/504 (a bad gateway or an overloaded server
// often answers a moment later), and only twice, with a growing pause.
const DELAYS_MS = [400, 1200];
const TRANSIENT = [502, 503, 504];

export const canRetry = (error) => {
  const config = error?.config;
  if (!config || String(config.method || 'get').toLowerCase() !== 'get') return false;
  if ((config.__retries || 0) >= DELAYS_MS.length) return false;
  return !error.response || TRANSIENT.includes(error.response.status);
};

// `instance` is the axios client the request came from, so its interceptors (token, errors) run again on the retry.
export const retryRequest = async (instance, error) => {
  const config = error.config;
  config.__retries = (config.__retries || 0) + 1;
  await new Promise((resolve) => setTimeout(resolve, DELAYS_MS[config.__retries - 1]));
  return instance.request(config);
};
