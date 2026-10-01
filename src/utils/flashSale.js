// The flash sale's window, as the products answer says it (`flash_sale` beside `results`, docs/API_CONTRACT.md): null when the shop set
// none (the sale is then always on, with nothing to count down to), else how many seconds until it starts / ends, measured by the
// SERVER, so a wrong clock on the customer's phone does not matter.

// Turns those seconds into moments on THIS device's clock, from when the answer arrived: `{isLive, startsAt, endsAt}` (milliseconds,
// null where there is no start / end), or null for no window.
export const anchorFlashSale = (sale, receivedAt = Date.now()) => {
  if (!sale) return null;
  const at = (seconds) => (typeof seconds === 'number' ? receivedAt + seconds * 1000 : null);
  return { isLive: Boolean(sale.is_live), startsAt: at(sale.starts_in_seconds), endsAt: at(sale.ends_in_seconds) };
};

const pad = (number) => String(number).padStart(2, '0');

// What the pill shows: "02:14:09", and "2d 05:14:09" from a day up
export const formatCountdown = ({ days, hours, minutes, seconds }) => `${days > 0 ? `${days}d ` : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

const unit = (count, name) => `${count} ${name}${count === 1 ? '' : 's'}`;

// What a screen reader is told instead of a number that changes every second: "2 days 5 hours", "14 minutes", "less than a minute"
export const spokenTime = ({ days, hours, minutes }) => {
  if (days > 0) return [unit(days, 'day'), hours > 0 && unit(hours, 'hour')].filter(Boolean).join(' ');
  if (hours > 0) return [unit(hours, 'hour'), minutes > 0 && unit(minutes, 'minute')].filter(Boolean).join(' ');
  return minutes > 0 ? unit(minutes, 'minute') : 'less than a minute';
};
