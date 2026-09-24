import React, {useEffect} from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {resetForm} from '../redux/slice/checkoutSlice';
import {clearOrder, fetchOrder} from '../redux/slice/orderSlice';
import {OrderItems, addressLines, formatDate, formatMoney} from '../components/orders';

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
    <div className="container mx-auto my-12 p-6 max-w-3xl bg-gray-50 rounded-lg shadow-md">
      {/* Success Message */}
      <div className="w-full flex flex-col justify-center items-center text-center">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 mt-2 px-4">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700">
              <strong>Order ID:</strong> {orderId}
            </p>
            {summary && (
              <>
                <p className="text-gray-700">
                  <strong>Date:</strong> {formatDate(summary.created_at)}
                </p>
                <p className="text-gray-700">
                  <strong>Total Amount:</strong> {formatMoney(summary.total)}
                </p>
              </>
            )}
            {!isAuthenticated && (
              <p className="text-gray-500 text-sm mt-2">Keep this order ID: with the phone number you ordered with, it lets you follow your order.</p>
            )}
          </div>
          {full && (
            <div>
              <p className="text-gray-700">
                <strong>Shipping Address:</strong>
              </p>
              <p className="text-gray-600">{full.name}</p>
              {addressLines(full).map((line) => <p key={line} className="text-gray-600">{line}</p>)}
            </div>
          )}
        </div>
        {full && <div className="mt-4"><OrderItems items={full.items} /></div>}
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Next Steps
        </h2>
        <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
          <li>🔍 You can follow your order {isAuthenticated ? <>in the <Link to="/orders" className="text-blue-500 underline">Orders</Link> section</> : <>on the <Link to={viewLink} className="text-blue-500 underline">Order Tracking</Link> page</>}.</li>
          <li>📦 Your order is being prepared for shipping and will arrive soon.</li>
          <li>💬 For any inquiries, feel free to <Link to="/contact" className="text-blue-500 underline">contact us</Link>.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          to="/products"
          className="w-full sm:w-auto text-center bg-blue-500 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to={viewLink}
          className="w-full sm:w-auto text-center bg-gray-100 text-gray-800 py-2 px-6 rounded-lg shadow hover:bg-gray-200 transition-colors"
        >
          {isAuthenticated ? 'View Order' : 'Track Order'}
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
