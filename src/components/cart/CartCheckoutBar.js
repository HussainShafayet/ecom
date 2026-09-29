import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice';

// The total and the way on, fixed to the bottom of the screen where a thumb reaches it. On a phone it sits just above the
// bottom navigation (56 px: `bottom-14`; it used to sit under it, out of sight), from `md` the bottom navigation is gone so
// it is at the very bottom, and from `lg` the order summary beside the list has the button instead.
//   blocked   a line is below its minimum order: checkout is greyed out and the bar says why
const CartCheckoutBar = ({ total, blocked }) => (
  <div className="fixed inset-x-0 bottom-14 z-40 border-t border-gray-200 bg-white px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:bottom-0 lg:hidden">
    {blocked && <p className="mb-1 text-xs text-red-600">Some items are below their minimum order.</p>}
    <div className="flex items-center justify-between gap-3">
      <div className="leading-tight">
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-lg font-bold text-gray-900">{formatPrice(total)}</p>
      </div>
      {blocked ? (
        <span aria-disabled="true" className="flex h-11 cursor-not-allowed items-center rounded-lg bg-gray-300 px-6 font-semibold text-gray-500">
          Checkout <FaArrowRight aria-hidden="true" className="ml-2" />
        </span>
      ) : (
        <Link to="/checkout" className="flex h-11 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">
          Checkout <FaArrowRight aria-hidden="true" className="ml-2" />
        </Link>
      )}
    </div>
  </div>
);

export default CartCheckoutBar;
