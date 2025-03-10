//import React from 'react';
//import { FaCheckCircle, FaTruck, FaBoxOpen, FaHome, FaHeadset } from 'react-icons/fa';

//const OrderTracking = () => {
//  const orderStatus = [
//    { status: 'Order Placed', date: 'Jan 15, 2023', icon: <FaCheckCircle />, completed: true },
//    { status: 'Processing', date: 'Jan 16, 2023', icon: <FaBoxOpen />, completed: true },
//    { status: 'Shipped', date: 'Jan 18, 2023', icon: <FaTruck />, completed: true },
//    { status: 'Out for Delivery', date: 'Jan 20, 2023', icon: <FaHome />, completed: false },
//    { status: 'Delivered', date: 'Expected Jan 21, 2023', icon: <FaHome />, completed: false },
//  ];

//  return (
//    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
//      {/* Order Details Section */}
//      <section className="bg-gray-50 rounded-lg p-6 md:p-8 text-center shadow-md">
//        <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Tracking</h2>
//        <p className="text-gray-600 mb-2">Order ID: <span className="font-semibold">123456789</span></p>
//        <p className="text-gray-600 mb-2">Placed on: <span className="font-semibold">Jan 15, 2023</span></p>
//        <p className="text-blue-600 font-semibold">Status: Out for Delivery</p>
//      </section>

//      {/* Tracking Steps */}
//      <section className="space-y-6">
//        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Order Status</h3>
//        <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
//          {orderStatus.map((step, index) => (
//            <div
//              key={index}
//              className={`flex flex-col items-center p-4 rounded-lg shadow-lg ${
//                step.completed ? 'bg-blue-100' : 'bg-gray-100'
//              }`}
//            >
//              <div className={`text-3xl ${step.completed ? 'text-blue-500' : 'text-gray-400'}`}>
//                {step.icon}
//              </div>
//              <p className="text-lg font-semibold mt-2 text-gray-800">{step.status}</p>
//              <p className="text-sm text-gray-600">{step.date}</p>
//              {index < orderStatus.length - 1 && (
//                <div className={`h-8 w-1 bg-${step.completed ? 'blue' : 'gray'}-300 lg:h-1 lg:w-8 mt-4 lg:mt-0`}></div>
//              )}
//            </div>
//          ))}
//        </div>
//      </section>

//      {/* Estimated Delivery Section */}
//      <section className="bg-white shadow-lg rounded-lg p-6 text-center">
//        <h3 className="text-xl font-semibold text-gray-800 mb-2">Estimated Delivery</h3>
//        <p className="text-gray-600">Expected by <span className="font-bold text-gray-800">Jan 21, 2023</span></p>
//      </section>

//      {/* Order Items */}
//      <section className="space-y-4">
//        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Items in Your Order</h3>
//        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//          {[1, 2, 3].map((item) => (
//            <div key={item} className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
//              <img
//                src="https://via.placeholder.com/100"
//                alt="Product"
//                className="w-20 h-20 object-cover rounded-lg"
//              />
//              <div>
//                <h4 className="text-lg font-semibold text-gray-800">Product Name</h4>
//                <p className="text-gray-600">Quantity: 1</p>
//                <p className="text-gray-600">Price: $49.99</p>
//              </div>
//            </div>
//          ))}
//        </div>
//      </section>

//      {/* Contact and Support Section */}
//      <section className="bg-blue-600 rounded-lg p-6 md:p-8 text-center text-white space-y-4">
//        <h3 className="text-2xl font-bold">Need Help?</h3>
//        <p className="text-lg">If you have any questions about your order, feel free to reach out to our support team.</p>
//        <a href="/contact" className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg inline-block hover:bg-gray-100 transition-colors">
//          <FaHeadset className="inline-block mr-2" /> Contact Support
//        </a>
//      </section>
//    </div>
//  );
//};

//export default OrderTracking;

import React from 'react';
import { FaCheckCircle, FaTruck, FaBoxOpen, FaHome, FaHeadset } from 'react-icons/fa';

const OrderTracking = () => {
  const orderStatus = [
    { status: 'Order Placed', date: 'Jan 15, 2023', icon: <FaCheckCircle />, completed: true },
    { status: 'Processing', date: 'Jan 16, 2023', icon: <FaBoxOpen />, completed: true },
    { status: 'Shipped', date: 'Jan 18, 2023', icon: <FaTruck />, completed: true },
    { status: 'Out for Delivery', date: 'Jan 20, 2023', icon: <FaHome />, completed: false },
    { status: 'Delivered', date: 'Expected Jan 21, 2023', icon: <FaHome />, completed: false },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">

      {/* Order Summary Card */}
      <section className="bg-gray-50 rounded-lg p-6 md:p-8 shadow-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Tracking</h2>
        <p className="text-gray-600 mb-1">Order ID: <span className="font-semibold">123456789</span></p>
        <p className="text-gray-600 mb-1">Placed on: <span className="font-semibold">Jan 15, 2023</span></p>
        <p className="text-blue-600 font-semibold text-lg">Status: Out for Delivery</p>
      </section>

      {/* Order Tracking Progress Bar */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Order Status</h3>
        <div className="flex items-center space-x-4 overflow-x-auto md:justify-center">
          {orderStatus?.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full ${step.completed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                {step.icon}
              </div>
              <p className="text-sm font-medium mt-2 text-gray-800">{step.status}</p>
              <p className="text-xs text-gray-600">{step.date}</p>
              {index < orderStatus.length - 1 && (
                <div className={`h-1 w-12 bg-${step.completed ? 'blue-500' : 'gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Estimated Delivery Section */}
      <section className="bg-blue-600 rounded-lg p-6 md:p-8 text-center text-white shadow-lg">
        <h3 className="text-2xl font-semibold mb-2">Estimated Delivery</h3>
        <p className="text-lg">Expected by <span className="font-bold">Jan 21, 2023</span></p>
      </section>

      {/* Order Items */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Items in Your Order</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/100"
                alt="Product"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800">Product Name</h4>
                <p className="text-gray-500">Quantity: 1</p>
                <p className="text-gray-800 font-semibold">$49.99</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact and Support Section */}
      <section className="bg-gray-100 rounded-lg p-6 md:p-8 text-center shadow-md space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Need Help?</h3>
        <p className="text-gray-600 text-lg">If you have any questions about your order, please reach out to our support team.</p>
        <a href="/contact" className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center space-x-2 hover:bg-blue-600 transition-colors">
          <FaHeadset /> <span>Contact Support</span>
        </a>
      </section>
    </div>
  );
};

export default OrderTracking;

