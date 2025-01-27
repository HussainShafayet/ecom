import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderConfirmation = () => {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto my-12 p-6 bg-gray-50 rounded-lg shadow-md">
      {/* Success Message */}
      <div className="text-center">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase. Your order has been placed successfully.</p>
      </div>

      {/* Order Details */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700">
              <strong>Order ID:</strong> {orderId}
            </p>
            <p className="text-gray-700">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <strong>Total Amount:</strong> $223.07 {/* Replace with actual amount */}
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <strong>Shipping Address:</strong>
            </p>
            <p className="text-gray-600">John Doe</p>
            <p className="text-gray-600">123 Main Street</p>
            <p className="text-gray-600">City, State, ZIP</p>
            <p className="text-gray-600">Country</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
        <ul className="space-y-2 text-gray-700">
          <li>🔍 You can track your order in the <Link to="/orders" className="text-blue-500 underline">Orders</Link> section.</li>
          <li>📦 Your order is being prepared for shipping and will arrive soon.</li>
          <li>💬 For any inquiries, feel free to <Link to="/contact" className="text-blue-500 underline">contact us</Link>.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Link
          to="/products"
          className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="bg-gray-100 text-gray-800 py-2 px-6 rounded-lg shadow hover:bg-gray-200 transition-colors"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
