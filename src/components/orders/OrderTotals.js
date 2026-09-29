import React from 'react';
import { formatMoney } from './format';

// The sums of an order, so that they add up: subtotal, delivery, the coupon's discount (only when a coupon took something off,
// with its code) and the total. Only the rows the order carries are drawn (what checkout answers to a guest has no payment, a
// tracked order has no address, but every one of them has these numbers). `delivery_charge` 0 reads "Free".
const OrderTotals = ({ order }) => {
  const discount = Number(order?.discount_amount) || 0;
  const hasSums = order?.subtotal !== undefined && order?.subtotal !== null;

  return (
    <dl className="space-y-1.5 text-sm text-gray-700 sm:text-base">
      {hasSums && (
        <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
      )}
      {hasSums && order.delivery_charge !== undefined && (
        <div className="flex justify-between gap-3"><dt>Delivery</dt><dd>{Number(order.delivery_charge) === 0 ? 'Free' : formatMoney(order.delivery_charge)}</dd></div>
      )}
      {discount > 0 && (
        <div className="flex justify-between gap-3 text-green-700">
          <dt>Discount{order.coupon_code ? <span className="ml-1 rounded bg-green-50 px-1.5 py-0.5 text-xs font-semibold">{order.coupon_code}</span> : null}</dt>
          <dd>−{formatMoney(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-2 text-base font-bold text-gray-900"><dt>Total</dt><dd>{formatMoney(order?.total)}</dd></div>
    </dl>
  );
};

export default OrderTotals;
