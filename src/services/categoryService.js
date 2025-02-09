import axios from 'axios';
import publicApi from '../api/publicApi';

// Fetch all categories from the API
export const getAllCategories = async (page_size=null, page=null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add limit
  }
  return await publicApi.get(`/products/categories?${query}`);
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
  return await publicApi.get(`/products/categories/flash-sale/?${query}`);
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
  return await publicApi.get(`/products/categories/new-arrival/?${query}`);
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
  return await publicApi.get(`/products/categories/best-selling/?${query}`);
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
  return await publicApi.get(`/products/categories/feature/?${query}`);
};
