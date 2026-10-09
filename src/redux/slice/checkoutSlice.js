// src/redux/slice/checkoutSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {clearCart, handleFetchCart} from './cartSlice';
import publicApi from '../../api/publicApi';
import {validateCoupon, getAvailableOffers} from '../../services/couponService';
import {divisionsData, districtsData, upazilasData} from '../../data/location';
import {loadCheckoutDraft} from '../../utils/checkoutDraft';
import {forgetOrderKey, orderKeyFor} from '../../utils/orderKey';

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
  delivery_estimates: {}, // { inside_dhaka: {min_days, max_days} }: only for a shipping type the shop made an estimate for
  addresses: [],
  user_info: null,
  checkoutContentLoading: false,
  checkoutContentError: null,
  couponStatus: 'idle', // idle | validating | applied | failed
  couponError: null,
  discountAmount: 0,
  appliedCouponCode: '',
  offers: [], // the coupons the shop suggests for this cart (GET /coupons/available/)
  offersRequestId: null, // the newest request: an older answer (a cart that changed meanwhile) is dropped
};

// checkout process
export const handleCheckout = createAsyncThunk('checkout/handleCheckout', async (formData, {getState, rejectWithValue, dispatch }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const isAuthenticated = getState().auth.isAuthenticated;
     let response = null;
     // The same order sent again (a retry after a lost answer) carries the same key, so the shop answers with the order it already placed
     const config = { section: "checkout", headers: { 'Idempotency-Key': orderKeyFor(formData) } };
     if (isAuthenticated) {
      response = await api.post('/orders/', formData, config);
     }else{
      response = await publicApi.post(`/orders/`, formData, config);
     }
     if (response.data.success) {
      forgetOrderKey(); // the order is placed: the next one is another order
      dispatch(clearCart());
     }
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data);
  }
}, {
  // One order at a time: a second tap (or a retry) while the first is on its way would place the order twice. Nothing is sent, no state moves.
  condition: (_, { getState }) => !getState().checkout?.isLoading,
});

// checkout content get 
export const handleGetCheckoutContent = createAsyncThunk('profile/handleGetCheckoutContent', async (_, { rejectWithValue,getState }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
    const {isAuthenticated} = getState().auth;
    let response = {}
    if (isAuthenticated) {
      const api = (await import('../../api/axiosSetup')).default;
      response = await api.get('/content/checkout/', { section: "checkout-content", optionalAuth: true});
    } else {
      response = await publicApi.get(`/content/checkout/`, { section: "checkout-content"});
    }
     
    return response?.data?.data;
  } catch (error) {
    
    return rejectWithValue(error?.response?.data);
  }
});

// preview a coupon's discount before the order is placed
export const handleApplyCoupon = createAsyncThunk('checkout/handleApplyCoupon', async ({ code, subtotal, phone_number }, { rejectWithValue }) => {
  try {
    const response = await validateCoupon({ code, subtotal, phone_number });
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data);
  }
});

// the coupons worth suggesting for a cart of `subtotal`; a hint, so a failure just leaves the list empty
export const handleGetOffers = createAsyncThunk('checkout/handleGetOffers', async (subtotal, { rejectWithValue }) => {
  try {
    const response = await getAvailableOffers({ subtotal });
    const offers = response?.data?.data?.offers;
    return Array.isArray(offers) ? offers : [];
  } catch (error) {
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
    clearCoupon: (state) => {
      state.couponStatus = 'idle';
      state.couponError = null;
      state.discountAmount = 0;
      state.appliedCouponCode = '';
    },
    clearResponseError: (state) => {
      state.responseError = null;
    },
    // A guest's saved form (`utils/checkoutDraft`) goes back into the fields that are still empty, with the district and upazila lists the saved
    // division and district need. Runs after the checkout content arrived: that answer fills the name, phone and e-mail itself (from the
    // profile, empty for a guest) and would wipe what was put back before it.
    restoreDraft: (state, action) => {
      const draft = action.payload || {};
      Object.keys(draft).forEach((field) => {
        if (!state.formData[field]) state.formData[field] = draft[field];
      });
      const division = divisionsData.find((item) => item.name === state.formData.division);
      if (division) state.districts = districtsData.filter((item) => item.division_id === division.id);
      const district = districtsData.find((item) => item.name === state.formData.district && (!division || item.division_id === division.id));
      if (district) state.upazilas = upazilasData.filter((item) => item.district_id === district.id);
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
      state.delivery_estimates = {};
      state.addresses = [];
      state.user_info = null;
      state.couponStatus = 'idle';
      state.couponError = null;
      state.discountAmount = 0;
      state.appliedCouponCode = '';
      state.offers = [];
      state.offersRequestId = null;
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
          const { delivery_charges, delivery_estimates, shipping_addresses, user_info} = action.payload;
          
          state.delivery_charges = delivery_charges;
          state.delivery_estimates = delivery_estimates || {};
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

      // apply a coupon
      .addCase(handleApplyCoupon.pending, (state) => {
          state.couponStatus = 'validating';
          state.couponError = null;
      })
      .addCase(handleApplyCoupon.fulfilled, (state, action) => {
          state.couponStatus = 'applied';
          state.couponError = null;
          state.discountAmount = action.payload?.discount_amount || 0;
          state.appliedCouponCode = action.meta.arg.code.trim().toUpperCase(); // matches the backend's stored form
      })
      .addCase(handleApplyCoupon.rejected, (state, action) => {
          state.couponStatus = 'failed';
          state.discountAmount = 0;
          state.appliedCouponCode = '';
          const errors = action?.payload?.errors;
          state.couponError = Array.isArray(errors) && errors.length > 0
            ? errors[0]
            : (action?.payload?.error || 'This coupon could not be applied.');
      })

      // the suggested coupons
      .addCase(handleGetOffers.pending, (state, action) => {
          state.offersRequestId = action.meta.requestId;
      })
      .addCase(handleGetOffers.fulfilled, (state, action) => {
          if (state.offersRequestId === action.meta.requestId) state.offers = action.payload;
      })
      .addCase(handleGetOffers.rejected, (state, action) => {
          if (state.offersRequestId === action.meta.requestId) state.offers = []; // never a list that was made for another cart
      })

  }
});

export const initializeCheckout = () => async (dispatch, getState) => {
  const {isAuthenticated} = getState().auth;
  // A guest's saved form is read FIRST (the page's own save, which runs after this, would otherwise replace it with the empty form of a new page)
  const draft = isAuthenticated ? null : loadCheckoutDraft();
  // Profile name/phone/email and saved addresses both come from handleGetCheckoutContent below
  // (GET /content/checkout/ returns user_info + shipping_addresses together); see ShowAddress.js
  // for how a selected saved address fills the rest of the form.
  const content = dispatch(handleGetCheckoutContent());
  isAuthenticated && await dispatch(handleFetchCart()).unwrap();
  if (draft) {
    await content; // it fills the name, phone and e-mail itself: the draft goes back after it, not before
    dispatch(restoreDraft(draft));
  }
}

export const {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  clearResponseError,
  resetForm,
  restoreDraft,
  setSelectedAddressId,
  clearCoupon,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
