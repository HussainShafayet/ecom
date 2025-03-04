import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaCheckCircle, FaMoneyBillWave, FaCheck, FaTrash } from 'react-icons/fa';

import {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  handleCheckout,
  resetForm,
  initializeCheckout,
  setSelectedAddressId,
} from '../redux/slice/checkoutSlice';
import {clearCart, handleAddtoCart, handleFetchCart, handleRemovetoCart, removeFromCart, selectCartItems, selectTotalPrice, updateQuantity} from '../redux/slice/cartSlice';
import {divisionsData,districtsData, upazilasData, dhakaCityData} from '../data/location';
import {handleGetAddress} from '../redux/slice/profileSlice';
import {ShowAddress} from '../components/checkout';
import debounce from 'lodash.debounce'; // Import lodash debounce
import {CheckoutSkeleton} from '../components/common/skeleton';
import {Loader} from '../components/common';


 

//const locations = {
//  "Dhaka": { "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Uttara"], "Gazipur": ["Sreepur", "Kaliakoir", "Tongi"] },
//  "Chittagong": { "Chittagong": ["Pahartali", "Kotwali", "Halishahar"], "Cox's Bazar": ["Cox's Bazar Sadar", "Teknaf"] },
//  "Sylhet": { "Sylhet": ["Sylhet Sadar", "Beanibazar"], "Habiganj": ["Habiganj Sadar", "Madhabpur"] },
//};

const Checkout = () => {
  const dispatch = useDispatch();
  const {cartLoading, cartItems, cartError} = useSelector((state)=>state.cart);
  const navigate = useNavigate();
 
  const { isLoading, formData, errors, touched, districts, upazilas, isCheckoutFulfilled, order_id, delivery_charges, responseError, checkoutContentLoading, checkoutContentError} = useSelector(
    (state) => state.checkout
  );
  
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );
   const contentError = useSelector((state) => state.globalError.sectionErrors["checkout-content"]);
   const [confirmDelete, setConfirmDelete] = useState({});
   const [originalQuantities, setOriginalQuantities] = useState({}); // Store original quantities

 
  // Step 1: Initialize checkout on page load if not fulfilled
  useEffect(() => {
    !isCheckoutFulfilled && dispatch(initializeCheckout());
    
  }, [isCheckoutFulfilled, dispatch]);

  // Step 2: Handle checkout success (redirect + clear cart + reset form)
  useEffect(() => {
    if (isCheckoutFulfilled) {
      order_id && navigate(`/order-confirmation/${order_id}`);
      setTimeout(() => {
        dispatch(clearCart());
        dispatch(resetForm());
      }, 500);
      
    }
  }, [isCheckoutFulfilled, dispatch, navigate, order_id]);

  // Step 3: If cart is empty after loading, redirect to products page
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !isCheckoutFulfilled) {
      navigate('/products');
    }
  }, [cartItems, cartLoading, isCheckoutFulfilled, navigate]);

  // Debounced API call
  const debouncedUpdateQuantity = useCallback(
    
    debounce((product, difference) => {
      if (difference !== 0) {
      const cartBody = {};
      cartBody.product_id = product.id;
      cartBody.quantity = Math.abs(difference);
      cartBody.variant_id = product.variant_id;
      cartBody.action = difference < 0 ? 'decrease' : 'increase';
      dispatch(handleAddtoCart(cartBody));
      setOriginalQuantities((prev) => ({
        ...prev,
        [product.id]: null,
      }));
      }
    }, 1000),
    []
  );



  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));

    // Validate field on change and clear error if valid
    if (value.trim()) {
      dispatch(setErrors({ ...errors, [name]: '' }));
    }
    
    isAuthenticated && (name === 'title' || 'address') && dispatch(setSelectedAddressId(null));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    dispatch(updateTouched({ [name]: true }));

    // Validate field on blur to show error if empty
    if (!formData[name].trim()) {
      dispatch(setErrors({ ...errors, [name]: `${name} is required` }));
    }
  };

  const handleLocationType= (e) =>{
    const locationType = e.target.value;
    
    locationType && dispatch(updateFormData({ shipping_type:locationType, shipping_area: '', division: '', district: '', upazila: '', address: '' }));

     // Validate field on change and clear error if valid
     if (locationType.trim()) {
      dispatch(setErrors({ ...errors, ['shipping_type']: '' }));
    }

    isAuthenticated && dispatch(setSelectedAddressId(null));
  }
  
  const handleDhakaArea = (e) => {
    const shipping_area = e.target.value;
    dispatch(updateFormData({ shipping_area, division: '', district: '', upazila: '',}));

     // Validate field on change and clear error if valid
     if (shipping_area.trim()) {
      dispatch(setErrors({ ...errors, ['shipping_area']: '' }));
    }
    isAuthenticated && dispatch(setSelectedAddressId(null));
  }

  const handleDivisionChange = (e) => {
    const division = e.target.value;
    const divisionItem = divisionsData.find((item)=> item.name === division);
    if (divisionItem) {
      dispatch(updateFormData({ division:divisionItem.name, district: '', upazila: '' }));
      const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);
      
      dispatch(setDistricts(divisionDist|| []));
      dispatch(setUpazilas([]));
    }
    

    // Validate field on change and clear error if valid
    if (division.trim()) {
      dispatch(setErrors({ ...errors, ['division']: '' }));
    }

    isAuthenticated && dispatch(setSelectedAddressId(null));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    const districtItem = districts.find((item)=> item.name === district);
    if (districtItem) {
      dispatch(updateFormData({ district:districtItem.name, upazila: '' }));

      const upzillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);
      
      dispatch(setUpazilas(upzillaDist|| []));
    }
     // Validate field on change and clear error if valid
     if (district.trim()) {
      dispatch(setErrors({ ...errors, ['district']: '' }));
    }

    isAuthenticated && dispatch(setSelectedAddressId(null));
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
      const {name,phone_code,phone_number, email,title, shipping_type,shipping_area, division,district, upazila, address, payment_type } = formData;
      const checkoutBody ={
        name,email,shipping_type,shipping_area,
        phone_number: phone_code + phone_number,
        shipping: null,
        "shipping_division": division,
        "shipping_district": district,
        "shipping_thana": upazila,
        "shipping_address": address,
        payment_type,
        "items" : [],
        "sub_total_price": totalPrice.toFixed(2),
        "delivery_charge": shippingCost,
        "total_price": grandTotal.toFixed(2),
      }
      cartItems.map((cart)=>{
        checkoutBody.items.push({
            "product_id": cart.id,
            "variant_id": cart.variant_id,
            "quantity": cart.quantity,
            "price": cart.has_discount? cart.discount_price : cart.base_price,
        })
      });

      console.log(checkoutBody, 'body');
      dispatch(handleCheckout(checkoutBody));
      //alert('Order placed successfully!');
    } else {
      dispatch(setErrors(formErrors));
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.name) formErrors.name = 'Name is required';
    //if (!formData.email) formErrors.email = 'Email is required';
    if (!formData.phone_number) formErrors.phone_number = 'Phone Number is required';

    //if (!formData.title) formErrors.title = 'Shipping Title is required';
    if (!formData.shipping_type) formErrors.shipping_type = 'Shipping Type is required';
    if (formData.shipping_type == 'inside_dhaka') {
       if (!formData.shipping_area) formErrors.shipping_area = 'shipping_area is required';
    } else if(formData.shipping_type === 'outside_dhaka') {
      if (!formData.division) formErrors.division = 'Division is required';
      if (!formData.district) formErrors.district = 'District is required';
      if (!formData.upazila) formErrors.upazila = 'Upazila/thana is required';
    }
    if (shippingCost === 0) formErrors.delivery_charge = 'Delivery Charge is required';
    if (!formData.address) formErrors.address = 'Address is required';
    return formErrors;
  };

  const getLocationType = ()=>{
    if (formData.shipping_type === 'inside_dhaka') {
      return 'md:grid-cols-2'
    }else if(formData.shipping_type === 'outside_dhaka'){
      return 'md:grid-cols-4 sm:grid-cols-2'
    } else {
      return 'grid-cols-1'
    }
  }

  const totalPrice = useSelector(selectTotalPrice);
  
  const shippingCost = formData.shipping_type && delivery_charges[formData.shipping_type] ? delivery_charges[formData.shipping_type] : 0;
  
  const grandTotal = totalPrice + shippingCost;

 const handleUpdateQuantity = (id, newQuantity, item) => {
     let prevQuantity = 0;
     if (originalQuantities[id]) {
       prevQuantity = originalQuantities[id];
     } else {
        setOriginalQuantities((prev) => ({
         ...prev,
         [id]: item.quantity,
       }));
       prevQuantity = item.quantity;
     }
     const difference = newQuantity - prevQuantity; // Calculate actual difference
     
     // Update UI immediately
     dispatch(updateQuantity({ id, quantity: newQuantity, variant_id: item.variant_id }));
 
     // Only send API request if the quantity actually changed
     if (isAuthenticated && difference !== 0) {
         debouncedUpdateQuantity(item, difference); // API gets the actual difference
     }
 };

  const handleRemoveItem = (item) =>{
    dispatch(handleRemovetoCart({product_id: item.id}));
    dispatch(removeFromCart(item));
  }

  const OrderSummarySkeleton = () => {
    return (
      <div className="bg-gray-100 rounded-lg shadow-md p-4 sm:p-2">
        {/* Cart Items Skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-2 mb-2 border p-2 rounded-md bg-gray-200">
            <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
            <div className="flex-grow min-w-0">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
                <div className="h-8 w-12 bg-gray-300 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
        {/* Price Summary Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-full my-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full my-3"></div>
        <div className="h-6 bg-gray-400 rounded w-full my-3"></div>
      </div>
    )
  }


  if (contentError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {contentError} - Please try again later.
    </div>;
  }

  return (
    <>
    {checkoutContentLoading ? 
      <CheckoutSkeleton />
     :
      checkoutContentError ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {checkoutContentError} - Please try again later.
      </div>
    ) :
    <div className="mx-auto px-1 lg:flex  mb-3 gap-3">
     {/* Right Section: Order Summary */}
     <div className="lg:w-7/12">
        <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
        {cartLoading ? 
          <OrderSummarySkeleton />
          :
            cartError ? (
            <div className="text-center text-red-500 font-semibold py-4">
              {cartError} - Please try again later.
            </div>
          ) :
          <div className="bg-gray-100 rounded-lg shadow-md sticky top-20">
            <div className="max-h-svh overflow-auto scrollbar-custom p-4 sm:p-2">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 mb-2 relative border p-1"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-md flex-shrink-0"
                  />

                  
                  {/* Product Details */}
                  <div className="flex-grow min-w-0">
                    <h2
                      className="font-semibold text-sm truncate"
                      title={item.name} // Tooltip for full name
                    >
                      {item.name}
                    </h2>
                    <p className="text-gray-500 text-sm truncate mb-2">
                      {item.brand_name && <span>Brand: {item.brand_name} • </span>}
                      {item.color_name && <span>Color: {item.color_name} • </span>}
                      
                      {item.size_name && <span>Size: {item.size_name} • </span>}
                      {item.color_name && <span>Avg Rating: {item.avg_rating}</span>}
                    </p>
                  
                    <div className="flex items-center gap-2 mt-1">
                      {item.quantity === 1? 
                      <>
                        {/* Remove Button */}
                        <button
                          className="bg-red-400 text-white p-[0.5rem] rounded-full hover:bg-red-600 transition-colors"
                          onClick={() => setConfirmDelete({ id: item.id, variant_id: item.variant_id })}
                        >
                          <FaTrash />
                        </button>
                      </> :
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity -1, item)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>}
                      <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10) || 1; // Ensure it's a number
                            handleUpdateQuantity(item.id, newValue, item);
                          }}
                          className="w-10 text-center border-l border-r"
                          min="1"
                        />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    
                  </div>

                  {/* Price */}
                  <div className="text-sm font-semibold text-right flex-shrink-0">
                    {item.has_discount
                      ? (item.discount_price * item.quantity).toFixed(2)
                      : (item.base_price * item.quantity).toFixed(2)}
                  </div>



                  {/* Confirm Delete Warning in Card */}
                  {confirmDelete?.id === item.id && confirmDelete?.variant_id === item.variant_id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 p-3 rounded-lg">
                        <div className="text-center">
                          <p className="text-gray-800 mb-2">Are you sure you want to remove this item?</p>
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                              onClick={() => {
                                handleRemoveItem(item);
                                setConfirmDelete({});
                              }}
                            >
                              Yes
                            </button>
                            <button
                              className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                              onClick={() => setConfirmDelete({})}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-2">
              <hr className="my-3" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost.toFixed(2)}</span>
              </div>
              {errors.delivery_charge && <p className="text-red-500 text-xs mt-1">{errors.delivery_charge}</p>}
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <Link to="/cart" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
                  Edit Cart
                </Link>
                <Link to="/products" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
                  Add more products
                </Link>
              </div>
              
            </div>
          </div>
          }
      </div>

      {/*form section*/}
      <div className="lg:w-5/12">
        <h2 className="text-2xl font-bold mb-1">Checkout</h2>
        
        <form onSubmit={handleSubmit} className="space-y-2">

          
          {/* Personal Information */}
          <div className="p-2 bg-white rounded-lg">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaCheckCircle className="mr-2 text-green-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
               <div className={`flex items-center border ${touched.phone_number && errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70`}>
                {/*<FaPhone className="text-gray-400 m-3" title="Phone" />*/}
                <select
                  id="country-code"
                  className="bg-gray-100 text-gray-700 font-medium p-2 border-r border-gray-300 focus:outline-none rounded-l-md"
                  defaultValue="+880"
                >
                  <option value="+880">+880</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone_number"
                  placeholder="Phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className="w-full p-2 border-none focus:outline-none rounded-r-md"
                  required
                />
                
              </div>
              {touched.phone_number && errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>
             
            </div>
            <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address (optional)"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
          </div>
          

          {/* Shipping Information */}
          <div className="p-2 bg-white rounded-lg">

          <div>
            {isAuthenticated && <ShowAddress /> }
          </div>

            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaTruck className="mr-2 text-blue-500" /> Shipping Information
            </h3>

            <div className="w-full mb-3">
              <input
                type="text"
                name="title"
                placeholder="Home or office"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border border-gray-300 p-2 rounded-lg w-full`}
              />
            </div>

            <div className={`grid grid-cols-1 ${getLocationType()} gap-3 mb-3`}>
              <div>
                <select
                  name="shipping_type"
                  value={formData.shipping_type || ''}
                  onChange={handleLocationType}
                  onBlur={handleBlur}
                  required
                  className="border border-gray-300 p-2 rounded-lg w-full"
                >
                  <option value="">Select Shipping Area</option>
                  <option value="inside_dhaka">In Dhaka City</option>
                  <option value="outside_dhaka">Out of Dhaka City</option>
                </select>
                {touched.shipping_type && errors.shipping_type && <p className="text-red-500 text-xs mt-1">{errors.shipping_type}</p>}
              </div>

              {formData.shipping_type === 'inside_dhaka' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="w-full">
                  <select
                    name="shipping_area"
                    value={formData.shipping_area || ''}
                    onChange={handleDhakaArea}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.shipping_area && errors.shipping_area ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                  >
                    <option value="">Select Area in Dhaka City</option>
                    {dhakaCityData.map((area) => (
                      <option key={area.id} value={area.name}>{area.name}</option>
                    ))}
                  </select>
                  {touched.shipping_area && errors.shipping_area && <p className="text-red-500 text-xs mt-1">{errors.shipping_area}</p>}
                </div>
              </div>
            )}
             
           
            {formData.shipping_type === 'outside_dhaka' && (
              <>
                <div>
                  <select
                    name="division"
                    value={formData.division || ''}
                    onChange={handleDivisionChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.division && errors.division ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                  >
                    <option value="">Select Division</option>
                    {divisionsData.map((division) => (
                      <option key={division.id} value={division.name}>{division.name}</option>
                    ))}
                  </select>
                  {touched.division && errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                </div>

                <div>
                  <select
                    name="district"
                    value={formData.district || ''}
                    onChange={handleDistrictChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.district && errors.district ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    disabled={!formData.division}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                  {touched.district && errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>

                <div>
                  <select
                    name="upazila"
                    value={formData.upazila || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.upazila && errors.upazila ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    disabled={!formData.district}
                  >
                    <option value="">Select Upazila/Thana</option>
                    {upazilas.map((station) => (
                      <option key={station.id} value={station.name}>{station.name}</option>
                    ))}
                  </select>
                  {touched.upazila && errors.upazila && <p className="text-red-500 text-xs mt-1">{errors.upazila}</p>}
                </div>
              </>
            )}
            
            </div>
            <div className="w-full">
              <input
                type="text"
                name="address"
                placeholder="Delivery Address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
              />
              {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>


          {/* Payment Method */}
          <div className="p-2 bg-white rounded-lg">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaCreditCard className="mr-2 text-yellow-500" />Payment Method
            </h3>

            <div className="flex items-center space-x-2 mb-3">
              <div
                className={`flex items-center p-2 rounded-lg transition-all ${formData.payment_type === 'cod' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-300'}`}
              >
                <FaMoneyBillWave className="text-green-500 mr-2" />
                <span>Cash on Delivery</span>
                {formData.payment_type === 'cod' && <FaCheck className="ml-auto text-blue-500" />}
              </div>
            </div>
          </div>

          <button type="submit" className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors w-full transform duration-200 cursor-pointer ${
              isLoading ? 'cursor-wait' : 'hover:scale-105'
            }`}
            disabled={isLoading}
          
          >
           {isLoading ? (
              <Loader message="Place Order Progreccing" />
            ) : (
              "Place Order"
            )}
          </button>
        </form>
      </div>
    </div>
    }
    </>
  );
};

export default Checkout;
