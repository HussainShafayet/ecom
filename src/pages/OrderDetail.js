import React, {useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {cancelOrder, clearOrder, fetchOrder} from '../redux/slice/orderSlice';
import {ErrorDisplay, Loader} from '../components/common';
import {OrderItems, OrderStatusBadge, OrderTimeline, addressLines, formatDate, formatMoney} from '../components/orders';

// One of my orders in full, with the status history and, while it is still pending, a Cancel button.
const OrderDetail = () => {
  const {orderId} = useParams();
  const dispatch = useDispatch();
  const {order, orderLoading, orderError, cancelLoading, cancelError} = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, orderId]);

  const handleCancel = () => {
    if (window.confirm('Cancel this order? The items go back into stock.')) {
      dispatch(cancelOrder(orderId));
    }
  };

  if (orderLoading && !order) {
    return <div className="container mx-auto my-12 p-4"><Loader message="Loading your order" /></div>;
  }
  if (!order) {
    return (
      <div className="container mx-auto my-12 p-4 max-w-3xl text-center">
        <ErrorDisplay errors={orderError} />
        <Link to="/orders" className="text-blue-500 underline">Back to my orders</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 p-4 max-w-4xl space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <Link to="/orders" className="text-sm text-blue-500 hover:underline">← My orders</Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{order.order_id}</h1>
          <p className="text-gray-500 text-sm">Placed on {formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} label={order.status_display} />
      </div>

      <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Progress</h2>
        <OrderTimeline history={order.history} />
      </section>

      <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Items</h2>
        <OrderItems items={order.items} />
        <div className="mt-4 space-y-1 text-gray-700 text-sm sm:text-base">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{formatMoney(order.delivery_charge)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span>{formatMoney(order.total)}</span></div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Delivery address</h2>
          <p className="text-gray-800">{order.name}</p>
          {addressLines(order).map((line) => <p key={line} className="text-gray-600">{line}</p>)}
          <p className="text-gray-600 mt-1">{order.phone_number}</p>
        </section>
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment</h2>
          {order.payment ? (
            <>
              <p className="text-gray-800">{order.payment.method_display}</p>
              <p className="text-gray-600">{order.payment.status_display} · {formatMoney(order.payment.amount)}</p>
            </>
          ) : (
            <p className="text-gray-600">No payment record.</p>
          )}
        </section>
      </div>

      {order.can_cancel && (
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <ErrorDisplay errors={cancelError} />
          <p className="text-gray-600 text-sm mb-3">You can still cancel this order. Once it is being handled, please contact us instead.</p>
          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel order'}
          </button>
        </section>
      )}
      {!order.can_cancel && cancelError && <ErrorDisplay errors={cancelError} />}
    </div>
  );
};

export default OrderDetail;
