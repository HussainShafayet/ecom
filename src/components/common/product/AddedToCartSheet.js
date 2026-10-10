import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { selectCartCount, selectTotalPrice } from '../../../redux/slice/cartSlice';
import { formatPrice } from '../../../utils/formatPrice';
import useDialog from '../../../hooks/useDialog';
import defaultImage from '../../../assets/images/default_product_image.jpg';

const SUGGESTIONS = 6;

// What a shopper wants right after "Add to Cart": to know it worked, what the cart holds now, and where to go next. A sheet from the bottom on a
// phone, a dialog from `md` (`useDialog`: focus in and back, Tab kept inside, Esc closes), instead of a button that changes its words for a
// moment: the line just added, the cart's count and total, View cart / Checkout, Continue shopping, and a row of other products to keep them
// looking. The cart's numbers are read from the store, where the line has already been added.
//   line         the cart line that was added (`handleClonedProduct`): name, image, colour/size names, quantity, prices
//   suggestions  other products to show (the page's related ones); the product itself is never among them
const AddedToCartSheet = ({ line, suggestions = [], onClose }) => {
  const dialog = useRef(null);
  useDialog(dialog, onClose);
  const count = useSelector(selectCartCount);
  const total = useSelector(selectTotalPrice);

  const unit = Number(line.has_discount ? line.discount_price : line.base_price) || 0;
  const options = [line.color_name && `Color: ${line.color_name}`, line.size_name && `Size: ${line.size_name}`].filter(Boolean).join(' · ');
  const more = suggestions.filter((item) => item?.id !== line.id).slice(0, SUGGESTIONS);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center md:p-4">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="added-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl outline-none motion-safe:animate-slide-up md:animate-none md:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
          <h2 id="added-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-sm text-green-700"><FaCheck /></span>
            Added to your cart
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex gap-3">
            <img
              src={line.image || defaultImage}
              alt=""
              onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaultImage; }}
              className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-contain"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">{line.name}</p>
              {options && <p className="mt-0.5 text-xs text-gray-500">{options}</p>}
              <p className="mt-1 text-sm text-gray-700">{line.quantity} × {formatPrice(unit)} = <span className="font-semibold">{formatPrice(unit * line.quantity)}</span></p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-3 ring-1 ring-indigo-100">
            <span className="text-sm text-gray-700">Your cart: <span className="font-semibold">{count} {count === 1 ? 'item' : 'items'}</span></span>
            <span className="text-base font-bold text-gray-900">{formatPrice(total)}</span>
          </div>

          <div className="flex gap-3">
            <Link to="/cart" className="flex h-11 flex-1 items-center justify-center rounded-lg border border-blue-600 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50">View cart</Link>
            <Link to="/checkout" className="flex h-11 flex-1 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-blue-700">Checkout</Link>
          </div>
          <button type="button" onClick={onClose} className="mx-auto block min-h-11 px-4 text-sm font-medium text-gray-600 underline hover:text-gray-900">Continue shopping</button>

          {more.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">You may also like</p>
              <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {more.map((item) => (
                  <li key={item.id} className="w-28 shrink-0">
                    <Link to={`/products/detail/${item.slug}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                      <img
                        src={item.image || defaultImage}
                        alt=""
                        loading="lazy"
                        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaultImage; }}
                        className="aspect-square w-full rounded-lg bg-gray-50 object-contain"
                      />
                      <span className="mt-1 line-clamp-2 block text-xs text-gray-800">{item.name}</span>
                      <span className="block text-sm font-semibold text-gray-900">{formatPrice(item.has_discount ? item.discount_price : item.base_price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddedToCartSheet;
