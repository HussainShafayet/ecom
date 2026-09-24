// src/services/orderService.js
// The customer's own orders (authenticated) and the guest lookup by order number + phone (public).

// My orders, newest first: { count, next, previous, results: [order summary] }
export const getOrders = async (page = null, page_size = null) => {
  let query = '';
  if (page) {
    query += `page=${page}&`;
  }
  if (page_size) {
    query += `page_size=${page_size}&`;
  }
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/orders/?${query}`, { section: "orders"});
};

// One of my orders in full: address, totals, payment, status history, can_cancel
export const getOrder = async (orderId) => {
  const api = (await import('../api/axiosSetup')).default;
  return await api.get(`/orders/${orderId}/`, { section: "order-details"});
};

// Cancel my order (the backend allows it only while the order is pending); answers with the updated order
export const cancelOrder = async (orderId) => {
  const api = (await import('../api/axiosSetup')).default;
  return await api.post(`/orders/${orderId}/cancel/`, {}, { section: "order-cancel"});
};

// A guest follows an order: progress and items only (no name or address), 404 for a wrong number or phone
export const trackOrder = async (orderId, phoneNumber) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get(`/orders/track/`, {
    params: { order_id: orderId, phone_number: phoneNumber },
    section: "order-tracking",
  });
};
