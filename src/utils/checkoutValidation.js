// What the checkout form asks for, and the sentence for each thing missing. One place, used when a field is left (blur) and
// when the order is placed, so a field never says two different things. The phone rule is the backend's
// (apps/accounts/validators.py): "+880" followed by exactly 10 digits.

// The order the fields are on the page: the first one with a problem is where the customer is taken
export const FIELD_ORDER = ['name', 'phone_number', 'shipping_type', 'shipping_area', 'division', 'district', 'upazila', 'address'];

import { PHONE_DIGITS, normalizePhone, validatePhone } from './phone';

export { PHONE_DIGITS, normalizePhone };

const blank = (value) => !String(value || '').trim();

// The problem with one field, or '' when it is fine (or does not apply to the chosen shipping type).
export const validateField = (name, value, formData = {}) => {
  switch (name) {
    case 'name':
      return blank(value) ? 'Enter your full name' : '';
    case 'phone_number':
      return validatePhone(value);
    case 'shipping_type':
      return blank(value) ? 'Choose your delivery area' : '';
    case 'shipping_area':
      return formData.shipping_type === 'inside_dhaka' && blank(value) ? 'Choose your area in Dhaka' : '';
    case 'division':
      return formData.shipping_type === 'outside_dhaka' && blank(value) ? 'Choose your division' : '';
    case 'district':
      return formData.shipping_type === 'outside_dhaka' && blank(value) ? 'Choose your district' : '';
    case 'upazila':
      return formData.shipping_type === 'outside_dhaka' && blank(value) ? 'Choose your upazila or thana' : '';
    case 'address':
      return blank(value) ? 'Enter your full address (house, road, area)' : '';
    default:
      return '';
  }
};

// Every problem of the form at once: { field: sentence }. `deliveryChargeKnown` false means the shop has no delivery charge
// for the chosen area: the order cannot be priced, so it is not sent (a charge of 0 is a free delivery, not a missing one).
export const validateCheckout = (formData, { deliveryChargeKnown = true } = {}) => {
  const problems = {};
  FIELD_ORDER.forEach((name) => {
    const message = validateField(name, formData?.[name], formData);
    if (message) problems[name] = message;
  });
  if (!problems.shipping_type && !deliveryChargeKnown) {
    problems.delivery_charge = 'We could not work out the delivery charge for this area. Please try another area.';
  }
  return problems;
};
