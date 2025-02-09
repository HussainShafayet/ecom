import axios from 'axios';
import publicApi from '../api/publicApi';

// Fetch all categories from the API
export const getHomeContent = async () => {
//  let query = '';
//  if (page) {
//    query += `page=${page}&`; // Add page for pagination
//  }
//  if (page_size) {
//    query += `page_size=${page_size}&`; // Add limit
//  }
  return await publicApi.get(`/content/pages/home`);
};

// Fetch new_arrival content from the API
export const getNewArrivalContent = async () => {
  return await publicApi.get(`/content/pages/newarrival/`);
};

// Fetch flash sale content from the API
export const getFlashSaleContent = async () => {
  return await publicApi.get(`/content/pages/flashsale`);
};


// Fetch best sale content from the API
export const getBestSellingContent = async () => {
  return await publicApi.get(`/content/pages/best_selling`);
};

// Fetch featured content from the API
export const getFeaturedContent = async () => {
  return await publicApi.get(`/content/pages/feature`);
};

// Fetch featured content from the API
export const getShopContent = async () => {
  return await publicApi.get(`/content/shop`);
};

// Fetch categories content from the API
export const getCategoriesContent = async () => {
  return await publicApi.get(`/content/pages/category`);
};
