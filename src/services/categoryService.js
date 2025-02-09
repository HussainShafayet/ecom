import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL; // Replace with your API URL

// Fetch all categories from the API
export const getAllCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${baseUrl}/api/products/categories?${query}`);
};

// Fetch flash sale categories from the API
export const getFlashSaleCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${baseUrl}/api/products/categories/flash-sale/?${query}`);
};

// Fetch new arrival categories from the API
export const getNewArrivalCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${baseUrl}/api/products/categories/new-arrival/?${query}`);
};


// Fetch new arrival categories from the API
export const getBestSellingCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${baseUrl}/api/products/categories/best-selling/?${query}`);
};

// Fetch featured categories from the API
export const getFeaturedCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${baseUrl}/api/products/categories/feature/?${query}`);
};
