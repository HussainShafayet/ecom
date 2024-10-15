import axios from 'axios';

// Base API URL (you can adjust this based on your actual API endpoint)
const API_URL = 'https://dummyjson.com/products'; // Replace with your API base URL

// Fetch all products (you can optionally pass filters or parameters)
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;  // Let the caller handle the error
  }
};

// Fetch a single product by its ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;  // Let the caller handle the error
  }
};

// Fetch products by category (you can pass the category as a filter)
export const getProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}?category=${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;  // Let the caller handle the error
  }
};
