import axios from 'axios';

// Base API URL (you can adjust this based on your actual API endpoint)
const API_URL = 'https://dummyjson.com'; // Replace with your API base URL

// Fetch all products (you can optionally pass filters or parameters)
export const getAllProducts = async (limit = null, sortBy = null, order = null, ) => {
  let query = '';
 
  if (limit) {
    query += `limit=${limit}&`; // Add limit
  }
  if (sortBy) {
    query += `sortBy=${sortBy}&`; // Add category filter
  }
  if (order) {
    query += `order=${order}&`; // Add sort order, e.g., 'price_asc' or 'price_desc'
  }

  return await axios.get(`${API_URL}/products?${query}`);
};

// Fetch a single product by its ID
export const getProductById = async (id) => {
    return await axios.get(`${API_URL}/products/${id}`);
};

// Fetch products by category (you can pass the category as a filter)
export const getProductsByCategory = async (category=null, limit=null, sortBy = null, order = null, ) => {
  let query = '';
 
  if (limit) {
    query += `limit=${limit}&`; // Add limit
  }
  if (sortBy) {
    query += `sortBy=${sortBy}&`; // Add category filter
  }
  if (order) {
    query += `order=${order}&`; // Add sort order, e.g., 'price_asc' or 'price_desc'
  }
  return await axios.get(`${API_URL}/products/category/${category}?${query}`);
};

//export default productService;

