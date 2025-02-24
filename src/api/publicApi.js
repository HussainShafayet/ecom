import axios from "axios";
import {setGlobalError} from "../redux/slice/globalErrorSlice";

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Public API instance (No Auth)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for Global Error Handling
publicApi.interceptors.response.use(
  (response) => response, // Return response if no errors
  (error) => {
    import("../redux/store").then(({ default: store }) => {
      if (!error.response) {
        store.dispatch(setGlobalError("Network error: Unable to connect to the server"));
      } else if (error.response.status === 404) {
        store.dispatch(setGlobalError("Requested resource not found"));
      } else if (error.response.status >= 500) {
        store.dispatch(setGlobalError("Server error: Please try again later"));
      } else if (error.response.status === 400) {
        store.dispatch(setGlobalError("Invalid request. Please check your input."));
      } else if (error.response.status === 403) {
        store.dispatch(setGlobalError("You do not have permission to access this resource."));
      } else if (error.response.status === 429) {
        store.dispatch(setGlobalError("Too many requests. Please try again later."));
      } else {
        store.dispatch(setGlobalError("An unexpected error occurred. Please try again."));
      }
    });

    return Promise.reject(error);
  }
);


export default publicApi;
