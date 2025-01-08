import axios from 'axios';

const API_URL = 'http://192.168.0.103:8000'; // Replace with your API URL

// Fetch all categories from the API
export const getHomeContent = async () => {
//  let query = '';
//  if (page) {
//    query += `page=${page}&`; // Add page for pagination
//  }
//  if (page_size) {
//    query += `page_size=${page_size}&`; // Add limit
//  }
  return await axios.get(`${API_URL}/api/content/pages/home`);
};

// Fetch new_arrival content from the API
export const getNewArrivalContent = async () => {
  return await axios.get(`${API_URL}/api/content/pages/newarrival/`);
};

// Fetch flash sale content from the API
export const getFlashSaleContent = async () => {
  return await axios.get(`${API_URL}/api/content/pages/flashsale`);
};


// Fetch best sale content from the API
export const getBestSellingContent = async () => {
  return await axios.get(`${API_URL}/api/content/pages/best_selling`);
};

// Fetch featured content from the API
export const getFeaturedContent = async () => {
  return await axios.get(`${API_URL}/api/content/pages/feature`);
};

// Fetch featured content from the API
export const getShopContent = async () => {
  return await axios.get(`${API_URL}/api/content/shop`);
};

// Fetch categories content from the API
export const getCategoriesContent = async () => {
  return await axios.get(`${API_URL}/api/content/pages/category`);
};
