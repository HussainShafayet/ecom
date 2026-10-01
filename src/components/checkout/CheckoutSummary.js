import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { discountLabel, formatPrice } from '../../utils/formatPrice';
import defaultImage from '../../assets/images/default_product_image.jpg';
import CouponOffers from './CouponOffers';

// The order, read-only (it is changed in the cart, where the minimum order, the stock and Undo are handled): what is in it, a
// promo code, and what it comes to. On a phone it is folded under one line ("Order summary (2 items)  ৳1,400"), opened with a tap,
// so the form is the first thing on the page; from `lg` it is always open beside the form.
//   shipping   the delivery charge, or null before an area is chosen
//   coupon     { status, error, appliedCode, input, onInput, onApply, onRemove, offers, onUseOffer }
//              offers: what the shop suggests (see CouponOffers); on a phone the folded header says when there are some
const CheckoutSummary = ({ items, subtotal, discount, shipping, total, coupon }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const count = items.length;
  const offers = coupon.offers || [];
  const usableOffers = offers.filter((offer) => offer.eligible).length;

  return (
    <section aria-label="Order summary" className="rounded-lg border border-gray-200 bg-white lg:sticky lg:top-24">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left lg:pointer-events-none"
      >
        <span>
          <span className="font-semibold text-gray-900">
            Order summary <span className="font-normal text-gray-500">({count} {count === 1 ? 'item' : 'items'})</span>
          </span>
          {!open && coupon.status !== 'applied' && usableOffers > 0 && (
            <span className="block text-xs font-medium text-indigo-700 lg:hidden">{usableOffers === 1 ? '1 offer' : `${usableOffers} offers`} for you: tap to see</span>
          )}
        </span>
        <span className="flex items-center gap-2 font-bold text-gray-900">
          {formatPrice(total)}
          <FaChevronDown aria-hidden="true" className={`text-gray-500 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div id={id} className={`border-t border-gray-100 px-4 pb-4 ${open ? 'block' : 'hidden'} lg:block`}>
        <ul className="divide-y divide-gray-100 lg:max-h-[45vh] lg:overflow-y-auto">
          {items.map((item) => {
            const unit = item.has_discount ? item.discount_price : item.base_price;
            const details = [item.brand_name, item.color_name && `Color: ${item.color_name}`, item.size_name && `Size: ${item.size_name}`].filter(Boolean).join(' · ');
            return (
              <li key={`${item.id}-${item.variant_id ?? 0}`} className="flex gap-3 py-3">
                <img src={item.image || defaultImage} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-gray-50 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-gray-900">
                    <Link to={`/products/detail/${item.slug}`} className="hover:text-blue-600">{item.name}</Link>
                  </p>
                  {details && <p className="text-xs text-gray-500">{details}</p>}
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {formatPrice(unit)}
                    {item.has_discount && <span className="ml-1 text-red-600">({discountLabel(item.discount_value, item.discount_type)})</span>}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-900">{formatPrice(unit * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <Link to="/cart" className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 hover:text-blue-700">Edit cart</Link>

        {/* Promo code */}
        <div className="my-3 border-t border-gray-100 pt-3">
          {coupon.status === 'applied' ? (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <span className="text-sm font-medium text-green-700">
                Coupon <strong>{coupon.appliedCode}</strong> applied
              </span>
              <button type="button" onClick={coupon.onRemove} className="min-h-10 px-2 text-sm font-medium text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                aria-label="Promo code"
                autoCapitalize="characters"
                value={coupon.input}
                onChange={(event) => coupon.onInput(event.target.value)}
                disabled={coupon.status === 'validating'}
                className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={coupon.onApply}
                disabled={coupon.status === 'validating' || !coupon.input.trim()}
                className="h-12 shrink-0 rounded-lg bg-gray-800 px-5 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {coupon.status === 'validating' ? '...' : 'Apply'}
              </button>
            </div>
          )}
          {coupon.status === 'failed' && <p className="mt-1 text-sm text-red-600">{coupon.error}</p>}
          {coupon.status !== 'applied' && <CouponOffers offers={offers} disabled={coupon.status === 'validating'} onUse={coupon.onUseOffer} />}
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {coupon.status === 'applied' && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === null ? 'Choose an area' : formatPrice(shipping)}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </section>
  );
};

export default CheckoutSummary;
