// Small formatters shared by the order pages.
import { formatPrice } from '../../utils/formatPrice';

// Prices come from the backend as numbers, and read like the rest of the shop (`formatPrice`): 1060 -> "৳1,060", 881.1 -> "৳881.10"
export const formatMoney = (value) => formatPrice(value || 0);

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');

export const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

// The delivery address of an order, one line per part: inside Dhaka has an area, outside has thana/district/division.
export const addressLines = (order) => {
  const place = order?.shipping_type === 'inside_dhaka'
    ? [order?.shipping_area, 'Dhaka']
    : [order?.shipping_thana, order?.shipping_district, order?.shipping_division];
  return [order?.shipping_address, place.filter(Boolean).join(', ')].filter(Boolean);
};
