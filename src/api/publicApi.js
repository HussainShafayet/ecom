import axios from "axios";
import {setGlobalError, setSectionError} from "../redux/slice/globalErrorSlice";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    import("../redux/store").then(({ default: store }) => {
      const section = error?.config?.section; // Get the section from the API call config
      console.log(section);
      
      if (!error?.response) {
        // Network-level error: Treat as global
        //store.dispatch(setGlobalError("Network error: Unable to connect to the server"));
      } else {
        const errorMessage = getErrorMessage(error?.response?.status);
        if (section) {
          // Section-specific error
          store.dispatch(setSectionError({ section, error: errorMessage }));
        } else {
          // No section specified: Treat as global
          //store.dispatch(setGlobalError(errorMessage));
        }
      }
    });

    return Promise.reject(error);
  }
);

function getErrorMessage(status) {
  switch (status) {
    case 404:
      return "Requested resource not found";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server error: Please try again later";
    case 400:
      return "Invalid request. Please check your input.";
    case 403:
      return "You do not have permission to access this resource.";
    case 429:
      return "Too many requests. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export default publicApi;