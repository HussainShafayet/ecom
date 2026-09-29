// The phone number as the backend wants it (apps/accounts/validators.py): "+880" followed by exactly 10 digits. The storefront
// keeps only those 10 digits in its forms and puts the +880 in front when it sends them.
export const PHONE_PREFIX = '+880';
export const PHONE_DIGITS = 10;

// Whatever was typed into a phone box, as the 10 digits after +880: people type 01712345678 or 8801712345678 or paste
// "+880 1712-345678", and the box has no room for the 0 or the 880.
export const normalizePhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, PHONE_DIGITS);
};

// The problem with the digits of a phone box, or '' when they are fine.
export const validatePhone = (digits) => {
  if (!String(digits || '').trim()) return 'Enter your phone number';
  return /^\d{10}$/.test(String(digits)) ? '' : 'Enter 10 digits after +880, for example 1712345678';
};

// "+880 17•••••678": which number a code went to, without printing all of it on a screen someone may be looking over.
export const maskPhone = (digits) => {
  const clean = normalizePhone(digits);
  if (clean.length < PHONE_DIGITS) return '';
  return `${PHONE_PREFIX} ${clean.slice(0, 2)}•••••${clean.slice(-3)}`;
};
