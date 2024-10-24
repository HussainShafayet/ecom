import axios from 'axios';

// Base API URL (you can adjust this based on your actual API endpoint)
const API_URL = 'https://dummyjson.com'; // Replace with your API base URL

// Fetch all products (you can optionally pass filters or parameters)
export const getAllProducts = async (limit = null) => {
  const limitQuery = limit ? `?limit=${limit}` : '';
  return await axios.get(`${API_URL}/products${limitQuery}`);
};

// Fetch a single product by its ID
export const getProductById = async (id) => {
    return await axios.get(`${API_URL}/products/${id}`);
};

// Fetch products by category (you can pass the category as a filter)
export const getProductsByCategory = async (category=null, limit=null) => {
  const limitQuery = limit ? `?limit=${limit}` : '';
  return await axios.get(`${API_URL}/products/category/${category}${limitQuery}`);
};

//export default productService;

