import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from './format';

// The lines of an order as they were bought: name, variant, quantity and the price paid. The link and the picture
// are the product's current ones; both are null once the product has been deleted.
const OrderItems = ({ items = [] }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item, index) => (
      <li key={`${item.sku}-${index}`} className="flex items-center py-3 space-x-4">
        {item.image ? (
          <img src={item.image} alt={item.product_name} className="w-16 h-16 rounded object-cover flex-none" />
        ) : (
          <div className="w-16 h-16 rounded bg-gray-100 flex-none" aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          {item.product_slug ? (
            <Link to={`/products/detail/${item.product_slug}`} className="font-medium text-gray-800 hover:text-blue-500">
              {item.product_name}
            </Link>
          ) : (
            <span className="font-medium text-gray-800">{item.product_name}</span>
          )}
          {item.variant_label && item.variant_label !== 'Default' && <p className="text-sm text-gray-500">{item.variant_label}</p>}
          <p className="text-sm text-gray-500">
            {item.quantity} × {formatMoney(item.unit_price)}
          </p>
        </div>
        <span className="font-semibold text-gray-800">{formatMoney(item.line_total)}</span>
      </li>
    ))}
  </ul>
);

export default OrderItems;
