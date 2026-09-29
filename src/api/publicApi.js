import axios from "axios";
import * as Sentry from "@sentry/react";
import { canRetry, retryRequest } from "./retry";
import { clearFailure, reportFailure } from "./report";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// The store imports slices that import this file, so it is loaded when first needed.
const withStore = (callback) => import("../redux/store").then(({ default: store }) => callback(store));

publicApi.interceptors.response.use(
  (response) => {
    const section = response.config?.section;
    if (section) withStore((store) => clearFailure(store, section)); // this part of the page works again: forget its old error
    return response;
  },
  (error) => {
    // A read that failed on the connection or a briefly unavailable server is tried again (twice) before anyone hears of it
    if (canRetry(error)) return retryRequest(publicApi, error);

    withStore((store) => {
      // A bug on the server side, not something the visitor did, is worth a Sentry issue. So is a request that got no
      // answer, unless they are simply offline.
      if (error?.response ? error.response.status >= 500 : navigator.onLine !== false) Sentry.captureException(error);
      reportFailure(store, error);
    });

    return Promise.reject(error);
  }
);

export default publicApi;
