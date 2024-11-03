// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaCheckCircle, FaPaypal, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

const Checkout = () => {
  const { cartItems } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile:'',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'cod', // Cash on Delivery default option
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const formErrors = validateForm();
    setErrors(formErrors);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      alert('Order placed successfully!');
    } else {
      setErrors(formErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.mobile) errors.mobile = 'Mobile Number is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.zip) errors.zip = 'ZIP code is required';
    if (!formData.country) errors.country = 'Country is required';
    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) errors.cvv = 'CVV is required';
    }
    return errors;
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = 10.0;
  const taxPercentage = 0.1;
  const tax = totalPrice * taxPercentage;
  const grandTotal = totalPrice + shippingCost + tax;

  return (
    <div className="container mx-auto my-12 px-4 lg:flex lg:space-x-12">
      {/* Left Section: User Information Form */}
      <div className="lg:w-2/3">
        <h2 className="text-3xl font-bold mb-6">Checkout</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <FaCheckCircle className="mr-2 text-green-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.name && errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="w-full">
                <input
                  type="number"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.mobile && errors.mobile ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.mobile && errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
              </div>
              <div className="w-full">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.email && errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <FaTruck className="mr-2 text-blue-500" /> Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <input
                  type="text"
                  name="address"
                  placeholder="Shipping Address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.address && errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              <div className="w-full">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.city && errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>

              <div className="w-full">
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  value={formData.zip}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.zip && errors.zip ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.zip && errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
              </div>

              <div className="w-full">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.country && errors.country ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                />
                {touched.country && errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <FaCreditCard className="mr-2 text-yellow-500" /> Choose Payment Method
            </h3>

            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
              >
                <FaMoneyBillWave className="text-green-500 mr-2" />
                <span>Cash on Delivery</span>
                {formData.paymentMethod === 'cod' && <FaCheck className="ml-auto text-blue-500" />}
              </div>

              <div
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'credit-card' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'credit-card' })}
              >
                <FaCreditCard className="text-blue-500 mr-2" />
                <span>Credit Card</span>
                {formData.paymentMethod === 'credit-card' && <FaCheck className="ml-auto text-blue-500" />}
              </div>

              <div
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'paypal' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
              >
                <FaPaypal className="text-blue-500 mr-2" />
                <span>PayPal</span>
                {formData.paymentMethod === 'paypal' && <FaCheck className="ml-auto text-blue-500" />}
              </div>
            </div>

            {/* Credit Card Payment Info */}
            {formData.paymentMethod === 'credit-card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border ${touched.cardNumber && errors.cardNumber ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                  />
                  {touched.cardNumber && errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
                </div>

                <div className="w-full">
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="Expiry Date (MM/YY)"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border ${touched.expiryDate && errors.expiryDate ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                  />
                  {touched.expiryDate && errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
                </div>

                <div className="w-full">
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border ${touched.cvv && errors.cvv ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full`}
                  />
                  {touched.cvv && errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors w-full"
          >
            Place Order
          </button>
        </form>
      </div>

      {/* Right Section: Order Summary */}
      <div className="lg:w-1/3 mt-12 lg:mt-0">
        <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md sticky top-20">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <hr className="my-4" />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <Link
            to="/cart"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            Edit Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
