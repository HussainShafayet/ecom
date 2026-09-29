import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from './format';

// The lines of an order as they were bought: name, variant, quantity and the price paid. The link and the picture
// are the product's current ones; both are null once the product has been deleted. A line is one tap target (the whole row
// opens the product, at least 72 px tall) and a long name is cut at two lines so the price keeps its place.
const Line = ({ item }) => {
  const body = (
    <>
      {item.image ? (
        <img src={item.image} alt="" className="h-16 w-16 flex-none rounded object-cover" />
      ) : (
        <div className="h-16 w-16 flex-none rounded bg-gray-100" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium text-gray-800">{item.product_name}</p>
        {item.variant_label && item.variant_label !== 'Default' && <p className="text-sm text-gray-500">{item.variant_label}</p>}
        <p className="text-sm text-gray-500">{item.quantity} × {formatMoney(item.unit_price)}</p>
      </div>
      <span className="shrink-0 font-semibold text-gray-800">{formatMoney(item.line_total)}</span>
    </>
  );
  const row = 'flex min-h-[4.5rem] items-center gap-3 py-2';
  return item.product_slug
    ? <Link to={`/products/detail/${item.product_slug}`} className={`${row} hover:bg-gray-50`}>{body}</Link>
    : <div className={row}>{body}</div>;
};

const OrderItems = ({ items = [] }) => (
  <ul className="divide-y divide-gray-200">
    {items.map((item, index) => (
      <li key={`${item.sku}-${index}`}><Line item={item} /></li>
    ))}
  </ul>
);

export default OrderItems;
