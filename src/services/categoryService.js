import axios from 'axios';

const API_URL = 'https://dummyjson.com/products/categories'; // Replace with your API URL

// Fetch all categories from the API
export const getCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
