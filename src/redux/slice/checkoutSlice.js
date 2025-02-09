// src/redux/slice/checkoutSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {clearCart, handleFetchCart} from './cartSlice';
import {handleGetProfile, setAddress} from './profileSlice';

const initialState = {
  isLoading: false,
  formData: {
    name: '',
    email: '',
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
  selectedAddressId: null,
  delivery_charges: {},
  addresses: [],
  user_info: null,
};

// checkout process
export const handleCheckout = createAsyncThunk('checkout/handleCheckout', async (formData, {getState, rejectWithValue, dispatch }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const isAuthenticated = getState().auth.isAuthenticated;
     let response = null;
     if (isAuthenticated) {
      response = await api.post('api/orders/', formData);
     }else{
      const baseUrl = process.env.REACT_APP_BASE_URL;
      response = await axios.post(`${baseUrl}/api/orders/`, formData);
     }
     response.data.success && dispatch(clearCart());
    console.log('order post response',response);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
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
      response = await api.get('api/content/checkout/');
    } else {
      const baseUrl = process.env.REACT_APP_BASE_URL;
      response = await axios.get(`${baseUrl}/api/content/checkout/`);
    }
     
    console.log('get checkout content response',response);
    return response.data.data;
  } catch (error) {
    console.log(error);
    
    return rejectWithValue(error.response.data);
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
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.errors = {};
      state.touched = {};
      state.districts = [];
      state.upazilas = [];
      state.responseError = null;
      state.isCheckoutFulfilled = false;
      state.order_id = null;
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
      })
      .addCase(handleCheckout.fulfilled, (state, action)=>{
          state.isLoading = false;
          state.isCheckoutFulfilled = true;
          state.order_id = action.payload.order_id;
      })
      .addCase(handleCheckout.rejected, (state, action)=>{
          state.isLoading = false;
          state.responseError = action.payload.errors;
          
      })

      //get checkout content
      .addCase(handleGetCheckoutContent.pending, (state)=>{
        state.isLoading = true;
      })
      .addCase(handleGetCheckoutContent.fulfilled, (state, action)=>{
          state.isLoading = false;
          
          const { delivery_charges, shipping_addresses, user_info} = action.payload;
          
          state.delivery_charges = delivery_charges;
          state.addresses = shipping_addresses;
          
          state.user_info = user_info;
          state.formData.name = user_info?.name || '';
          state.formData.phone_number = user_info?.phone_number || '';
          state.formData.email = user_info?.email || '';
          
      })
      .addCase(handleGetCheckoutContent.rejected, (state, action)=>{
          state.isLoading = false;
          state.responseError = action.payload.errors;
          
      })

     
      
  }
});

export const initializeCheckout = () => async (dispatch, getState) => {
  const {isAuthenticated} = getState().auth;
  const {addresses} = getState().profile;
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
  resetForm,
  setSelectedAddressId
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
