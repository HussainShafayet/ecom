import React from 'react';

// The price, the one thing the page has to get across: big, on the page itself (it was a pale card stretched across the whole column with one number
// in a corner). A price with a discount is red, the way a deal reads everywhere, with the old price struck through, the discount in a soft red pill
// and what the customer saves; a price without one is plain dark. A new price (another size) fades in instead of snapping.
//   price / oldPrice / discount / saving  already formatted (`formatPrice`, `discountLabel`); the last three are empty without a discount
const PriceTag = ({ price, oldPrice, discount, saving }) => (
  <div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span key={price} className={`text-3xl font-extrabold tracking-tight motion-safe:animate-fade-in sm:text-4xl ${oldPrice ? 'text-red-600' : 'text-gray-900'}`}>{price}</span>
      {oldPrice && <span className="text-lg text-gray-400 line-through">{oldPrice}</span>}
      {oldPrice && discount && <span className="rounded-md bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-600 ring-1 ring-red-100">{discount}</span>}
    </div>
    {saving && <p className="mt-1 text-sm font-medium text-green-700">You save {saving}</p>}
  </div>
);

export default PriceTag;
