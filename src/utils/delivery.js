// How long delivery takes, as the shop promised it (backend docs/API_CONTRACT.md section 6: `delivery_estimates` at checkout,
// `expected_delivery` on an order). Calendar days; nothing at all when the shop made no promise.

const days = (count) => `${count} ${count === 1 ? 'day' : 'days'}`;

// { min_days: 2, max_days: 3 } -> "Delivery in 2–3 days"; { 2, 2 } -> "Delivery in 2 days"; no estimate -> ''
export const deliveryEstimateText = (estimate) => {
  const min = estimate?.min_days;
  const max = estimate?.max_days;
  if (!Number.isInteger(min) || !Number.isInteger(max)) return '';
  return min === max ? `Delivery in ${days(min)}` : `Delivery in ${min}–${max} days`;
};

// 'YYYY-MM-DD' is a calendar day, not a moment: read it as the same day on this device (new Date('2026-10-05') would be UTC midnight,
// the 4th in a timezone west of Greenwich)
const calendarDay = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(year, month - 1, day);
};

// { earliest: '2026-10-05', latest: '2026-10-07' } -> "Oct 5 – 7" (or "5–7 Oct", as the reader's language writes it); one day: "Oct 5";
// no estimate -> ''. `locale` is only for tests.
export const expectedText = (expected, locale) => {
  if (!expected?.earliest || !expected?.latest) return '';
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const from = calendarDay(expected.earliest);
  const to = calendarDay(expected.latest);
  return from.getTime() === to.getTime() ? format.format(from) : format.formatRange(from, to);
};
