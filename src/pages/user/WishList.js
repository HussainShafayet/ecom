import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { LazySection, ProductCard } from '../../components/common';
import { SuggestedProducts } from '../../components/sections';
import {Link} from 'react-router-dom';
import {clearWishlist, fetchtoWishlist, handleRemovetoWishlist} from '../../redux/slice/wishlistSlice';
import {ProductCardSkeleton} from '../../components/common/skeleton';
import {SectionError} from '../../components/common';
import {pushToast} from '../../redux/slice/toastSlice';
import usePageTitle from '../../hooks/usePageTitle';
import {addAllSummary, addProductToCart, sortForAddAll} from '../../utils/addProductToCart';

const WishList = () => {
  usePageTitle('Wishlist');
  const {isLoading, items, error} = useSelector((state)=> state.wishList);
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const cartItems = useSelector((state) => state.cart?.cartItems);
  const [confirmAllDelete, setConfirmAllDelete] = useState(false);
  const [adding, setAdding] = useState(false); // "Add all to cart" is talking to the shop

  useEffect(() => {
    // Guests keep their wishlist locally (redux-persist); only a signed-in customer needs the server copy.
    isAuthenticated && dispatch(fetchtoWishlist());
   }, [dispatch, isAuthenticated]);

   // The list empties at once; if the shop could not do it for a signed-in customer, say so and show what is still on the server
   const handleRemoveAllItem = async () => {
    const removeList = items?.map(element => ({ product_id: element.id })) || [];

    dispatch(clearWishlist());
    if (!isAuthenticated) return;
    const result = await dispatch(handleRemovetoWishlist(removeList));
    if (handleRemovetoWishlist.rejected.match(result)) {
      dispatch(pushToast('Could not clear your wishlist. Please try again.', 'error'));
      dispatch(fetchtoWishlist());
    }
  };

  // Every product that can go straight in goes in (its smallest order); the sentence after says what did not, and why. The wishlist stays as it is.
  const handleAddAll = async () => {
    const { add, needOptions, soldOut, already } = sortForAddAll(items, cartItems);
    setAdding(true);
    let added = 0;
    let refused = '';
    for (const product of add) {
      try {
        if (await addProductToCart(dispatch, isAuthenticated, product)) added += 1;
      } catch (failure) {
        refused = refused || failure?.errors?.[0] || failure?.error || 'Some items could not be added. Please try again.';
      }
    }
    setAdding(false);
    dispatch(pushToast(addAllSummary({ added, already, needOptions, soldOut, refused }), refused && !added ? 'error' : 'success'));
  };

  const canAddAny = sortForAddAll(items, cartItems).add.length > 0;

  return (
    <>
    {isLoading ?
      <div className="container mx-auto my-6 animate-pulse">
      {/* Wishlist Heading Skeleton */}
      <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>

      {/* Wishlist Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>

    </div>

     :
      error ? (
      <SectionError message={error} />
    ) :
      <div className="container mx-auto my-6 relative">
        <div className='flex justify-between items-center'>
          <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
          {items.length > 0 &&
          <button type="button" className='min-h-10 px-2 text-blue-500 hover:underline transition-colors' onClick={() => setConfirmAllDelete(true)}>Clear Wishlist</button>
          }
        </div>
        {canAddAny && (
          <button
            type="button"
            onClick={handleAddAll}
            disabled={adding}
            className="mb-4 flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {adding ? 'Adding...' : 'Add all to cart'}
          </button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* No Items Message */}
          {items.length === 0 && (
            <>
              <div className="mt-6 flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-10 text-center shadow-sm">
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-2xl text-pink-500"><FaHeart /></span>
                <h3 className="mt-3 font-semibold text-gray-900">Your wishlist is empty</h3>
                <p className="mt-1 text-sm text-gray-600">Tap the heart on a product to keep it here for later.</p>
                <Link to="/products" className="mt-4 inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">Browse products</Link>
              </div>
              <LazySection><SuggestedProducts title="Start with these" /></LazySection>
            </>
          )}


          {/* Confirm All Delete Warning in Card */}
          {confirmAllDelete && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 p-3 rounded-lg">
              <div className="text-center">
                <p className="text-gray-800 mb-2">Are you sure you want to remove all item?</p>
                <div className="flex justify-center gap-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    onClick={() => {
                      handleRemoveAllItem()
                      setConfirmAllDelete(false);
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                    onClick={() => setConfirmAllDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    }
    </>
  );
};

export default WishList;
