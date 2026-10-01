import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRedo } from 'react-icons/fa';
import { buyOrderAgain } from '../../redux/slice/orderSlice';

// "Buy again" on one of my orders: every line that can still be bought goes back into the cart with the quantity it had, and what
// could not (out of stock, no longer sold) is said in the shop's own sentences. Nothing is bought: the cart is where the customer
// decides, and checkout checks everything again.
const BuyAgain = ({ order }) => {
  const dispatch = useDispatch();
  const { loading, added, skipped, done } = useSelector((state) => state.order.buyAgain);
  const items = order?.items || [];
  if (items.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={() => dispatch(buyOrderAgain(items))}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-8"
      >
        <FaRedo aria-hidden="true" className="h-4 w-4" /> {loading ? 'Adding to your cart…' : 'Buy again'}
      </button>

      {done && (
        <div role="status" className="mt-3 space-y-2 text-sm">
          {added.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">
              <p className="font-medium">
                {added.length === items.length ? `All ${added.length} ${added.length === 1 ? 'item is' : 'items are'} in your cart.` : `${added.length} of ${items.length} items added to your cart.`}
              </p>
              <Link to="/cart" className="inline-flex min-h-11 items-center font-semibold text-green-900 underline">View cart</Link>
            </div>
          )}
          {skipped.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              <p className="font-medium">{added.length === 0 ? 'Nothing could be added.' : 'Not added:'}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {skipped.map((sentence, index) => <li key={index}>{sentence}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyAgain;
