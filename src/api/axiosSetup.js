// src/api/axiosSetup.js
import axios from "axios";
import * as Sentry from "@sentry/react";
import store from "../redux/store";
import { endSession } from "../redux/slice/authActions";
import publicApi from "./publicApi";
import { canRetry, retryRequest } from "./retry";
import { clearFailure, reportFailure } from "./report";
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
  (response) => {
    clearFailure(store, response.config?.section); // this part of the page works again: forget its old error
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // A read that failed on the connection or a briefly unavailable server is tried again (twice) before anyone hears of it
    if (canRetry(error)) return retryRequest(api, error);

    if (!error.response) {
      // No answer at all. Offline is the customer's connection, not a bug worth a Sentry issue.
      if (navigator.onLine !== false) Sentry.captureException(error);
      reportFailure(store, error);
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
        } else {
          // The renewal itself did not get through (connection, 5xx): says nothing about the session, which stays.
          reportFailure(store, error, "Could not reach the server. Please try again.");
        }
        return Promise.reject(error);
      }
    }

    reportFailure(store, error);
    return Promise.reject(error);
  }
);

export default api;
