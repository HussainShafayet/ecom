// src/api/axiosSetup.js
import axios from 'axios';
import {logoutUser, refreshToken} from '../redux/slice/authSlice';
import store from '../redux/store';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://192.168.0.103:8000',
  //withCredentials: true, // For secure cookies (e.g., refresh tokens)
});

// Request Interceptor - Add access token to headers if available
api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

//// Response Interceptor - Refresh token if access token has expired
//api.interceptors.response.use(
//  (response) => response, // Return response if no errors
//  async (error) => {
//    const originalRequest = error.config;

//    // Check if error is due to an expired access token
//    if (error.response?.status === 401 && !originalRequest._retry) {
//      originalRequest._retry = true; // Prevents infinite loop

//      try {
//        console.log('Refreshing access token...'); // Log the refresh attempt
//        const result = await store.dispatch(refreshToken({expiresInMins:2,refreshToken: localStorage.getItem('refreshToken')}));
//        console.log('new access result', result);
        
//        const newAccessToken = result.payload.accessToken;

//        // Update the Authorization header with the new token
//        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//        // Retry the original request with the new token
//        return api(originalRequest);
//      } catch (refreshError) {
//        // If refreshing fails, log the user out and return error
//        console.warn('Refresh token expired or invalid, logging out...');
//        store.dispatch(logoutUser());
//        return Promise.reject(refreshError);
//      }
//    }

//    return Promise.reject(error);
//  }
//);

// Variables to manage token refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Helper function to add requests to the queue
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Function to execute all requests in the queue once the token is refreshed
function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

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
      originalRequest._retry = true; // Prevents infinite loop for this request

      if (!isRefreshing) {
        isRefreshing = true;
        const refresh_token = Cookies.get('refresh_token');
        if (refresh_token) {
          try {
            console.log('Refreshing access token...'); // Log the refresh attempt
            const result = await store.dispatch(refreshToken({
              refresh: refresh_token,
              expiresInMins: 1,
            }));
            console.log('result', result);
            
            const newAccessToken = result.payload.accessToken;

            // Update the Authorization header with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Notify all subscribers (queued requests) with the new token
            onRefreshed(newAccessToken);
            isRefreshing = false;
            
            return api(originalRequest); // Retry the original request with the new token
          } catch (refreshError) {
            // If refreshing fails, log the user out and reject the request
            console.warn('Refresh token expired or invalid, logging out...');
            store.dispatch(logoutUser());
            isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }
      } 

      // Queue other requests while refreshing
      return new Promise((resolve) => {
        subscribeTokenRefresh((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
