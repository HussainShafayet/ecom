// Where a list was scrolled to when the shopper left it (for a product, say), per history entry (`location.key`: the entry Back
// returns to is the same one), so Back puts them where they were. Kept in memory for this visit only.
const positions = new Map();

export const rememberScroll = (key, top) => {
  positions.set(key, Math.max(0, Math.round(top)));
};

// undefined when nothing was remembered for this entry
export const recallScroll = (key) => positions.get(key);

// Scrolls `box` to `top` at once (never an animation: they are being put back, not taken anywhere). The page is not always tall enough
// yet (cards draw before their pictures settle), so it tries again on the next frames, a few times, until it is where it should be.
export const restoreScroll = (box, top, frames = 30) => {
  if (!box) return;
  const attempt = (left) => {
    box.scrollTop = top;
    if (Math.abs(box.scrollTop - top) > 1 && left > 0 && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => attempt(left - 1));
    }
  };
  attempt(frames);
};
