import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaCheckCircle, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

import {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setPoliceStations,
} from '../redux/slice/checkoutSlice';
import {selectCartItems, selectTotalPrice} from '../redux/slice/cartSlice';



const locations = {
  "Dhaka": { "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Uttara"], "Gazipur": ["Sreepur", "Kaliakoir", "Tongi"] },
  "Chittagong": { "Chittagong": ["Pahartali", "Kotwali", "Halishahar"], "Cox's Bazar": ["Cox's Bazar Sadar", "Teknaf"] },
  "Sylhet": { "Sylhet": ["Sylhet Sadar", "Beanibazar"], "Habiganj": ["Habiganj Sadar", "Madhabpur"] },
};

const Checkout = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  const { formData, errors, touched, districts, policeStations } = useSelector(
    (state) => state.checkout
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));

    // Validate field on change and clear error if valid
    if (value.trim()) {
      dispatch(setErrors({ ...errors, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    dispatch(updateTouched({ [name]: true }));

    // Validate field on blur to show error if empty
    if (!formData[name].trim()) {
      dispatch(setErrors({ ...errors, [name]: `${name} is required` }));
    }
  };

  const handleDivisionChange = (e) => {
    const division = e.target.value;
    dispatch(updateFormData({ division, district: '', policeStation: '' }));
    dispatch(setDistricts(Object.keys(locations[division] || {})));
    dispatch(setPoliceStations([]));

    // Validate field on change and clear error if valid
    if (division.trim()) {
      dispatch(setErrors({ ...errors, ['division']: '' }));
    }
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    dispatch(updateFormData({ district, policeStation: '' }));
    dispatch(setPoliceStations(locations[formData.division][district] || []));

     // Validate field on change and clear error if valid
     if (district.trim()) {
      dispatch(setErrors({ ...errors, ['district']: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched to show errors for untouched fields
    const allTouchedFields = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    dispatch(updateTouched(allTouchedFields));

    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      alert('Order placed successfully!');
    } else {
      dispatch(setErrors(formErrors));
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.name) formErrors.name = 'Name is required';
    if (!formData.email) formErrors.email = 'Email is required';
    if (!formData.mobile) formErrors.mobile = 'Mobile Number is required';
    if (!formData.address) formErrors.address = 'Address is required';
    if (!formData.division) formErrors.division = 'Division is required';
    if (!formData.district) formErrors.district = 'District is required';
    if (!formData.policeStation) formErrors.policeStation = 'Police Station is required';
    return formErrors;
  };

  const totalPrice = useSelector(selectTotalPrice);
  const shippingCost = 60.0;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="container mx-auto px-1 lg:flex lg:space-x-3">
      <div className="lg:w-2/3">
        <h2 className="text-2xl font-bold mb-1">Checkout</h2>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Personal Information */}
          <div className="p-2 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaCheckCircle className="mr-2 text-green-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="number"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.mobile && errors.mobile ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {touched.mobile && errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="p-2 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaTruck className="mr-2 text-blue-500" /> Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="w-full">
                <input
                  type="text"
                  name="address"
                  placeholder="Shipping Address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                />
                {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleDivisionChange}
                  onBlur={handleBlur}
                  className={`border ${touched.division && errors.division ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                >
                  <option value="">Select Division</option>
                  {Object.keys(locations).map((division) => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
                {touched.division && errors.division && <p className="text-red-500 text-xs">{errors.division}</p>}
              </div>

              <div>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  onBlur={handleBlur}
                  className={`border ${touched.district && errors.district ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                  disabled={!formData.division}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {touched.district && errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}
              </div>

              <div>
                <select
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border ${touched.policeStation && errors.policeStation ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                  disabled={!formData.district}
                >
                  <option value="">Select Police Station</option>
                  {policeStations.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
                {touched.policeStation && errors.policeStation && <p className="text-red-500 text-xs">{errors.policeStation}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-2 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaCreditCard className="mr-2 text-yellow-500" />Payment Method
            </h3>

            <div className="flex items-center space-x-2 mb-3">
              <div
                className={`flex items-center p-2 rounded-lg transition-all ${formData.paymentMethod === 'cod' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-300'}`}
              >
                <FaMoneyBillWave className="text-green-500 mr-2" />
                <span>Cash on Delivery</span>
                {formData.paymentMethod === 'cod' && <FaCheck className="ml-auto text-blue-500" />}
              </div>
            </div>
          </div>

          <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors w-full">
            Place Order
          </button>
        </form>
      </div>

      {/* Right Section: Order Summary */}
      <div className="lg:w-1/3 mt-12 lg:mt-0">
        <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md sticky top-20">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <hr className="my-3" />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <Link to="/cart" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
            Edit Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
