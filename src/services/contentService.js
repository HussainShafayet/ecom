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
  return await publicApi.get(`/content/pages/home`, { section: "home-content"});
};

// Fetch new_arrival content from the API
export const getNewArrivalContent = async () => {
  return await publicApi.get(`/content/pages/newarrival/`, { section: "new-arrival-content"});
};

// Fetch flash sale content from the API
export const getFlashSaleContent = async () => {
  return await publicApi.get(`/content/pages/flashsale`, { section: "flash-sale-content"});
};


// Fetch best sale content from the API
export const getBestSellingContent = async () => {
  return await publicApi.get(`/content/pages/best_selling`, { section: "best-selling-content"});
};

// Fetch featured content from the API
export const getFeaturedContent = async () => {
  return await publicApi.get(`/content/pages/feature`, { section: "featured-content"});
};

// Fetch featured content from the API
export const getShopContent = async () => {
  return await publicApi.get(`/content/shop`, { section: "shop-content"});
};

// Fetch categories content from the API
export const getCategoriesContent = async () => {
  return await publicApi.get(`/content/pages/category`, { section: "category-content"});
};
