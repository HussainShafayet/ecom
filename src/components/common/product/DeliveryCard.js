import React from 'react';
import { FaTruck, FaUndoAlt } from 'react-icons/fa';
import useDeliveryInfo from '../../../hooks/useDeliveryInfo';
import { formatPrice } from '../../../utils/formatPrice';
import { deliveryEstimateText } from '../../../utils/delivery';

const CHIP = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600';
const AREAS = [['inside_dhaka', 'Inside Dhaka'], ['outside_dhaka', 'Outside Dhaka']];

// What delivery costs and how long it takes, before the customer has to open the checkout to find out. The numbers are the shop's own
// (`/content/checkout/`: charges and, where the shop made a promise, estimates): nothing is written here. The return policy is the
// product's own text, so the card only points at it.
//   hasReturnPolicy  the product has a return policy to read
//   onShowReturns    opens it
const DeliveryCard = ({ hasReturnPolicy = false, onShowReturns }) => {
  const [info, loading] = useDeliveryInfo();
  if (loading) return <div aria-hidden="true" className="h-[204px] animate-pulse rounded-2xl bg-gray-100" />;

  const areas = info ? AREAS.filter(([key]) => info.charges?.[key] !== undefined && info.charges?.[key] !== null) : [];
  if (areas.length === 0 && !hasReturnPolicy) return null;

  return (
    <section aria-label="Delivery and returns" className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Delivery &amp; returns</h2>
      <ul className="space-y-3">
        {areas.map(([key, label]) => {
          const charge = Number(info.charges[key]);
          const estimate = deliveryEstimateText(info.estimates?.[key]);
          return (
            <li key={key} className="flex items-start gap-3">
              <span aria-hidden="true" className={CHIP}><FaTruck /></span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}: {charge === 0 ? 'Free' : formatPrice(charge)}</p>
                {estimate && <p className="text-xs text-gray-500">{estimate}</p>}
              </div>
            </li>
          );
        })}
        {hasReturnPolicy && (
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className={CHIP}><FaUndoAlt /></span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">Returns</p>
              <button type="button" onClick={onShowReturns} className="py-1 text-xs font-medium text-indigo-700 underline">Read the return policy</button>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
};

export default DeliveryCard;
