import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartCount, selectTotalPrice } from '../../redux/slice/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import defaultImage from '../../assets/images/default_product_image.jpg';

// How many of the cart's pictures the strip shows before "+N"
const SHOWN = 3;

// Where the shopper left off: when there is something in the cart (this phone's, or the shop's for a signed-in customer, which `Layout` reads),
// one strip under the categories with its first pictures, how many items and what they come to, a tap on it opens the cart and a 44 px
// Checkout button goes straight on. Nothing at all with an empty cart. The cart is already on the device, so there is no request and no skeleton.
const CartReminder = () => {
  const items = useSelector((state) => state.cart?.cartItems);
  const count = useSelector((state) => (state.cart ? selectCartCount(state) : 0));
  const total = useSelector((state) => (state.cart ? selectTotalPrice(state) : 0));
  if (!items?.length) return null;

  return (
    <section aria-label="Your cart" className="my-4 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
      <Link to="/cart" className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex shrink-0 -space-x-3" aria-hidden="true">
          {items.slice(0, SHOWN).map((item) => (
            <img
              key={`${item.id}-${item.variant_id ?? 0}`}
              src={item.image || defaultImage}
              alt=""
              className="h-11 w-11 rounded-full border-2 border-white bg-white object-cover"
            />
          ))}
          {items.length > SHOWN && (
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xs font-bold text-white">
              +{items.length - SHOWN}
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-gray-900">Your cart is waiting</span>
          <span className="block truncate text-xs text-gray-600">{count} {count === 1 ? 'item' : 'items'} · {formatPrice(total)}</span>
        </span>
      </Link>
      <Link to="/checkout" className="flex h-11 shrink-0 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
        Checkout
      </Link>
    </section>
  );
};

export default CartReminder;
