import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import QuantitySelector from '../common/product/QuantitySelector';
import { minimumOf } from '../../utils/minimumOrder';
import { discountLabel, formatPrice } from '../../utils/formatPrice';
import defaultImage from '../../assets/images/default_product_image.jpg';

// One line of the cart, phone first: a 72 px picture, the name (two lines at most), which colour/size, the price, the
// quantity (40 px targets, typed or − +) next to what the line comes to, a 40 px remove button. Whatever the shop said about
// THIS line (not enough stock, below the minimum order) is written under it, not at the top of the page.
//   error   why the last quantity change was refused (a sentence), or nothing
//   onMoveToWishlist(item)   when given, a 40 px "Move to wishlist" under the quantity: keep it for later instead of removing it
const CartItem = ({ item, error, onQuantityChange, onRemove, onMoveToWishlist }) => {
  const minimum = minimumOf(item);
  const unitPrice = item.has_discount ? item.discount_price : item.base_price;
  const details = [item.brand_name, item.color_name && `Color: ${item.color_name}`, item.size_name && `Size: ${item.size_name}`].filter(Boolean).join(' · ');

  return (
    <li className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <Link to={`/products/detail/${item.slug}`} className="shrink-0">
        <img src={item.image || defaultImage} alt={item.name} className="h-[4.5rem] w-[4.5rem] rounded-lg bg-gray-50 object-contain sm:h-24 sm:w-24" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
            <Link to={`/products/detail/${item.slug}`} className="hover:text-blue-600">{item.name}</Link>
          </h2>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name} from the cart`}
            className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <FaTrash aria-hidden="true" />
          </button>
        </div>

        {details && <p className="mt-0.5 text-xs text-gray-500">{details}</p>}

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold text-gray-900">{formatPrice(unitPrice)}</span>
          {item.has_discount && (
            <>
              <span className="text-xs text-gray-400 line-through">{formatPrice(item.base_price)}</span>
              <span className="text-xs font-semibold text-red-600">{discountLabel(item.discount_value, item.discount_type)}</span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantitySelector
            quantity={item.quantity}
            minimum={minimum}
            label={null}
            showMinimum={false}
            name={item.name}
            onChange={(value) => onQuantityChange(item, value)}
          />
          <span className="text-base font-bold text-gray-900" aria-label={`Line total ${formatPrice(unitPrice * item.quantity)}`}>
            {formatPrice(unitPrice * item.quantity)}
          </span>
        </div>

        {onMoveToWishlist && (
          <button
            type="button"
            onClick={() => onMoveToWishlist(item)}
            aria-label={`Move ${item.name} to your wishlist`}
            className="-ml-1 mt-1 inline-flex h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-pink-600 hover:bg-pink-50"
          >
            <FaHeart aria-hidden="true" /> Move to wishlist
          </button>
        )}

        {minimum > 1 && (
          <p className={`mt-1 text-xs ${item.quantity < minimum ? 'font-semibold text-red-500' : 'text-gray-500'}`}>
            Minimum order: {minimum}
          </p>
        )}
        {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </li>
  );
};

export default CartItem;
