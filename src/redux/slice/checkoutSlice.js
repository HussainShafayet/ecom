// src/redux/slice/checkoutSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

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
};

// profile update
export const handleOrder = createAsyncThunk('checkout/handleOrder', async (formData, {getState, rejectWithValue }) => {
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
    },
  },
  extraReducers: (builder) =>{
      builder
      //get profile
      .addCase(handleOrder.pending, (state)=>{
          state.isLoading = true;
      })
      .addCase(handleOrder.fulfilled, (state, action)=>{
          state.isLoading = false;
          //state.profile = action.payload;
          //console.log(action.payload);
          
      })
      .addCase(handleOrder.rejected, (state, action)=>{
          state.isLoading = false;
          state.responseError = action.payload.errors;
          
      })

     
      
  }
});

export const {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  resetForm,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
