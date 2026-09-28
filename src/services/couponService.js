// src/services/couponService.js
// Previewing a promo code's discount before an order is placed (backend docs/API_CONTRACT.md section 10). Public.
// { discount_amount, total }; a bad/expired/exhausted code is a 400 with one sentence in errors.
export const validateCoupon = async ({ code, subtotal, phone_number }) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.post('/coupons/validate/', { code, subtotal, phone_number }, { section: "coupon" });
};
