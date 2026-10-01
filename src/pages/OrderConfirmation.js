import React, {useEffect} from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {resetForm} from '../redux/slice/checkoutSlice';
import {clearOrder, fetchOrder} from '../redux/slice/orderSlice';
import {CopyOrderId, ExpectedDelivery, OrderItems, OrderTotals, addressLines, formatDate} from '../components/orders';

// After "Place order": the good news and the order number first, what to press next (View / Track order) before anything else, then
// what was ordered. One column of cards that fits a 360 px phone (the old page put white cards inside a grey card inside padding).
const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { order: detail } = useSelector((state) => state.order);
  const placed = location.state?.order; // what POST /orders/ answered (Checkout hands it over)

  useEffect(() => {
    dispatch(resetForm());
  }, [dispatch])

  // A signed-in customer's order can be read back (also after a refresh); a guest only has what checkout handed over.
  useEffect(() => {
    isAuthenticated && dispatch(fetchOrder(orderId));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, isAuthenticated, orderId])

  const full = detail?.order_id === orderId ? detail : null;
  const summary = full || (placed?.order_id === orderId ? placed : null);
  const viewLink = isAuthenticated ? `/orders/${orderId}` : `/order-tracking?order_id=${orderId}`;

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-3 py-6 sm:py-10">
      <div className="text-center">
        <FaCheckCircle className="mx-auto mb-3 text-5xl text-green-500 sm:text-6xl" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 pl-4 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500">Order ID</p>
          <p className="break-all font-semibold text-gray-900">{orderId}</p>
        </div>
        <CopyOrderId value={orderId} />
      </div>
      {!isAuthenticated && (
        <p className="text-center text-sm text-gray-500">Keep this order ID: with the phone number you ordered with, it lets you follow your order.</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Link
          to={viewLink}
          className="flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white shadow hover:bg-blue-700 sm:flex-1"
        >
          {isAuthenticated ? 'View Order' : 'Track Order'}
        </Link>
        <Link
          to="/products"
          className="flex h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50 sm:flex-1"
        >
          Continue Shopping
        </Link>
      </div>

      {summary && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">Order Summary</h2>
          <p className="mb-3 text-sm text-gray-600">Placed on {formatDate(summary.created_at)}</p>
          <ExpectedDelivery expected={summary.expected_delivery} className="-mt-2 mb-3" />
          {full && <div className="mb-3"><OrderItems items={full.items} /></div>}
          <div className={full ? 'border-t border-gray-200 pt-3' : ''}>
            <OrderTotals order={summary} />
          </div>
          {full && (
            <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-600 sm:text-base">
              <p className="font-semibold text-gray-800">Shipping Address</p>
              <p>{full.name}</p>
              {addressLines(full).map((line) => <p key={line}>{line}</p>)}
            </div>
          )}
        </section>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">Next Steps</h2>
        <ul className="space-y-2 text-sm text-gray-700 sm:text-base">
          <li>🔍 You can follow your order {isAuthenticated ? <>in the <Link to="/orders" className="text-blue-700 underline">Orders</Link> section</> : <>on the <Link to={viewLink} className="text-blue-700 underline">Order Tracking</Link> page</>}.</li>
          <li>📦 Your order is being prepared for shipping and will arrive soon.</li>
          <li>💬 For any inquiries, feel free to <Link to="/contact" className="text-blue-700 underline">contact us</Link>.</li>
        </ul>
      </section>
    </div>
  );
};

export default OrderConfirmation;
