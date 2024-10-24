import axios from 'axios';

const API_URL = 'https://dummyjson.com'; // Replace with your API URL

// Fetch all categories from the API
export const getAllCategories = async () => {
  return await axios.get(`${API_URL}/products/categories/`);
};
