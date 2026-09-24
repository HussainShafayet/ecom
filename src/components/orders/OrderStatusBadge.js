import React from 'react';

const COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-700',
};

// `status` is the machine value (colour), `label` the backend's status_display
const OrderStatusBadge = ({ status, label }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {label || status}
  </span>
);

export default OrderStatusBadge;
