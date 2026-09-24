import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {clearTracking, trackOrder} from '../../redux/slice/orderSlice';
import {ErrorDisplay, Loader} from '../../components/common';
import {OrderItems, OrderStatusBadge, OrderTimeline, formatDate, formatMoney} from '../../components/orders';

// "01712345678", "1712345678" and "+8801712345678" are all the same number; the backend wants "+880" + 10 digits.
const toPhoneNumber = (value) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? `+880${digits}` : null;
};

// Follow an order with its number and the phone number it was placed with (guests have no account to look it up in).
const OrderTracking = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {tracking, trackingLoading, trackingError} = useSelector((state) => state.order);
  const [orderId, setOrderId] = useState(searchParams.get('order_id') || '');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(clearTracking());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone_number = toPhoneNumber(phone);
    if (!orderId.trim()) {
      setFormError(['Enter your order ID.']);
    } else if (!phone_number) {
      setFormError(['Enter the 10 digit phone number you ordered with.']);
    } else {
      setFormError(null);
      dispatch(trackOrder({order_id: orderId.trim(), phone_number}));
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl space-y-8">
      <section className="bg-gray-50 rounded-lg p-6 md:p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Track Your Order</h1>
        <p className="text-gray-600 mb-6 text-center">Enter your order ID and the phone number you ordered with.</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="order_id" className="block text-gray-700 font-medium mb-1">Order ID</label>
            <input
              id="order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="GC-20260923-0001"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone number</label>
            <div className="flex">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">+880</span>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="1712345678"
                inputMode="numeric"
                className="w-full p-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={trackingLoading}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {trackingLoading ? 'Looking up...' : 'Track order'}
          </button>
        </form>
      </section>

      <ErrorDisplay errors={formError || trackingError} />
      {trackingLoading && <Loader message="Looking up your order" />}

      {tracking && (
        <>
          <section className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Order ID: <span className="font-semibold">{tracking.order_id}</span></p>
            <p className="text-gray-600 mb-3">Placed on: <span className="font-semibold">{formatDate(tracking.created_at)}</span></p>
            <OrderStatusBadge status={tracking.status} label={tracking.status_display} />
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Order Status</h2>
            <OrderTimeline history={tracking.history} />
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Items in your order</h2>
            <OrderItems items={tracking.items} />
            <div className="mt-4 space-y-1 text-gray-700">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(tracking.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatMoney(tracking.delivery_charge)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span>{formatMoney(tracking.total)}</span></div>
              {tracking.payment && (
                <p className="text-sm text-gray-500 pt-2">{tracking.payment.method_display}: {tracking.payment.status_display}</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default OrderTracking;
