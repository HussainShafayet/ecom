// src/redux/slice/checkoutSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {clearCart, handleFetchCart} from './cartSlice';
import publicApi from '../../api/publicApi';

const initialState = {
  isLoading: false,
  formData: {
    name: '',
    email: '',
    phone_code: '+880',
    phone_number: '',
    title: '',
    address: '',
    shipping_type: '',
    shipping_area: '',
    country: 'Bangladesh',
    division: '',
    district: '',
    upazila: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    payment_type: 'cash',
  },
  errors: {},
  touched: {},
  districts: [],
  upazilas: [],
  responseError: null,
  isCheckoutFulfilled: false,
  order_id: null,
  order: null, // what POST /orders/ answered: { order_id, status, created_at, subtotal, delivery_charge, total }
  selectedAddressId: null,
  delivery_charges: {},
  addresses: [],
  user_info: null,
  checkoutContentLoading: false,
  checkoutContentError: null,
};

// checkout process
export const handleCheckout = createAsyncThunk('checkout/handleCheckout', async (formData, {getState, rejectWithValue, dispatch }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const isAuthenticated = getState().auth.isAuthenticated;
     let response = null;
     if (isAuthenticated) {
      response = await api.post('/orders/', formData, { section: "checkout"});
     }else{
      response = await publicApi.post(`/orders/`, formData, { section: "checkout"});
     }
     response.data.success && dispatch(clearCart());
    console.log('order post response',response);
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data);
  }
});

// checkout content get 
export const handleGetCheckoutContent = createAsyncThunk('profile/handleGetCheckoutContent', async (_, { rejectWithValue,getState }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
    const {isAuthenticated} = getState().auth;
    let response = {}
    if (isAuthenticated) {
      const api = (await import('../../api/axiosSetup')).default;
      response = await api.get('/content/checkout/', { section: "checkout-content"});
    } else {
      response = await publicApi.get(`/content/checkout/`, { section: "checkout-content"});
    }
     
    console.log('get checkout content response',response);
    return response?.data?.data;
  } catch (error) {
    console.log(error);
    
    return rejectWithValue(error?.response?.data);
  }
});

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    updateTouched: (state, action) => {
      state.touched = { ...state.touched, ...action.payload };
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
    },
    setDistricts: (state, action) => {
      state.districts = action.payload;
    },
    setUpazilas: (state, action) => {
      state.upazilas = action.payload;
    },
    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    clearResponseError: (state) => {
      state.responseError = null;
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.errors = {};
      state.touched = {};
      state.districts = [];
      state.upazilas = [];
      state.responseError = null;
      state.isCheckoutFulfilled = false;
      state.order_id = null;
      state.order = null;
      state.selectedAddressId = null;
      state.delivery_charges = {};
      state.addresses = [];
      state.user_info = null;
    },
  },
  extraReducers: (builder) =>{
      builder
      //checkout process
      .addCase(handleCheckout.pending, (state)=>{
          state.isLoading = true;
          state.responseError = null; // a new attempt: the last refusal no longer applies
      })
      .addCase(handleCheckout.fulfilled, (state, action)=>{
          state.isLoading = false;
          state.responseError = null;
          state.isCheckoutFulfilled = true;
          state.order_id = action?.payload?.order_id;
          state.order = action?.payload || null;
      })
      .addCase(handleCheckout.rejected, (state, action)=>{
          state.isLoading = false;
          // the backend's sentences ({errors: [...]}); anything else (no answer, a 5xx) gets one general sentence
          const errors = action?.payload?.errors;
          state.responseError = Array.isArray(errors) && errors.length > 0
            ? errors
            : [action?.payload?.error || 'Something went wrong. Please try again.'];
          
      })

      //get checkout content
      .addCase(handleGetCheckoutContent.pending, (state)=>{
        state.checkoutContentLoading = true;
      })
      .addCase(handleGetCheckoutContent.fulfilled, (state, action)=>{
          state.checkoutContentLoading = false;
          state.checkoutContentError = null;
          const { delivery_charges, shipping_addresses, user_info} = action.payload;
          
          state.delivery_charges = delivery_charges;
          state.addresses = shipping_addresses;
          
          state.user_info = user_info;
          state.formData.name = user_info?.name || '';
          state.formData.phone_number = user_info?.phone_number.replace(/^\+\d{1,3}/, "") || '';
          state.formData.email = user_info?.email || '';
          
      })
      .addCase(handleGetCheckoutContent.rejected, (state, action)=>{
          state.checkoutContentLoading = false;
          state.checkoutContentError = action.payload?.errors || 'Something went wrong';
          
      })

     
      
  }
});

export const initializeCheckout = () => async (dispatch, getState) => {
  const {isAuthenticated} = getState().auth;
  //const profile = getState().profile.profile;
  
  //if (!profile && isAuthenticated) {
  //  const fetchedProfile = await dispatch(handleGetProfile()).unwrap();
  //  const {name, phone_number, email, addresses} = fetchedProfile;
  //  dispatch(updateFormData({ name, phone_number, email}));
  //  dispatch(setAddress(addresses));
  //} else if(profile) {
  //  const {name, phone_number, email,addresses} = profile;
  //  dispatch(updateFormData({ name, phone_number, email}));
  //  dispatch(setAddress(addresses));
  //}
  dispatch(handleGetCheckoutContent());
  isAuthenticated && await dispatch(handleFetchCart()).unwrap();
}

export const {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  clearResponseError,
  resetForm,
  setSelectedAddressId
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
