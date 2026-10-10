import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useWishlistToggle from '../../../hooks/useWishlistToggle';

// "Save" to the wishlist, on the product page (the cards have the heart over their picture). A component of its own because the wishlist
// state starts from the product's `is_favourite`, which only exists once the page has the product: mount it with a `key` of the product.
const SaveButton = ({ product }) => {
  const { isFavourite, add, remove } = useWishlistToggle(product);
  return (
    <button
      type="button"
      onClick={isFavourite ? remove : add}
      aria-pressed={isFavourite}
      aria-label={isFavourite ? 'Remove from wishlist' : 'Save to wishlist'}
      className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      {isFavourite ? <FaHeart aria-hidden="true" className="text-red-500 motion-safe:animate-pop" /> : <FaRegHeart aria-hidden="true" />}
      {isFavourite ? 'Saved' : 'Save'}
    </button>
  );
};

export default SaveButton;
