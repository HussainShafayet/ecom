import React, { useEffect, useState } from 'react';
import { FaCheck, FaCopy, FaTicketAlt } from 'react-icons/fa';
import useProductOffers from '../../../hooks/useProductOffers';
import { conditions } from '../../checkout/CouponOffers';
import { formatPrice } from '../../../utils/formatPrice';

const MAX_OFFERS = 3;

// The coupons the shop suggests (the ones the checkout lists as "Offers for you"), where the customer decides to buy. Tapping Copy puts the
// code on the clipboard to paste at the checkout; a code with a minimum order says how much more it needs for what is on the page now
// (a hint: the checkout decides). Nothing is drawn when the shop suggests none.
//   subtotal  what the page's price times the quantity comes to, in taka
const OffersCard = ({ subtotal = 0 }) => {
  const [offers] = useProductOffers();
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!offers) return null;

  // Only where the browser lets a page copy (not a page opened over plain http): the code is on the screen to be read either way
  const canCopy = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
    } catch {
      // refused: the code is still there to read
    }
  };

  return (
    <section aria-label="Offers" className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Offers for you</h2>
      <ul className="space-y-3">
        {offers.slice(0, MAX_OFFERS).map((offer) => {
          const minimum = Number(offer.min_order_amount) || 0;
          const short = minimum - subtotal;
          return (
            <li key={offer.code} className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow ring-2 ring-indigo-100"><FaTicketAlt /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{offer.public_title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded border border-dashed border-indigo-300 bg-white px-1.5 text-xs font-semibold tracking-wide text-indigo-700">{offer.code}</span>
                  {conditions(offer) && <span className="text-xs text-gray-500">{conditions(offer)}</span>}
                </p>
                {short > 0 && <p className="mt-1 text-xs font-medium text-amber-700">Add {formatPrice(Math.ceil(short))} more to use {offer.code}</p>}
              </div>
              {canCopy && (
                <button
                  type="button"
                  onClick={() => copy(offer.code)}
                  aria-label={copied === offer.code ? `${offer.code} copied` : `Copy code ${offer.code}`}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  {copied === offer.code ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
                  {copied === offer.code ? 'Copied' : 'Copy'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default OffersCard;
