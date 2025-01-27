import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaCheckCircle, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

import {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  handleCheckout,
  resetForm,
  initializeCheckout,
} from '../redux/slice/checkoutSlice';
import {handleFetchCart, selectCartItems, selectTotalPrice} from '../redux/slice/cartSlice';
import {divisionsData,districtsData, upazilasData, dhakaCityData} from '../data/location';
import {handleGetAddress} from '../redux/slice/profileSlice';
import {ShowAddress} from '../components/checkout';


 

//const locations = {
//  "Dhaka": { "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Uttara"], "Gazipur": ["Sreepur", "Kaliakoir", "Tongi"] },
//  "Chittagong": { "Chittagong": ["Pahartali", "Kotwali", "Halishahar"], "Cox's Bazar": ["Cox's Bazar Sadar", "Teknaf"] },
//  "Sylhet": { "Sylhet": ["Sylhet Sadar", "Beanibazar"], "Habiganj": ["Habiganj Sadar", "Madhabpur"] },
//};

const Checkout = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const {isLoading} = useSelector((state)=>state.cart);
  const navigate = useNavigate();

  const { formData, errors, touched, districts, upazilas, isCheckoutFulfilled, order_id } = useSelector(
    (state) => state.checkout
  );
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const { adrressLoading, addresses } = useSelector(
    (state) => state.profile
  );
  useEffect(() => {
    if (cartItems.length === 0 && !isLoading) {
      dispatch(initializeCheckout());
    }
    isAuthenticated && cartItems.length > 0 && dispatch(handleGetAddress());
    
    isCheckoutFulfilled && dispatch(resetForm());
    isCheckoutFulfilled && navigate(`/order-confirmation/${order_id}`);
  }, [isCheckoutFulfilled,dispatch]);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      navigate('/cart'); // Redirect to cart page if no items
    }
  }, [cartItems, isLoading, navigate]);

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

  const handleAddressSelection = (id) => {
    //console.log('Selected Address ID:', id);
    const addressItem = addresses.find((item) => item.id === id);

    const {shipping_type, area, division , district, thana, address }  = addressItem;
    
    dispatch(updateFormData({ shippingLocationType:shipping_type, dhakaArea: area, division, district, upazila: thana, address: address }))
  };

  const handleLocationType= (e) =>{
    const locationType = e.target.value;
    
    locationType && dispatch(updateFormData({ shippingLocationType:locationType, dhakaArea: '', division: '', district: '', upazila: '', address: '' }));

     // Validate field on change and clear error if valid
     if (locationType.trim()) {
      dispatch(setErrors({ ...errors, ['shippingLocationType']: '' }));
    }
  }
  
  const handleDhakaArea = (e) => {
    const dhakaArea = e.target.value;
    dispatch(updateFormData({ dhakaArea:dhakaArea, division: '', district: '', upazila: '',}));

     // Validate field on change and clear error if valid
     if (dhakaArea.trim()) {
      dispatch(setErrors({ ...errors, ['dhakaArea']: '' }));
    }
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
      const checkoutBody ={
        "name" : formData.name,
        "phone_number" : formData.mobile,
        "email" :  formData.email,
        "shipping" : null,
        "shipping_type" : formData.shippingLocationType,
        "shipping_area": formData.dhakaArea,
        "shipping_division": formData.division,
        "shipping_district": formData.district,
        "shipping_thana": formData.upazila,
        "shipping_address": formData.address,
        "payment_type": formData.paymentMethod,
        "items" : [],
        "sub_total_price": totalPrice,
        "delivery_charge": shippingCost,
        "total_price": grandTotal,
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
      dispatch(handleCheckout(checkoutBody))
      //alert('Order placed successfully!');
    } else {
      dispatch(setErrors(formErrors));
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!isAuthenticated) {
      if (!formData.name) formErrors.name = 'Name is required';
      if (!formData.email) formErrors.email = 'Email is required';
      if (!formData.mobile) formErrors.mobile = 'Mobile Number is required';
    }
   
    if (!formData.shippingLocationType) formErrors.shippingLocationType = 'shippingLocationType is required';
    if (formData.shippingLocationType == 'inside_dhaka') {
       if (!formData.dhakaArea) formErrors.dhakaArea = 'dhakaArea is required';
    } else if(formData.shippingLocationType === 'outside_dhaka') {
      if (!formData.division) formErrors.division = 'Division is required';
      if (!formData.district) formErrors.district = 'District is required';
      if (!formData.upazila) formErrors.upazila = 'Upazila/thana is required';
    }
    if (!formData.address) formErrors.address = 'Address is required';
    return formErrors;
  };

  const getLocationType = ()=>{
    if (formData.shippingLocationType === 'inside_dhaka') {
      return 'md:grid-cols-2'
    }else if(formData.shippingLocationType === 'outside_dhaka'){
      return 'md:grid-cols-4 sm:grid-cols-2'
    } else {
      return 'grid-cols-1'
    }
  }

  const totalPrice = useSelector(selectTotalPrice);
  const shippingCost = formData.shippingLocationType ? ((formData.shippingLocationType === 'inside_dhaka') ?  0 : 110) : 0;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="container mx-auto px-1 lg:flex lg:space-x-3">
      <div className="lg:w-2/3">
        <h2 className="text-2xl font-bold mb-1">Checkout</h2>
        
        <form onSubmit={handleSubmit} className="space-y-2">

          {!isAuthenticated && 
          <>
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
                    type="tel"
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
          </>
          }
          

          {/* Shipping Information */}
          <div className="p-2 bg-white shadow rounded-lg">

          <div>
            {!adrressLoading && 
           
            <ShowAddress addresses={addresses} onSelectAddress={handleAddressSelection} />}
          </div>

            <h3 className="text-lg font-semibold flex items-center mb-1">
              <FaTruck className="mr-2 text-blue-500" /> Shipping Information
            </h3>

            <div className={`grid grid-cols-1 ${getLocationType()} gap-3 mb-3`}>
              <div>
                <select
                  name="shippingLocationType"
                  value={formData.shippingLocationType || ''}
                  onChange={handleLocationType}
                  onBlur={handleBlur}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                >
                  <option value="">Select Shipping Area</option>
                  <option value="inside_dhaka">In Dhaka City</option>
                  <option value="outside_dhaka">Out of Dhaka City</option>
                </select>
                {touched.shippingLocationType && errors.shippingLocationType && <p className="text-red-500 text-xs mt-1">{errors.shippingLocationType}</p>}
              </div>

              {formData.shippingLocationType === 'inside_dhaka' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="w-full">
                  <select
                    name="dhakaArea"
                    value={formData.dhakaArea || ''}
                    onChange={handleDhakaArea}
                    onBlur={handleBlur}
                    className={`border ${touched.dhakaArea && errors.dhakaArea ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                  >
                    <option value="">Select Area in Dhaka City</option>
                    {dhakaCityData.map((area) => (
                      <option key={area.id} value={area.name}>{area.name}</option>
                    ))}
                  </select>
                  {touched.dhakaArea && errors.dhakaArea && <p className="text-red-500 text-xs mt-1">{errors.dhakaArea}</p>}
                </div>
              </div>
            )}
             
           
            {formData.shippingLocationType === 'outside_dhaka' && (
              <>
                <div>
                  <select
                    name="division"
                    value={formData.division || ''}
                    onChange={handleDivisionChange}
                    onBlur={handleBlur}
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
                className={`border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
              />
              {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
        <div className="bg-gray-100 rounded-lg shadow-md sticky top-20">
          <div className='max-h-svh overflow-auto scrollbar-custom p-4'>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>
              {item.has_discount ? (
                <>
                  {item.discount_price * item.quantity}
                </>
            ) : (
                <>
                  {item.base_price * item.quantity}
                </>
                
            )}

            </div>
          ))}
          </div>
          <div className='p-4'>
            <hr className="my-3" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost.toFixed(2)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
            <Link to="/cart" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
              Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
