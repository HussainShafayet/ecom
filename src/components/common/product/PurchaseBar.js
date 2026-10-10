import React from 'react';
import { Link } from 'react-router-dom';

const BUTTON = 'flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100';

// The buy buttons of the product page. On a phone this is a bar fixed to the bottom, just above the bottom navigation (56 px),
// with the price, so Add to Cart never scrolls out of reach; from `md` up, and on a phone held sideways (`short:`), it is an ordinary row in the page.
//   canBuy    false shows "Out of Stock" instead
//   added     the last Add to Cart worked: the button becomes a link to the cart for a moment
//   message   why the shop said no (stock, a missing choice...), written where the customer is looking
const PurchaseBar = ({ price, oldPrice, canBuy, busy, added, message, onAddToCart, onBuyNow }) => (
  <div className="fixed inset-x-0 bottom-14 z-40 motion-safe:animate-slide-up md:animate-none short:animate-none border-t border-gray-200 bg-white px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none short:static short:z-auto short:border-0 short:bg-transparent short:p-0 short:shadow-none">
    {message && <p role="alert" className="mb-2 text-sm text-red-600">{message}</p>}
    {canBuy ? (
      <div className="flex items-center gap-3 md:gap-2 short:gap-2">
        <div className="shrink-0 leading-tight md:hidden short:hidden">
          <div className="text-base font-bold text-gray-900">{price}</div>
          {oldPrice && <div className="text-xs text-gray-400 line-through">{oldPrice}</div>}
        </div>
        {added ? (
          <Link to="/cart" className={`${BUTTON} flex-1 bg-green-600 text-white hover:bg-green-700 md:flex-none short:flex-none`}>✓ Added · View cart</Link>
        ) : (
          <button type="button" onClick={onAddToCart} disabled={busy} className={`${BUTTON} flex-1 bg-blue-600 text-white hover:bg-blue-700 md:flex-none md:px-6 short:flex-none short:px-6`}>
            {busy ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
        <button type="button" onClick={onBuyNow} disabled={busy} className={`${BUTTON} shrink-0 border border-blue-600 text-blue-600 hover:bg-blue-50 md:px-6 short:px-6`}>
          Buy Now
        </button>
      </div>
    ) : (
      <div className="py-2 text-center font-semibold text-red-600">Out of Stock</div>
    )}
  </div>
);

export default PurchaseBar;
