// What a GUEST has typed into the checkout form, kept in this browser tab so a refresh, a phone that drops the tab while another app is open,
// or an accidental close does not make them start again. It is personal data (name, phone, address), so it is NOT kept in redux-persist's
// localStorage (which outlives the visit and may sit on a shared computer): `sessionStorage` goes when the tab does, and it is cleared as soon
// as the order is placed. Only the contact and delivery fields; never the payment, the coupon or what the shop answered.
const KEY = 'checkout-draft';
const FIELDS = ['name', 'email', 'phone_number', 'shipping_type', 'shipping_area', 'division', 'district', 'upazila', 'address'];

// A browser may refuse storage (private mode, blocked site data): the form then works as it always did.
const storage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const saveCheckoutDraft = (formData) => {
  const store = storage();
  if (!store) return;
  const draft = {};
  FIELDS.forEach((field) => {
    if (typeof formData?.[field] === 'string' && formData[field]) draft[field] = formData[field];
  });
  if (!Object.keys(draft).length) return; // an empty form never wipes the draft: a new page starts empty, and React's StrictMode starts it twice
  try {
    store.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage full or refused: nothing to keep
  }
};

// The saved fields (only known ones, only text), or null when there is nothing.
export const loadCheckoutDraft = () => {
  const store = storage();
  if (!store) return null;
  try {
    const saved = JSON.parse(store.getItem(KEY) || 'null');
    if (!saved || typeof saved !== 'object') return null;
    const draft = {};
    FIELDS.forEach((field) => {
      if (typeof saved[field] === 'string' && saved[field]) draft[field] = saved[field];
    });
    return Object.keys(draft).length ? draft : null;
  } catch {
    return null;
  }
};

export const clearCheckoutDraft = () => {
  try {
    storage()?.removeItem(KEY);
  } catch {
    // nothing to clear
  }
};
