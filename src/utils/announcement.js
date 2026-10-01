// The announcement bar as `GET /site/` says it (backend docs/API_CONTRACT.md): `{text, link, ends_in_seconds}`, or null for no bar.
// `ends_in_seconds` is how long the bar has left, measured by the SERVER (so a wrong clock on the customer's phone does not matter),
// or null when the admin set no end.

// Turns those seconds into a moment on THIS device's clock, from when the answer arrived: `{text, link, endsAt}` (`endsAt` in
// milliseconds since 1970, null for no end), or null for no bar. Nothing here is persisted: a moment of this session's clock would
// mean nothing in the next one.
export const anchorAnnouncement = (announcement, receivedAt = Date.now()) => {
  if (!announcement) return null;
  const { ends_in_seconds: seconds, ...rest } = announcement;
  return { ...rest, endsAt: typeof seconds === 'number' ? receivedAt + seconds * 1000 : null };
};
