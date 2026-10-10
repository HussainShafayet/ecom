// src/services/productService.js
// The products list. Every value is encoded (a brand called "Marks & Spencer" must not end the query at the "&"); a list goes in as
// its encoded items joined by commas, the way the backend splits it.
export const getAllProducts = async (page_size = null, ordering = null, page = null, category= null,brands=[], tags=[], min_price = 0,max_price = 0, sizes=[], colors=[], discount_type, discount_value, search="") => {
  const parts = [];
  const add = (name, value) => parts.push(`${name}=${encodeURIComponent(value)}`);
  const addList = (name, items) => parts.push(`${name}=${items.map(encodeURIComponent).join(',')}`);

  if (page) add('page', page); // pagination
  if (page_size) add('page_size', page_size);
  if (ordering) add('ordering', ordering);
  if (category) add('category', category);
  if (brands.length>0) addList('brands', brands);
  if (tags.length>0) addList('tags', tags);
  if (min_price > 0) add('min_price', min_price);
  if (max_price > 0) add('max_price', max_price);
  if (sizes.length>0) addList('sizes', sizes);
  if (colors.length>0) addList('colors', colors);
  if (discount_type && discount_value) {
    add('discount_type', discount_type);
    add('discount_value', discount_value);
  }
  if (search) add('search', search);
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products?${parts.join('&')}`, { section: "products", optionalAuth: true});
};

// The products of one brand (the product page's "More from ..."): its own request and section, so a failure of this hint is never mixed up with the
// product lists' (`products`). The caller leaves out the product it is on, so ask for one more than will be shown.
export const getBrandProducts = async (brand, pageSize = 13) => {
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products?brands=${encodeURIComponent(brand)}&page_size=${pageSize}`, { section: "brand-products", optionalAuth: true });
};

// new arrival products
export const getNewArrivalProducts = async (page, page_size) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products/new-arrivals?${query}`, { section: "new-arrival", optionalAuth: true});
};

// best-selling products
export const getBestSellingProducts = async (page , page_size) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products/best-selling?${query}`, { section: "best-sale", optionalAuth: true});
};


// flash sale products
export const getFlashSaleProducts = async (page, page_size) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products/flash-sale?${query}`, { section: "flash-sale", optionalAuth: true});
};


// featured products
export const getFeaturedProducts = async (page, page_size) => {
  let query = '';
  if (page) {
    query += `page=${page}&`; // Add page for pagination
  }
  if (page_size) {
    query += `page_size=${page_size}&`; // Add skip for pagination
  }
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products/featured?${query}`, { section: "featured", optionalAuth: true});
};


// Fetch a single product by its slug
export const getProductById = async (slug) => {
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/products/detail/${slug}`, { section: "product-details", optionalAuth: true});
};

