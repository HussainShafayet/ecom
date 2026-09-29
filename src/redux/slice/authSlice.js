import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';
import publicApi from '../../api/publicApi';
import { clearTokens, readTokens, saveTokens } from '../../api/session';


const initialState = {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    sessionExpired: false, // the server ended this device's session (see api/session.js); shown until they sign in or dismiss it
    loading: false,
    error: null,
    message: null,
    signupLoading: false,
    signinLoading: false,
    verifyOtpLoading: false,
    signupMessage: null,
    signinMessage: null,
    signupError: null,
    signinError: null,
    verifyOtpMessage: null,
    verifyOtpError: null,
    token: null,
  }

// Async action for signup
export const signUpUser = createAsyncThunk('auth/signUpUser', async (credentials, { rejectWithValue }) => {
  try {
     const response = await publicApi.post('/accounts/register/', credentials, {section: 'sign-up'});

    console.log('signup response',response);
    
    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

// Async action for verify-otp
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (credentials, { rejectWithValue }) => {
  try {
     const response = await publicApi.post('/accounts/verify-otp/', credentials, {section: 'verify-otp'});

    console.log('verifyotp response',response);
    
    return response?.data?.data;
  } catch (error) {
    
    return rejectWithValue(error?.response?.data);
  }
});

// Async action for resend otp
export const resendOtp = createAsyncThunk('auth/resendOtp', async (credentials, { rejectWithValue }) => {
  try {
    const response = await publicApi.post('/accounts/resend-otp/', credentials, {section: 'resend-otp'});

    console.log('resend otp response',response);
    
    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

// Async action for login
export const signInUser = createAsyncThunk('auth/signInUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await publicApi.post('/accounts/login/', credentials, {section: 'sign-in'});

    console.log('signin response',response);
    
    return response?.data; // { accessToken, refreshToken, user }
  } catch (error) {
    return rejectWithValue(error?.response?.data);
  }
});


// Logout action
export const logoutUser = createAsyncThunk('auth/logoutUser', async (credential, { rejectWithValue, getState, dispatch }) => {
  try {
    const { accessToken } = getState().auth;
    const refresh_token = Cookies.get('refresh_token');
    const logout_body = {
      access: accessToken,
      refresh: refresh_token,
    }
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const response = await axios.post(`${baseUrl}accounts/logout/`,logout_body, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    console.log('logout response', response);
    return response?.data;
} catch (error) {
    console.error('Error submitting form:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error?.message);
}
});

const authSlice = createSlice({
  name: 'auth',
  initialState
  ,
  reducers: {
    // Brings the state in line with the cookies when the app opens. `isAuthenticated` is persisted in localStorage, the
    // tokens are cookies, and they can disagree (the cookies expired or were cleared): the refresh token is what a
    // session stands on, a missing access token is simply renewed by the first request that needs it.
    loadUserFromStorage: (state) => {
      const { access, refresh } = readTokens();

      if (refresh) {
        state.accessToken = access;
        state.refreshToken = refresh;
        state.isAuthenticated = true;
      } else {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      }
    },
    // A renewal (api/session.js) gave new tokens.
    sessionRefreshed: (state, action) => {
      state.accessToken = action.payload.access;
      if (action.payload.refresh) state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
    },
    // The server refused the refresh token: sign this device out. No call to the server (it would answer 401 again).
    sessionEnded: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
      clearTokens();
    },
    dismissSessionNotice: (state) => {
      state.sessionExpired = false;
    },
    clearSignupState: (state) => {
      state.signupMessage = null;
      state.signupError = null;
      state.signupLoading = false;
    },
    clearVerifyOtpState: (state) => {
      state.verifyOtpMessage = null;
      state.verifyOtpError = null;
      state.verifyOtpLoading = false;
    },
    clearSigninState: (state) => {
      state.signinLoading = null;
      state.signinMessage = null;
      state.signinError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      //sign in
      .addCase(signInUser.pending, (state, action)=>{
        state.signinLoading = true;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.signinLoading = false;
        state.signinMessage = action?.payload?.message;
        state.signinError = null;
        state.token = action?.payload?.data?.token;
        //temp
        state.verifyOtpMessage = action?.payload?.message;
        
      })
      .addCase(signInUser.rejected, (state, action)=>{
        state.signinLoading = false;
        state.signinError = action.payload?.errors || 'Something went wrong!';
      })



      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
        clearTokens();
      })
      .addCase(logoutUser.rejected, (state,action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
        clearTokens();
      })

      //signup
      .addCase(signUpUser.pending, (state, action)=>{
        state.signupLoading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action) =>{
        state.signupLoading = false;
        state.signupMessage = action?.payload?.message;
        state.signupError = null;
        state.token = action?.payload?.data?.token;

        //temp
        state.verifyOtpMessage = action?.payload?.message;
        
      })
      .addCase(signUpUser.rejected, (state, action) =>{
        state.signupLoading = false;
        state.signupError = action.payload?.errors  || 'Something went wrong!';
      })

      //verifyOtp
      .addCase(verifyOtp.pending, (state, action)=>{
        state.verifyOtpLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpMessage = action?.payload?.message;
        state.verifyOtpError = null;
        state.accessToken = action?.payload?.tokens?.access;
        state.refreshToken = action?.payload?.tokens?.refresh;
        state.isAuthenticated = true;
        state.sessionExpired = false;
        saveTokens(action?.payload?.tokens || {});
      })
      .addCase(verifyOtp.rejected, (state, action) =>{
        console.log(action.payload);
        
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload?.errors  || 'Something went wrong!';
      })



       //resendOtp
       .addCase(resendOtp.pending, (state, action)=>{
        state.verifyOtpLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpMessage = action?.payload?.message;
        state.verifyOtpError = null;
      })
      .addCase(resendOtp.rejected, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload?.errors  || 'Something went wrong!';
      })
  },
});

export const {
  loadUserFromStorage, sessionRefreshed, sessionEnded, dismissSessionNotice,
  clearSignupState, clearVerifyOtpState, clearSigninState,
} = authSlice.actions;
export default authSlice.reducer;
