// src/api/axiosSetup.js
import axios from "axios";
import * as Sentry from "@sentry/react";
import store from "../redux/store";
import { endSession } from "../redux/slice/authActions";
import { setGlobalError, setSectionError } from "../redux/slice/globalErrorSlice";
import publicApi from "./publicApi";
import { refreshSession, SessionError } from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// A new access token for a request that just came back 401. If another request renewed it while this one was on its
// way, use that one: every renewal retires the previous refresh token, so renewing twice would sign a valid customer out.
const accessTokenFor = (request) => {
  const current = store.getState().auth.accessToken;
  if (current && request.headers?.Authorization !== `Bearer ${current}`) return current;
  return refreshSession(); // one renewal, shared by every request waiting for it (see session.js)
};

// The same request without the customer's token, for a page the shop shows to everyone.
const asGuest = (request) => {
  delete request.headers.Authorization;
  return publicApi.request(request);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const section = originalRequest?.section; // Get section from config

    if (!error.response) {
      // Network Error: Treat as global
      Sentry.captureException(error);
      store.dispatch(setGlobalError("Network error: Unable to connect to the server"));
      return Promise.reject(error);
    }

    const status = error.response.status;
    if (status >= 500) {
      // A bug on the server side, not something the customer did: worth a Sentry issue.
      Sentry.captureException(error);
    }

    if (status === 401 && originalRequest) {
      // A token that was just renewed and is refused again: this session is not usable.
      if (originalRequest._retry) {
        store.dispatch(endSession());
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const accessToken = await accessTokenFor(originalRequest);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // Retry with the new token
      } catch (refreshError) {
        if (refreshError instanceof SessionError && refreshError.expired) {
          // The server refused the refresh token: signed out on this device, quietly (a banner offers to sign in again).
          // Requests for pages everyone may see (the shop, a product) carry on as a guest instead of failing.
          store.dispatch(endSession());
          if (originalRequest.optionalAuth) return asGuest(originalRequest);
        } else if (section) {
          // The renewal itself did not get through (connection, 5xx): says nothing about the session, which stays.
          store.dispatch(setSectionError({ section, error: "Could not reach the server. Please try again." }));
        }
        return Promise.reject(error);
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
    case 401:
      return "Please sign in to continue.";
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
