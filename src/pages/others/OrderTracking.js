import React, {useEffect, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {clearTracking, trackOrder} from '../../redux/slice/orderSlice';
import {ErrorDisplay, Field, PhoneInput, controlClass, describedBy} from '../../components/common';
import {OrderDetailSkeleton} from '../../components/common/skeleton';
import {CopyOrderId, ExpectedDelivery, OrderItems, OrderStatusBadge, OrderTimeline, OrderTotals, formatDate} from '../../components/orders';
import {PHONE_PREFIX, validatePhone} from '../../utils/phone';

const Card = ({title, children}) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    {title && <h2 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">{title}</h2>}
    {children}
  </section>
);

// Follow an order with its number and the phone number it was placed with (guests have no account to look it up in). Phone first:
// one column, labels above 48 px boxes (the phone box is the shop's `PhoneInput`: a fixed +880, the number cleaned as it is typed),
// a full-width button, and the answer scrolled into view (the form fills a phone's screen, the answer would be below it).
const OrderTracking = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {tracking, trackingLoading, trackingError} = useSelector((state) => state.order);
  const [orderId, setOrderId] = useState(searchParams.get('order_id') || '');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false); // problems are shown once the button was pressed
  const resultRef = useRef(null);

  useEffect(() => {
    return () => {
      dispatch(clearTracking());
    };
  }, [dispatch]);

  useEffect(() => {
    if (tracking) resultRef.current?.scrollIntoView?.({behavior: 'smooth', block: 'start'});
  }, [tracking]);

  const problems = {
    orderId: orderId.trim() ? '' : 'Enter your order ID',
    phone: validatePhone(phone),
  };
  const shown = (field) => (submitted && problems[field]) || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (problems.orderId) {
      document.getElementById('track-order-id')?.focus();
    } else if (problems.phone) {
      document.getElementById('track-phone')?.focus();
    } else {
      dispatch(trackOrder({order_id: orderId.trim(), phone_number: PHONE_PREFIX + phone}));
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-8">
      <section className="rounded-lg bg-gray-50 p-4 shadow-md sm:p-8">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-800 sm:text-3xl">Track Your Order</h1>
        <p className="mb-5 text-center text-gray-600">Enter your order ID and the phone number you ordered with.</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field id="track-order-id" label="Order ID" error={shown('orderId')}>
            <input
              id="track-order-id"
              name="order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="GC-20260923-0001"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              aria-invalid={Boolean(shown('orderId'))}
              aria-describedby={describedBy('track-order-id', shown('orderId'))}
              className={controlClass(shown('orderId'))}
            />
          </Field>
          <Field id="track-phone" label="Phone number" error={shown('phone')}>
            <PhoneInput id="track-phone" name="phone" value={phone} onChange={setPhone} error={shown('phone')} enterKeyHint="go" />
          </Field>
          <button
            type="submit"
            disabled={trackingLoading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
          >
            {trackingLoading ? 'Looking up…' : 'Track order'}
          </button>
        </form>
      </section>

      <ErrorDisplay errors={trackingError} />
      {trackingLoading && <OrderDetailSkeleton />}

      {tracking && (
        <div ref={resultRef} className="scroll-mt-4 space-y-4 sm:space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="break-all text-lg font-bold text-gray-800">{tracking.order_id}</p>
                  <CopyOrderId value={tracking.order_id} />
                </div>
                <p className="text-sm text-gray-500">Placed on {formatDate(tracking.created_at)}</p>
                <ExpectedDelivery expected={tracking.expected_delivery} className="mt-1" />
              </div>
              <OrderStatusBadge status={tracking.status} label={tracking.status_display} />
            </div>
          </Card>

          <Card title="Order Status">
            <OrderTimeline history={tracking.history} />
          </Card>

          <Card title="Items in your order">
            <OrderItems items={tracking.items} />
            <div className="mt-3 border-t border-gray-200 pt-3">
              <OrderTotals order={tracking} />
              {tracking.payment && (
                <p className="pt-2 text-sm text-gray-500">{tracking.payment.method_display}: {tracking.payment.status_display}</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
