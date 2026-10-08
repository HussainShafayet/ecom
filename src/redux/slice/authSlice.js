import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';
import publicApi from '../../api/publicApi';
import { clearTokens, readTokens, saveTokens } from '../../api/session';
import { retryAfterSeconds } from '../../api/errors';


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
    resendOtpError: null,
    // Set when the shop said "too many" (429): { seconds, id }; the pages count it down, `id` tells one refusal from the next
    signinWait: null,
    signupWait: null,
    verifyWait: null,
    resendWait: null,
    // What the backend said about the code it just sent ({ resend_after, expires_in, length }, seconds and digits): the code page
    // counts and draws from it instead of numbers of its own. Null until a code was sent (or from a backend that does not say).
    otpTiming: null,
    token: null,
  }

// What a refused sign-in/sign-up/code request sends on to the reducers: the backend's answer, plus how many seconds to wait when it
// was a 429 ("Request was throttled. Expected available in 15 seconds." is not something to show a customer).
const refusal = (error) => ({ ...(error?.response?.data || {}), retry_after: retryAfterSeconds(error) });

// The timing out of a "code sent" answer, or null when the backend did not send it (an older one): then the pages use their own defaults.
const timingOf = (payload) => {
  const { resend_after, expires_in, length } = payload?.data || {};
  return resend_after || expires_in || length ? { resend_after, expires_in, length } : null;
};

// Async action for signup
export const signUpUser = createAsyncThunk('auth/signUpUser', async (credentials, { rejectWithValue }) => {
  try {
     const response = await publicApi.post('/accounts/register/', credentials, {section: 'sign-up'});

    
    return response?.data;
  } catch (error) {
    return rejectWithValue(refusal(error));
  }
});

// Async action for verify-otp
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (credentials, { rejectWithValue }) => {
  try {
     const response = await publicApi.post('/accounts/verify-otp/', credentials, {section: 'verify-otp'});

    
    return response?.data?.data;
  } catch (error) {
    
    return rejectWithValue(refusal(error));
  }
});

// Async action for resend otp
export const resendOtp = createAsyncThunk('auth/resendOtp', async (credentials, { rejectWithValue }) => {
  try {
    const response = await publicApi.post('/accounts/resend-otp/', credentials, {section: 'resend-otp'});

    
    return response?.data;
  } catch (error) {
    return rejectWithValue(refusal(error));
  }
});

// Async action for login
export const signInUser = createAsyncThunk('auth/signInUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await publicApi.post('/accounts/login/', credentials, {section: 'sign-in'});

    
    return response?.data; // { accessToken, refreshToken, user }
  } catch (error) {
    return rejectWithValue(refusal(error));
  }
});


// Logout action
export const logoutUser = createAsyncThunk('auth/logoutUser', async (credential, { rejectWithValue, getState }) => {
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
      .addCase(signInUser.pending, (state)=>{
        state.signinLoading = true;
        state.signinWait = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.signinLoading = false;
        state.signinMessage = action?.payload?.message;
        state.signinError = null;
        state.token = action?.payload?.data?.token;
        state.otpTiming = timingOf(action.payload);
        //temp
        state.verifyOtpMessage = action?.payload?.message;
        
      })
      .addCase(signInUser.rejected, (state, action)=>{
        state.signinLoading = false;
        if (action.payload?.retry_after) {
          state.signinWait = { seconds: action.payload.retry_after, id: action.meta.requestId };
          state.signinError = null;
        } else {
          state.signinError = action.payload?.errors || 'Something went wrong!';
        }
      })



      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
        clearTokens();
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
        clearTokens();
      })

      //signup
      .addCase(signUpUser.pending, (state)=>{
        state.signupLoading = true;
        state.signupWait = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) =>{
        state.signupLoading = false;
        state.signupMessage = action?.payload?.message;
        state.signupError = null;
        state.token = action?.payload?.data?.token;
        state.otpTiming = timingOf(action.payload);

        //temp
        state.verifyOtpMessage = action?.payload?.message;
        
      })
      .addCase(signUpUser.rejected, (state, action) =>{
        state.signupLoading = false;
        if (action.payload?.retry_after) {
          state.signupWait = { seconds: action.payload.retry_after, id: action.meta.requestId };
          state.signupError = null;
        } else {
          state.signupError = action.payload?.errors  || 'Something went wrong!';
        }
      })

      //verifyOtp
      .addCase(verifyOtp.pending, (state)=>{
        state.verifyOtpLoading = true;
        state.verifyWait = null;
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
        state.verifyOtpLoading = false;
        if (action.payload?.retry_after) {
          state.verifyWait = { seconds: action.payload.retry_after, id: action.meta.requestId };
          state.verifyOtpError = null;
        } else {
          state.verifyOtpError = action.payload?.errors  || 'Something went wrong!';
        }
      })



       //resendOtp
       .addCase(resendOtp.pending, (state)=>{
        state.verifyOtpLoading = true;
        state.resendWait = null;
        state.resendOtpError = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpMessage = action?.payload?.message;
        state.verifyOtpError = null;
        state.otpTiming = timingOf(action.payload) || state.otpTiming;
      })
      .addCase(resendOtp.rejected, (state, action) =>{
        state.verifyOtpLoading = false;
        // a resend that failed is about the resend, not about the code that was typed
        if (action.payload?.retry_after) {
          state.resendWait = { seconds: action.payload.retry_after, id: action.meta.requestId };
        } else {
          state.resendOtpError = action.payload?.errors  || ['Could not send a new code. Please try again.'];
        }
      })
  },
});

export const {
  loadUserFromStorage, sessionRefreshed, sessionEnded, dismissSessionNotice,
  clearSignupState, clearVerifyOtpState, clearSigninState,
} = authSlice.actions;
export default authSlice.reducer;
