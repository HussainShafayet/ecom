import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {cancelOrder, clearOrder, fetchOrder} from '../redux/slice/orderSlice';
import {clearSectionError} from '../redux/slice/globalErrorSlice';
import {ErrorDisplay, SectionError} from '../components/common';
import {OrderDetailSkeleton} from '../components/common/skeleton';
import {BuyAgain, CopyOrderId, ExpectedDelivery, OrderItems, OrderStatusBadge, OrderTimeline, OrderTotals, addressLines, formatDate, formatMoney} from '../components/orders';

const Card = ({title, children, className = ''}) => (
  <section className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
    {title && <h2 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">{title}</h2>}
    {children}
  </section>
);

// One of my orders in full: who and when, the progress (small), the items and the sums (a coupon's discount included), where it
// goes and how it is paid, and, while it is still pending, a Cancel that asks in the page instead of in a browser dialog.
const OrderDetail = () => {
  const {orderId} = useParams();
  const dispatch = useDispatch();
  const {order, orderError, orderNotFound, cancelLoading, cancelError} = useSelector((state) => state.order);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, orderId]);

  const retry = () => {
    dispatch(clearSectionError('order-details'));
    dispatch(fetchOrder(orderId));
  };

  const cancel = async () => {
    await dispatch(cancelOrder(orderId));
    setConfirming(false);
  };

  if (!order) {
    if (orderError) {
      return (
        <div className="container mx-auto max-w-3xl px-3 py-6 text-center">
          {orderNotFound ? (
            <div role="alert" className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 px-4 py-6">
              <p className="font-semibold text-gray-800">We couldn&apos;t find this order.</p>
              <p className="mt-1 text-sm text-gray-600">{orderError.join(' ')}</p>
            </div>
          ) : (
            <SectionError message={orderError.join(' ')} onRetry={retry} />
          )}
          <Link to="/orders" className="mt-2 inline-flex h-11 items-center text-blue-700 underline">Back to my orders</Link>
        </div>
      );
    }
    // not asked yet, or on its way
    return <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8"><OrderDetailSkeleton /></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-8">
      <div>
        <Link to="/orders" className="inline-flex h-11 items-center text-sm text-blue-700 hover:underline">← My orders</Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="break-all text-xl font-bold text-gray-800 sm:text-3xl">{order.order_id}</h1>
              <CopyOrderId value={order.order_id} />
            </div>
            <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
            <ExpectedDelivery expected={order.expected_delivery} className="mt-1" />
          </div>
          <OrderStatusBadge status={order.status} label={order.status_display} />
        </div>
      </div>

      <Card title="Progress">
        <OrderTimeline history={order.history} />
      </Card>

      <Card title="Items">
        <OrderItems items={order.items} />
        <div className="mt-3 border-t border-gray-200 pt-3">
          <OrderTotals order={order} />
        </div>
        <BuyAgain order={order} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <Card title="Delivery address">
          <p className="text-gray-800">{order.name}</p>
          {addressLines(order).map((line) => <p key={line} className="text-sm text-gray-600 sm:text-base">{line}</p>)}
          <p className="mt-1 text-sm text-gray-600 sm:text-base">{order.phone_number}</p>
        </Card>
        <Card title="Payment">
          {order.payment ? (
            <>
              <p className="text-gray-800">{order.payment.method_display}</p>
              <p className="text-sm text-gray-600 sm:text-base">{order.payment.status_display} · {formatMoney(order.payment.amount)}</p>
            </>
          ) : (
            <p className="text-gray-600">No payment record.</p>
          )}
        </Card>
      </div>

      {order.can_cancel && (
        <Card>
          <ErrorDisplay errors={cancelError} />
          {confirming ? (
            <div role="alertdialog" aria-labelledby="cancel-title" className="space-y-3">
              <p id="cancel-title" className="font-semibold text-gray-800">Cancel this order?</p>
              <p className="text-sm text-gray-600">The items go back into stock. This cannot be undone.</p>
              <div className="flex flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={cancelLoading}
                  className="h-12 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 sm:flex-1"
                >
                  {cancelLoading ? 'Cancelling…' : 'Yes, cancel order'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={cancelLoading}
                  className="h-12 rounded-lg border border-gray-300 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 sm:flex-1"
                >
                  Keep order
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-gray-600">You can still cancel this order. Once it is being handled, please contact us instead.</p>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="h-12 w-full rounded-lg border border-red-300 bg-white font-semibold text-red-700 hover:bg-red-50 sm:w-auto sm:px-8"
              >
                Cancel order
              </button>
            </>
          )}
        </Card>
      )}
      {!order.can_cancel && cancelError && <ErrorDisplay errors={cancelError} />}

      <p className="pb-2 text-center text-sm text-gray-600">
        Need help with this order? <Link to="/contact" className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline">Contact us</Link>
      </p>
    </div>
  );
};

export default OrderDetail;
