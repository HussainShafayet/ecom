// One `Idempotency-Key` per order the customer means to place, kept for retries of THAT order, so a double tap or a retry after a lost answer can
// not place it twice: the shop answers the same key again with the order it already placed (`POST /orders/`, docs/API_CONTRACT.md section 6).
// The key is the same for the same order (the lines, the address, the coupon: what the shop prices and stores) and a new one for another order.
// It is kept in `sessionStorage` (a refresh while the order was on its way must not lose it) and goes once the order is placed.
const STORAGE_KEY = 'order-key';
let remembered = null; // the same, where the browser refuses storage

// What the shop reads of the checkout body: prices and totals the page also sends are ignored by the shop, so they must not make a new key either.
const ORDER_FIELDS = [
  'name', 'email', 'phone_number', 'shipping_type', 'shipping_area', 'shipping_division', 'shipping_district', 'shipping_thana',
  'shipping_address', 'payment_type', 'coupon_code',
];
const orderAsked = (body) =>
  JSON.stringify({
    ...Object.fromEntries(ORDER_FIELDS.map((field) => [field, body?.[field] ?? ''])),
    items: (body?.items || []).map((item) => [item.product_id, item.variant_id ?? null, item.quantity]),
  });

// 8 to 64 of letters, digits and - _ . : (the shop's rule); a UUID. `randomUUID` needs a secure page (https, localhost): a phone testing over plain
// http has `getRandomValues` only.
const newKey = () => {
  const crypto = typeof window !== 'undefined' ? window.crypto : undefined;
  if (crypto?.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const read = () => {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved.asked === 'string' && typeof saved.key === 'string') return saved;
  } catch {
    // no storage, or not what we wrote
  }
  return remembered;
};

const write = (entry) => {
  remembered = entry;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // storage refused: the in-memory copy still serves a retry on this page
  }
};

// The key for this order: the one already given to the same order (a retry), else a new one.
export const orderKeyFor = (body) => {
  const asked = orderAsked(body);
  const entry = read();
  if (entry && entry.asked === asked) return entry.key;
  const next = { asked, key: newKey() };
  write(next);
  return next.key;
};

// The order is placed: the next one is another order and gets another key.
export const forgetOrderKey = () => {
  remembered = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to forget
  }
};
