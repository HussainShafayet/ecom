// The sentences to show for a failed request: the backend's own (`errors`, else `error`), or one general sentence.
// A request that never got an answer (no `response`) is a connection problem, not the shop refusing.
export const errorMessages = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors;
  if (data?.error) return [data.error];
  if (!error?.response) return ['Could not reach the server. Check your connection and try again.'];
  return [fallback];
};
