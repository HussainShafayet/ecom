import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, handleAddtoWishlist, handleRemovetoWishlist, removeFromWishlist } from '../redux/slice/wishlistSlice';
import { pushToast } from '../redux/slice/toastSlice';

// The wishlist heart of ONE product, for the product card and the product page.
// A guest's wishlist is local and cannot fail. A signed-in customer's lives on the shop: the heart only fills when the shop took it, and a
// refusal (the backend's sentence, else a general one) or a failed removal is a toast, because nothing else on the page would say it.
//   product  the card or the detail (`id`, `is_favourite`)
// Returns { isFavourite, add, remove }.
const useWishlistToggle = (product) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favouriteIds } = useSelector((state) => state.wishList);
  const [productFavourite, setProductFavourite] = useState(product?.is_favourite || false);

  const add = async () => {
    if (!isAuthenticated) {
      dispatch(addToWishlist(product));
      return;
    }
    const result = await dispatch(handleAddtoWishlist({ product_id: product.id }));
    if (handleAddtoWishlist.rejected.match(result)) {
      dispatch(pushToast(result.payload?.errors?.[0] || result.payload?.error || 'Could not add this to your wishlist. Please try again.', 'error'));
    }
  };

  const remove = async () => {
    try {
      if (isAuthenticated) {
        const response = await dispatch(handleRemovetoWishlist({ product_id: product.id })).unwrap();
        response.success && setProductFavourite(false);
      }
      dispatch(removeFromWishlist(product.id));
    } catch (failure) {
      dispatch(pushToast(failure?.errors?.[0] || failure?.error || 'Could not remove this from your wishlist. Please try again.', 'error'));
    }
  };

  const isFavourite = Boolean((favouriteIds && favouriteIds[product.id]) || productFavourite);
  return { isFavourite, add, remove };
};

export default useWishlistToggle;
