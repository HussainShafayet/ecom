import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../components/common';
import {Link} from 'react-router-dom';
import {clearWishlist, fetchtoWishlist, handleRemovetoWishlist} from '../../redux/slice/wishlistSlice';
import {ProductCardSkeleton} from '../../components/common/skeleton';
import {SectionError} from '../../components/common';

const WishList = () => {
  const {isLoading, items, error} = useSelector((state)=> state.wishList);
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const [confirmAllDelete, setConfirmAllDelete] = useState(false);

  useEffect(() => {
    // Guests keep their wishlist locally (redux-persist); only a signed-in customer needs the server copy.
    isAuthenticated && dispatch(fetchtoWishlist());
   }, [dispatch, isAuthenticated]);

   const handleRemoveAllItem = () => {
    const removeList = items?.map(element => ({ product_id: element.id })) || [];

    isAuthenticated && dispatch(handleRemovetoWishlist(removeList));
    dispatch(clearWishlist());
  };

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
          <span className='text-blue-500 cursor-pointer hover:underline transition-colors' onClick={() => setConfirmAllDelete(true)}>Clear Wishlist</span>
          }
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* No Items Message */}
          {items.length === 0 && (
            <p className="text-center text-gray-600 mt-8">Your wishlist is currently empty.
              <Link to="/products" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"> Add WishList</Link>
            </p>
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
