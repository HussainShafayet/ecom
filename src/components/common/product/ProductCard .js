import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../../../redux/slice/cartSlice';
import { FaHeart, FaEye, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import {addToWishlist, removeFromWishlist} from '../../../redux/slice/wishlistSlice';
import {addToCartAndRemoveFromWishlist} from '../../../redux/slice/cartSlice';
import blurImage from '../../../assets/images/blur.jpg';

const ProductCard = ({ product, cardForTrending }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

  const handleAddToCart = () => {
    const extProd = { ...product, quantity: 1 };
    //dispatch(addToCart(extProd));
    dispatch(addToCartAndRemoveFromWishlist(extProd));
  };

  const handleBuyNow = () => {
    const extProd = { ...product, quantity: 1 };
    dispatch(addToCart(extProd));
    navigate('/checkout');
  };

  const wishlist = useSelector(state => state.wishList.items);
  
  // Check if the product is already in the wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };


  return (
    <div className="border rounded-lg shadow-md bg-white hover:shadow-lg transition duration-200 relative p-3">
      
      {/* Out of Stock Overlay */}
      {product.stock && product.stock < 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center text-lg font-bold z-10">
          Out of Stock
        </div>
      )}
      
      {/* Discount Badge */}
      {product.has_discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
          {product.discount_value}{product.discount_type == 'percentage'?'%':'৳'} OFF
        </span>
      )}
      {cardForTrending && 
        <>
          {/* Badge */}
          <div className="absolute top-7 left-1 bg-red-500 text-white px-1 py-1 rounded-full text-xs font-semibold uppercase">
            {product.isHot ? "Hot Picks" : "Trending"}
          </div>
        </>
      }
      

      {/* Wishlist Icon */}
      <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          {isInWishlist ? <FaHeart className="w-5 h-5" title='Remove from Wishlist' /> : <FaRegHeart className="w-5 h-5" title='Add to Wishlist' />}
        </button>

      {/* Product Image */}
      <Link to={`/products/detail/${product.slug}`} className="block h-36">
        {/* Main Product Image */}
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className={`w-full h-full object-contain rounded-md mb-2 transition-opacity duration-500 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)} // Set image loaded state
        />

        {/* Blurred Placeholder */}
        {!isImageLoaded && (
          <img
            src={blurImage}
            alt="Loading"
            className="absolute inset-0 w-full h-36 rounded-md mb-2 animate-pulse object-cover"
          />
        )}
      </Link>


      <div className="p-2">
        {/* Product Title */}
        <h3 className="text-md font-semibold mb-1">
          <Link to={`/products/detail/${product.slug}`} className="hover:text-blue-500">
            {product.name}
          </Link>
        </h3>

        {/* Product Brand */}
        <p className="text-xs text-gray-500 mb-2">
          <span className="font-semibold">{product.brand_name}</span>
        </p>

        {/* View Count and Order Count */}
        <div className="flex items-center text-xs text-gray-600 mb-2 space-x-4">
          <div className="flex items-center">
            <FaEye className="mr-1 text-gray-500" /> {product.total_views} views
          </div>
          <div className="flex items-center">
            <FaShoppingCart className="mr-1 text-gray-500" /> {product.total_orders} orders
          </div>
        </div>

         {/* Product Price */}
         {product.has_discount ? (
              <div className="mb-2 flex flex-row space-x-1">
                <p className="text-3x text-green-600 font-semibold">
                  {product.discount_price}
                </p>
                <p className="text-gray-500 line-through">
                  {product.base_price}
                </p>
              </div>
            ) : (
              <p className="text-2xl text-green-600 font-semibold mb-2">
                {product.base_price}
              </p>
            )}

        {/* Product Rating */}
        <div className="flex items-center mb-2">
          {Array(Math.ceil(product.avg_rating))
            .fill(0)
            .map((_, i) => (
              <svg
                key={i}
                className="h-4 w-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21 16.54 14.24 22 9.27 14.81 8.63 12 2 9.19 8.63 2 9.27 7.46 14.24 5.82 21z" />
              </svg>
            ))}
          <span className="ml-2 text-xs text-gray-600">({product.avg_rating.toFixed(1)})</span>
          <span className="ml-2 text-xs text-gray-600">{product.total_reviews} reviews</span>
        </div>

        {/* Button Group */}
        <div className="flex space-x-2 mt-2">
          <button
            onClick={handleAddToCart}
            className="flex-grow bg-blue-500 text-white font-bold py-1 rounded hover:bg-blue-600 transition-colors text-xs"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-grow bg-green-500 text-white font-bold py-1 rounded hover:bg-green-600 transition-colors text-xs"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
