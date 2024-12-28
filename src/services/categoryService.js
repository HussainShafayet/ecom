import axios from 'axios';

const API_URL = 'http://192.168.0.103:8000'; // Replace with your API URL

// Fetch all categories from the API
export const getAllCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await axios.get(`${API_URL}/api/products/categories?${query}`);
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
  return await axios.get(`${API_URL}/api/products/categories/flash-sale/?${query}`);
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
  return await axios.get(`${API_URL}/api/products/categories/new-arrival/?${query}`);
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
  return await axios.get(`${API_URL}/api/products/categories/best-selling/?${query}`);
};
