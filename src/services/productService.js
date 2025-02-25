import axios from 'axios';
import publicApi from '../api/publicApi';


// src/services/productService.js
export const getAllProducts = async (page_size = null, ordering = null, page = null, category= null,brands=[], tags=[], min_price = 0,max_price = 0, sizes=[], colors=[], discount_type, discount_value, search="") => {
  let query = '';

  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  if (ordering) {
    query += `ordering=${ordering}&`; // Add order 
  }
  if (category) {
    query += `category=${category}&`; // Add order category
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
  if (search) {
    query += `search=${search}&`; // Add search
  }

  return await publicApi.get(`/products?${query}`, { section: "products"});
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
  
  return await publicApi.get(`/products/new-arrivals?${query}`, { section: "new-arrival"});
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

  return await publicApi.get(`/products/best-selling?${query}`, { section: "best-sale"});
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

  return await publicApi.get(`/products/flash-sale?${query}`, { section: "flash-sale"});
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

  return await publicApi.get(`/products/featured?${query}`, { section: "featured"});
};


// Fetch a single product by its slug
export const getProductById = async (slug) => {
    return await publicApi.get(`/products/detail/${slug}`, { section: "product-details"});
};

//export default productService;

