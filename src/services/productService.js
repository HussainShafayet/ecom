import axios from 'axios';

// Base API URL (you can adjust this based on your actual API endpoint)
const API_URL = 'http://192.168.0.103:8000'; // Replace with your API base URL

// src/services/productService.js
export const getAllProducts = async (page_size = null, sortBy = null, order = null, page = null,brands=[], tags=[], min_price = 0,max_price = 0, sizes=[], colors=[], discount_type, discount_value) => {
  let query = '';

  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  if (sortBy) {
    query += `sortBy=${sortBy}&`; // Add sorting
  }
  if (order) {
    query += `order=${order}&`; // Add order (asc or desc)
  }
  if (brands.length>0) {
    query += `brands=${brands.toString()}&`; // Add brands
  }
  if (tags.length>0) {
    query += `tags=${tags.toString()}&`; // Add tags
  }
  if (min_price > 0) {
    query += `min_price=${min_price}&`; // Add min_price
  }
  if (max_price > 0) {
    query += `max_price=${max_price}&`; // Add mas_price
  }
  if (sizes.length>0) {
    query += `sizes=${sizes.toString()}&`; // sizes
  }
  if (colors.length>0) {
    query += `colors=${colors.toString()}&`; // Add colors
  }
  if (discount_type && discount_value) {
    query += `discount_type=${discount_type}&`; // Add discount
    query += `discount_value=${discount_value}&`
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

