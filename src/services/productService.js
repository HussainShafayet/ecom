import axios from 'axios';

// Base API URL (you can adjust this based on your actual API endpoint)
const API_URL = 'http://192.168.0.103:8000'; // Replace with your API base URL

// src/services/productService.js
export const getAllProducts = async (limit = null, sortBy = null, order = null, page = null, skip=null) => {
  let query = '';

  if (limit) {
    query += `limit=${limit}&`; // Add limit
  }
  if (sortBy) {
    query += `sortBy=${sortBy}&`; // Add sorting
  }
  if (order) {
    query += `order=${order}&`; // Add order (asc or desc)
  }
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (skip) {
    query += `skip=${skip}&`; // Add skip for pagination
  }

  return await axios.get(`${API_URL}/api/products?${query}`);
};

// new arrival products
export const getNewArrivalProducts = async (page, page_size) => {
  let query = '';

  //if (limit) {
  //  query += `limit=${limit}&`; // Add limit
  //}
  //if (sortBy) {
  //  query += `sortBy=${sortBy}&`; // Add sorting
  //}
  //if (order) {
  //  query += `order=${order}&`; // Add order (asc or desc)
  //}
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }
  
  return await axios.get(`${API_URL}/api/products/new-arrivals?${query}`);
};

// best-selling products
export const getBestSellingProducts = async (page , page_size) => {
  let query = '';

  //if (limit) {
  //  query += `limit=${limit}&`; // Add limit
  //}
  //if (sortBy) {
  //  query += `sortBy=${sortBy}&`; // Add sorting
  //}
  //if (order) {
  //  query += `order=${order}&`; // Add order (asc or desc)
  //}
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }

  return await axios.get(`${API_URL}/api/products/best-selling?${query}`);
};


// flash sale products
export const getFlashSaleProducts = async (page, page_size) => {
  let query = '';

  //if (limit) {
  //  query += `limit=${limit}&`; // Add limit
  //}
  //if (sortBy) {
  //  query += `sortBy=${sortBy}&`; // Add sorting
  //}
  //if (order) {
  //  query += `order=${order}&`; // Add order (asc or desc)
  //}
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }

  return await axios.get(`${API_URL}/api/products/flash-sale?${query}`);
};


// featured products
export const getFeaturedProducts = async (page, page_size) => {
  let query = '';

  //if (limit) {
  //  query += `limit=${limit}&`; // Add limit
  //}
  //if (sortBy) {
  //  query += `sortBy=${sortBy}&`; // Add sorting
  //}
  //if (order) {
  //  query += `order=${order}&`; // Add order (asc or desc)
  //}
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }

  return await axios.get(`${API_URL}/api/products/featured?${query}`);
};


// Fetch a single product by its slug
export const getProductById = async (slug) => {
    return await axios.get(`${API_URL}/api/products/detail/${slug}`);
};

// Fetch products by category (you can pass the category as a filter)
export const getProductsByCategory = async (category=null, limit=null, sortBy = null, order = null, page = null, skip=null) => {
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
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (skip) {
    query += `skip=${skip}&`; // Add skip for pagination
  }
  return await axios.get(`${API_URL}/products/category/${category}?${query}`);
};

//export default productService;

