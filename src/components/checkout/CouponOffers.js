import React from 'react';
import { FaTicketAlt } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice';

// The coupons the shop suggests at checkout, so a customer does not need to know a code. A hint only: tapping one runs the same
// check as typing its code (the backend decides, and says why when it refuses).
//   offers    [{ code, public_title, min_order_amount, max_discount_amount, eligible, amount_short }]
//   disabled  true while a code is being checked
//   onUse     (offer) => void
const conditions = (offer) => [
  offer.min_order_amount ? `Min order ${formatPrice(offer.min_order_amount)}` : null,
  offer.max_discount_amount ? `Up to ${formatPrice(offer.max_discount_amount)} off` : null,
].filter(Boolean).join(' · ');

const OfferBody = ({ offer }) => (
  <>
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow ring-2 ${offer.eligible ? 'bg-white text-indigo-600 ring-indigo-100' : 'bg-gray-100 text-gray-400 ring-gray-200'}`}
    >
      <FaTicketAlt />
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block text-sm font-semibold ${offer.eligible ? 'text-gray-900' : 'text-gray-500'}`}>{offer.public_title}</span>
      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`rounded border border-dashed px-1.5 text-xs font-semibold tracking-wide ${offer.eligible ? 'border-indigo-300 bg-white text-indigo-700' : 'border-gray-300 text-gray-500'}`}>{offer.code}</span>
        {conditions(offer) && <span className="text-xs text-gray-500">{conditions(offer)}</span>}
      </span>
      {!offer.eligible && <span className="mt-1 block text-xs font-medium text-amber-700">Add {formatPrice(offer.amount_short)} more to use {offer.code}</span>}
    </span>
  </>
);

const CouponOffers = ({ offers, disabled = false, onUse }) => {
  if (!offers || offers.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="mb-2 text-sm font-semibold text-gray-900">Offers for you</p>
      <ul className="space-y-2">
        {offers.map((offer) => (
          <li key={offer.code}>
            {offer.eligible ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onUse(offer)}
                aria-label={`Use ${offer.code}: ${offer.public_title}`}
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-left hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <OfferBody offer={offer} />
                <span aria-hidden="true" className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">Apply</span>
              </button>
            ) : (
              <div className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <OfferBody offer={offer} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CouponOffers;
