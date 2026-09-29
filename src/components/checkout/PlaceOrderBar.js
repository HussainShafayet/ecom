import React from 'react';
import { formatPrice } from '../../utils/formatPrice';

// The total and Place Order, fixed to the bottom of the screen where a thumb reaches them, so the order can be placed without
// scrolling back. On a phone it sits just above the bottom navigation (56 px: `bottom-14`), from `md` at the very bottom (no
// navigation), from `lg` it is an ordinary button under the form (the summary beside the form shows the total).
//   deliveryKnown   false until a delivery area is chosen: the total does not have the delivery charge yet, and says so
const PlaceOrderBar = ({ total, loading, deliveryKnown }) => (
  <div className="fixed inset-x-0 bottom-14 z-40 border-t border-gray-200 bg-white px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:bottom-0 lg:static lg:z-auto lg:mt-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
    <div className="flex items-center gap-3">
      <div className="shrink-0 leading-tight lg:hidden">
        <p className="text-xs text-gray-500">Total{!deliveryKnown && ' + delivery'}</p>
        <p className="text-lg font-bold text-gray-900">{formatPrice(total)}</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex h-12 flex-1 items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? 'Placing order…' : 'Place Order'}
      </button>
    </div>
  </div>
);

export default PlaceOrderBar;
