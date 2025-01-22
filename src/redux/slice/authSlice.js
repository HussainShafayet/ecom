import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
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
    user_id: null,
  }

// Async action for signup
export const signUpUser = createAsyncThunk('auth/signUpUser', async (credentials, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/register/', credentials);

    console.log('signup response',response);
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action for verify-otp
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (credentials, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/verify-otp/', credentials);

    console.log('verifyotp response',response);
    
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action for resend otp
export const resendOtp = createAsyncThunk('auth/resendOtp', async (credentials, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/resend-otp/', credentials);

    console.log('resend otp response',response);
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action for login
export const signInUser = createAsyncThunk('auth/signInUser', async (credentials, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/login/', credentials);

    console.log('signin response',response);
    
    return response.data; // { accessToken, refreshToken, user }
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});


// Async action to refresh access token
export const refreshToken = createAsyncThunk('auth/refreshToken', async (credentials , { rejectWithValue }) => {
  try {
    const api = (await import('../../api/axiosSetup')).default;
    const response = await api.post('api/accounts/token/refresh/', credentials);
    console.log('refresh token response', response);
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Check Authentication Status
export const checkAuth =  () => async (dispatch) => {
  const refresh_token = Cookies.get('refresh_token');
  if (refresh_token) {
    try {
      dispatch(refreshToken({expiresInMins:1,refresh: refresh_token}))
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }
};

// Logout action
export const logoutUser = createAsyncThunk('auth/logoutUser', async (credential, { rejectWithValue }) => {
  try {
    //await  axios.post('/api/auth/logout');
    const api = (await import('../../api/axiosSetup')).default;
    const response = await api.post('/api/accounts/logout/', credential);
    console.log('logout response', response);
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState
  ,
  reducers: {
    loadUserFromStorage: (state) => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
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
        //console.log(action.payload);
        state.signinLoading = false;
        state.signinMessage = action.payload.message;
        state.signinError = null;
        state.user_id = action.payload.data.user_id;
        //temp
        state.verifyOtpMessage = action.payload.message;
        
      })
      .addCase(signInUser.rejected, (state, action)=>{
        state.signinLoading = false;
        state.signinError = action.payload.errors;
      })



      .addCase(refreshToken.fulfilled, (state, action) => {
        //console.log(action);
        state.accessToken = action.payload.data.access; // Update the access token
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.data.access);
        localStorage.setItem('refreshToken', action.payload.data.refresh);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        Cookies.remove('refresh_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })

      //signup
      .addCase(signUpUser.pending, (state, action)=>{
        state.signupLoading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action) =>{
        state.signupLoading = false;
        state.signupMessage = action.payload.message;
        state.signupError = null;
        state.user_id = action.payload.data.user_id;
        
      })
      .addCase(signUpUser.rejected, (state, action) =>{
        state.signupLoading = false;
        state.signupError = action.payload.errors;
      })

      //verifyOtp

      .addCase(verifyOtp.pending, (state, action)=>{
        state.verifyOtpLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpMessage = action.payload.message;
        state.verifyOtpError = null;
        
        //state.user = action.payload.profile.username;
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.isAuthenticated = true;
        
        Cookies.set('refresh_token', action.payload.tokens.refresh, {
          secure: true, // Ensures cookies are sent only over HTTPS
          sameSite: 'Strict', // Prevents CSRF attacks
        });

        localStorage.removeItem('cartItems');
        localStorage.removeItem('wishList');

        localStorage.setItem('accessToken', action.payload.tokens.access);
        localStorage.setItem('refreshToken', action.payload.tokens.refresh);

      })
      .addCase(verifyOtp.rejected, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload.errors;
      })



       //resendOtp
       .addCase(resendOtp.pending, (state, action)=>{
        state.verifyOtpLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpMessage = action.payload.message;
        state.verifyOtpError = null;
      })
      .addCase(resendOtp.rejected, (state, action) =>{
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload.errors;
      })
  },
});

export const { loadUserFromStorage, clearSignupState, clearVerifyOtpState, clearSigninState } = authSlice.actions;
export default authSlice.reducer;
