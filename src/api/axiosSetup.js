// src/api/axiosSetup.js
import axios from "axios";
import { refreshToken } from "../redux/slice/authSlice";
import store from "../redux/store";
import Cookies from "js-cookie";
import { Logout } from "../redux/slice/authActions";
import { setGlobalError, setSectionError } from "../redux/slice/globalErrorSlice";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const section = originalRequest?.section; // Get section from config
    console.log(section);
    
    if (!error.response) {
      // Network Error: Treat as global
      store.dispatch(setGlobalError("Network error: Unable to connect to the server"));
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Handle 401 (Unauthorized) with token refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing access token...");
        const refresh_token = Cookies.get("refresh_token");
        if (!refresh_token) {
          throw new Error("Session is expired");
        }

        const result = await store.dispatch(refreshToken({ expiresInMins: 1, refresh: refresh_token }));
        const newAccessToken = result.payload.data.access;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Retry with new token
      } catch (refreshError) {
        console.log("Refresh token expired or invalid, logging out...");
        store.dispatch(Logout());
        //store.dispatch(setGlobalError("Session expired. Please sign in again."));
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = getErrorMessage(status);
    if (section) {
      // Section-specific error
      store.dispatch(setSectionError({ section, error: errorMessage }));
    } else {
      // No section specified: Treat as global
      store.dispatch(setGlobalError(errorMessage));
    }

    return Promise.reject(error);
  }
);

function getErrorMessage(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 403:
      return "You do not have permission to access this resource.";
    case 404:
      return "Data not found";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server error: Please try again later";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export default api;