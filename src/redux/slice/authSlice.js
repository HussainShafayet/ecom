import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import axios from 'axios';

import axios from 'axios';
const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }

// Async action for login
export const signInUser = createAsyncThunk('auth/signInUser', async (credentials, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('/auth/login', credentials);

    console.log('signin response',response);
    
    return response.data; // { accessToken, refreshToken, user }
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action for getUser
export const getUser = createAsyncThunk('auth/getUser', async (_, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.get('/auth/me');

    console.log('get user response',response);
    
    return response.data; // { accessToken, refreshToken, user }
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action to refresh access token
export const refreshToken = createAsyncThunk('auth/refreshToken', async (credentials , { rejectWithValue }) => {
  try {
    const api = (await import('../../api/axiosSetup')).default;
    const response = await api.post('/auth/refresh', credentials);
    console.log('refresh token response', response);
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Logout action
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    //await  axios.post('/api/auth/logout');
    const api = (await import('../../api/axiosSetup')).default;
    const response = await api.post('/auth/logout');
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
      const user = JSON.parse(localStorage.getItem('user'));
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (user && accessToken && refreshToken) {
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload.username;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload.username));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken; // Update the access token
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload.user; // Update the access token
      })
  },
});

export const { loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
