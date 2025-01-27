// src/redux/slice/checkoutSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {clearCart, handleFetchCart} from './cartSlice';

const initialState = {
  isLoading: false,
  formData: {
    name: '',
    email: '',
    mobile: '',
    address: '',
    shippingLocationType: '',
    dhakaArea: '',
    country: 'Bangladesh',
    division: '',
    district: '',
    upazila: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'cash',
  },
  errors: {},
  touched: {},
  districts: [],
  upazilas: [],
  responseError: null,
  isCheckoutFulfilled: false,
  order_id: null,
};

// profile update
export const handleCheckout = createAsyncThunk('checkout/handleCheckout', async (formData, {getState, rejectWithValue, dispatch }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const isAuthenticated = getState().auth.isAuthenticated;
     let response = null;
     if (isAuthenticated) {
      response = await api.post('api/orders/', formData);
     }else{
      response = await axios.post('http://192.168.0.103:8000/api/orders/', formData);
     }
     response.data.success && dispatch(clearCart());
    console.log('order post response',response);
    return response.data.data;
  } catch (error) {
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
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.errors = {};
      state.touched = {};
      state.districts = [];
      state.upazilas = [];
      state.responseError = null;
      state.isCheckoutFulfilled = false;
      state.order_id = null;
    },
  },
  extraReducers: (builder) =>{
      builder
      //get profile
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

     
      
  }
});

export const initializeCheckout = () => async (dispatch, getState) => {
  const {isAuthenticated} = getState().auth;
  isAuthenticated && await dispatch(handleFetchCart()).unwrap();
}

export const {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  resetForm,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
