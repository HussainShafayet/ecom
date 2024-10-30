// src/api/axiosSetup.js
import axios from 'axios';
import {logoutUser, refreshToken} from '../redux/slice/authSlice';
import store from '../redux/store';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // For secure cookies (e.g., refresh tokens)
});

// Request Interceptor - Add access token to headers if available
api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor - Refresh token if access token has expired
api.interceptors.response.use(
  (response) => response, // Return response if no errors
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevents infinite loop

      try {
        console.log('Refreshing access token...'); // Log the refresh attempt
        const result = await store.dispatch(refreshToken());
        const newAccessToken = result.payload.accessToken;

        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refreshing fails, log the user out and return error
        console.warn('Refresh token expired or invalid, logging out...');
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
