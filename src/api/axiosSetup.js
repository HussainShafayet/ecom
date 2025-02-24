// src/api/axiosSetup.js
import axios from 'axios';
import {refreshToken} from '../redux/slice/authSlice';
import store from '../redux/store';
import Cookies from 'js-cookie';
import {Logout} from '../redux/slice/authActions';
import {setGlobalError} from '../redux/slice/globalErrorSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
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

// Response Interceptor - Refresh token if access token has expired
api.interceptors.response.use(
  (response) => response, // Return response if no errors
  async (error) => {
    if (!error.response) {
      
      // Network Error or Server Down
      store.dispatch(setGlobalError("Network error: Unable to connect to the server"));
    } else if (error.response.status >= 500) {
      // Server Errors (5xx)
      store.dispatch(setGlobalError("Server error: Please try again later"));
    } else if (error.response.status === 404) {
      // Not Found
      store.dispatch(setGlobalError("Data not found"));
    } else {

      const originalRequest = error.config;

      // Check if error is due to an expired access token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Prevents infinite loop

        try {
          console.log('Refreshing access token...'); // Log the refresh attempt
          const refresh_token = Cookies.get('refresh_token');
          if (refresh_token) {
            const result = await store.dispatch(refreshToken({expiresInMins:1,refresh: refresh_token}));
            console.log('new access result', result);
            
            const newAccessToken = result.payload.data.access;

            // Update the Authorization header with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request with the new token
            return api(originalRequest);
          }else{
            throw 'Session is Expired'
          }
        } catch (refreshError) {
          // If refreshing fails, log the user out and return error
          console.log('Refresh token expired or invalid, logging out...');
          store.dispatch(Logout());
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  
  }
);

//// Variables to manage token refresh
//let isRefreshing = false;
//let refreshSubscribers = [];

//// Helper function to add requests to the queue
//function subscribeTokenRefresh(callback) {
//  refreshSubscribers.push(callback);
//}

//// Function to execute all requests in the queue once the token is refreshed
//function onRefreshed(newAccessToken) {
//  refreshSubscribers.forEach((callback) => callback(newAccessToken));
//  refreshSubscribers = [];
//}

//// Request Interceptor - Add access token to headers if available
//api.interceptors.request.use((config) => {
//  const { accessToken } = store.getState().auth;
//  if (accessToken) {
//    config.headers.Authorization = `Bearer ${accessToken}`;
//  }
//  return config;
//});



//// Response Interceptor - Refresh token if access token has expired
//api.interceptors.response.use(
//  (response) => response, // Return response if no errors
//  async (error) => {
//    const originalRequest = error.config;

//    // Check if error is due to an expired access token
//    if (error.response?.status === 401 && !originalRequest._retry) {
//      originalRequest._retry = true; // Prevents infinite loop for this request

//      if (!isRefreshing) {
//        isRefreshing = true;
//        const refresh_token = Cookies.get('refresh_token');
//        if (refresh_token) {
//          try {
//            console.log('Refreshing access token...'); // Log the refresh attempt
//            const result = await store.dispatch(refreshToken({
//              refresh: refresh_token,
//              expiresInMins: 1,
//            }));
//            console.log('result', result);
            
//            const newAccessToken = result.payload.accessToken;

//            // Update the Authorization header with the new token
//            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//            // Notify all subscribers (queued requests) with the new token
//            onRefreshed(newAccessToken);
//            isRefreshing = false;
            
//            return api(originalRequest); // Retry the original request with the new token
//          } catch (refreshError) {
//            // If refreshing fails, log the user out and reject the request
//            console.warn('Refresh token expired or invalid, logging out...');
//            store.dispatch(logoutUser({refresh: refreshToken}));
//            isRefreshing = false;
//            return Promise.reject(refreshError);
//          }
//        }
//      } 

//      // Queue other requests while refreshing
//      return new Promise((resolve) => {
//        subscribeTokenRefresh((newAccessToken) => {
//          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//          resolve(api(originalRequest));
//        });
//      });
//    }

//    return Promise.reject(error);
//  }
//);

export default api;
