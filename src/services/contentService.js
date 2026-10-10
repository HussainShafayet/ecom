import publicApi from '../api/publicApi';

// Fetch all categories from the API
export const getHomeContent = async () => {
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

// The shop's delivery charges and estimates, for the product page's "Delivery" card: the answer the checkout reads (GET /content/checkout/,
// backend docs/API_CONTRACT.md section 5), asked WITHOUT the customer's token on purpose: a signed-in customer's name and addresses are not
// needed to say "৳60 inside Dhaka". Only a hint, so a failure is kept in its own section and never shown.
export const getDeliveryInfo = async () => {
  return await publicApi.get(`/content/checkout/`, { section: "product-delivery" });
};
