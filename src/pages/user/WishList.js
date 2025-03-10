//import React, {useEffect} from 'react';
//import { FaTrashAlt, FaCartPlus, FaStar } from 'react-icons/fa';
//import {useSelector} from 'react-redux';
//import {useNavigate} from 'react-router-dom';

//const Wishlist = () => {
//  const wishlistItems = [
//    {
//      id: 1,
//      image: 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg',
//      name: 'Stylish Jacket',
//      price: '99.99',
//      availability: 'In Stock',
//      rating: 4.5,
//      description: 'A comfortable and stylish jacket for all seasons.',
//    },
//    {
//      id: 2,
//      image: 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg',
//      name: 'Classic Watch',
//      price: '79.99',
//      availability: 'In Stock',
//      rating: 4.2,
//      description: 'Elegant wristwatch with leather band and quartz movement.',
//    },
//    {
//      id: 3,
//      image: 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg',
//      name: 'Running Shoes',
//      price: '59.99',
//      availability: 'Out of Stock',
//      rating: 4.7,
//      description: 'Lightweight running shoes designed for comfort and durability.',
//    },
//    {
//        id: 4,
//        image: 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg',
//        name: 'Classic Watch',
//        price: '79.99',
//        availability: 'In Stock',
//        rating: 4.2,
//        description: 'Elegant wristwatch with leather band and quartz movement.',
//      },
//      {
//        id: 5,
//        image: 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg',
//        name: 'Running Shoes',
//        price: '59.99',
//        availability: 'Out of Stock',
//        rating: 4.7,
//        description: 'Lightweight running shoes designed for comfort and durability.',
//      },
//  ];

//  const {isAuthenticated} = useSelector((state)=>state.auth);
//  const navigate = useNavigate();

//  useEffect(() => {
//    if (!isAuthenticated) {
//      navigate('/signin');
//    }
//  }, [isAuthenticated, navigate]);

//  return (
//    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
//      <div className="max-w-7xl mx-auto">
        
//        {/* Header Section */}
//        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">My Wishlist</h1>

//        {/* Wishlist Items Grid */}
//        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//          {wishlistItems.map((item) => (
//            <div
//              key={item.id}
//              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform transform hover:scale-105"
//            >
//              {/* Product Image */}
//              <div className="relative w-full h-56 overflow-hidden">
//                <img
//                  src={item.image}
//                  alt={item.name}
//                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
//                />
//                {item.availability === 'Out of Stock' && (
//                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
//                    Out of Stock
//                  </span>
//                )}
//              </div>

//              {/* Product Details */}
//              <div className="p-4 flex flex-col justify-between ">
//                <h2 className="text-lg font-semibold text-gray-700">{item.name}</h2>
//                <p className="text-gray-600 mt-1 mb-2">{item.price}</p>
//                <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                
//                {/* Rating */}
//                <div className="flex items-center mb-2">
//                  {[...Array(5)].map((_, i) => (
//                    <FaStar
//                      key={i}
//                      className={`text-yellow-400 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
//                    />
//                  ))}
//                  <span className="text-gray-500 text-sm ml-2">({item.rating})</span>
//                </div>

//                {/* Action Buttons */}
//                <div className="flex items-center gap-3 mt-2">
//                  <button
//                    className="flex-1 bg-blue-500 text-nowrap text-white px-2 py-2 rounded-md hover:bg-blue-600 transition-colors"
//                    disabled={item.availability !== 'In Stock'}
//                  >
//                    <FaCartPlus className="inline mr-2" /> Add to Cart
//                  </button>
//                  <button className="bg-red-500 text-white text-nowrap px-2 py-2 rounded-md hover:bg-red-600 transition-colors ">
//                    <FaTrashAlt className="inline mr-2" /> Remove
//                  </button>
//                </div>
//              </div>
//            </div>
//          ))}
//        </div>

//        {/* No Items Message */}
//        {wishlistItems.length === 0 && (
//          <p className="text-center text-gray-600 mt-8">Your wishlist is currently empty.</p>
//        )}
//      </div>
//    </div>
//  );
//};

//export default Wishlist;


import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../components/common';
import {Link, useNavigate} from 'react-router-dom';
import {clearWishlist, fetchtoWishlist, handleRemovetoWishlist} from '../../redux/slice/wishlistSlice';
import {ProductCardSkeleton} from '../../components/common/skeleton';

const WishList = () => {
  //const wishlistItems = useSelector(state => state.wishList.items);
  const {isLoading, items, error} = useSelector((state)=> state.wishList);
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const [confirmAllDelete, setConfirmAllDelete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    //!isAuthenticated && navigate('/signin')
    isAuthenticated && dispatch(fetchtoWishlist());
   }, [dispatch, navigate, isAuthenticated]);

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
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
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
                      //removeFromCart(item.id);
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

