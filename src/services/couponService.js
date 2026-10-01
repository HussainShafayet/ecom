// src/services/couponService.js
// Previewing a promo code's discount before an order is placed (backend docs/API_CONTRACT.md section 10). Public.
// { discount_amount, total }; a bad/expired/exhausted code is a 400 with one sentence in errors.
export const validateCoupon = async ({ code, subtotal, phone_number }) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.post('/coupons/validate/', { code, subtotal, phone_number }, { section: "coupon" });
};

// The coupons the shop suggests at checkout (backend docs/API_CONTRACT.md section 10), for a cart worth `subtotal`:
// { offers: [{ code, public_title, discount_type, discount_value, min_order_amount, max_discount_amount, eligible, amount_short }] }.
// Only a hint (validate and POST /orders/ decide), so a failure is kept in its own section and never shown.
export const getAvailableOffers = async ({ subtotal }) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get('/coupons/available/', { params: { subtotal }, section: "checkout-offers" });
};
