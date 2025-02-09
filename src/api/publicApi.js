import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Public API instance (No Auth)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
