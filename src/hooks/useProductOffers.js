import { getAvailableOffers } from '../services/couponService';
import { sessionRead } from './sessionRead';

// The coupons the shop suggests ([{ code, public_title, min_order_amount, max_discount_amount, ... }], at most 5) or null when it has none.
// Asked without a subtotal: the product page works out for itself whether the price in front of the customer reaches a minimum order.
const [useProductOffers, forgetProductOffers] = sessionRead(async () => {
  const offers = (await getAvailableOffers({}))?.data?.data?.offers;
  return Array.isArray(offers) && offers.length > 0 ? offers : null;
});

export { forgetProductOffers };
export default useProductOffers;
