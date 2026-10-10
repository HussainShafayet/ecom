import React from 'react';

// The price, the one thing the page has to get across: big, with the discount and what the customer saves, on a soft card in the shop's own
// colours (the gradient of the sign-in and profile pages, kept light so the numbers stay readable).
//   price / oldPrice / saving  already formatted (`formatPrice`); oldPrice and saving are '' / null without a discount
const PriceCard = ({ price, oldPrice, discount, saving }) => (
  <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 ring-1 ring-indigo-100">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span key={price} className="text-3xl font-bold text-gray-900 motion-safe:animate-fade-in">{price}</span>{/* a new price (another size) fades in instead of snapping */}
      {oldPrice && <span className="text-base text-gray-400 line-through">{oldPrice}</span>}
      {oldPrice && discount && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{discount}</span>}
    </div>
    {saving && <p className="mt-1 text-sm font-medium text-green-700">You save {saving}</p>}
  </div>
);

export default PriceCard;
