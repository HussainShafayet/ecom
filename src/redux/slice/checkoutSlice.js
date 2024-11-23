// src/redux/slice/checkoutSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    paymentMethod: 'cod',
  },
  errors: {},
  touched: {},
  districts: [],
  upazilas: [],
};

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
