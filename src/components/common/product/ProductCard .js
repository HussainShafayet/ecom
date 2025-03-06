import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, handleAddtoCart, handleClonedProduct } from '../../../redux/slice/cartSlice';
import { FaHeart, FaEye, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import {addToWishlist, handleAddtoWishlist, handleRemovetoWishlist, removeFromWishlist} from '../../../redux/slice/wishlistSlice';
import {addToCartAndRemoveFromWishlist} from '../../../redux/slice/cartSlice';
import blurImage from '../../../assets/images/blur.jpg';

const ProductCard = ({ product, cardForTrending }) => {
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const {cartLoading, cartError, cartAddedSuccessfull} = useSelector((state)=> state.cart);
  const addcartError = useSelector((state) => state.globalError.sectionErrors["add-cart"]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

  const handleAddToCart = () => {
     if (isAuthenticated) {
      const cartBody = {};
      cartBody.product_id = product.id;
      cartBody.quantity = 1;
      cartBody.variant_id = product.variant_id;
      cartBody.action = 'increase';
      dispatch(handleAddtoCart(cartBody));
    }else{
      const clonedProduct = dispatch(handleClonedProduct(product, null, null, 1));
      
      dispatch(addToCart(clonedProduct));
    }
  };

  const handleBuyNow = () => {
    if (product.has_variants) {
      navigate(`/products/detail/${product.slug}`);
    } else {
      if (isAuthenticated) {
        const cartBody = {};
        cartBody.product_id = product.id;
        cartBody.quantity = 1;
        cartBody.variant_id = product.variant_id;
        cartBody.action = 'increase';
        dispatch(handleAddtoCart(cartBody));
        cartAddedSuccessfull && navigate('/checkout');
      }else{
        const clonedProduct = dispatch(handleClonedProduct(product, null, null, 1));
        dispatch(addToCart(clonedProduct));
        navigate(`/checkout`);
      }

      
    }
    
  };

  const wishlist = useSelector(state => state.wishList.items);
  const favouriteIds = useSelector(state => state.wishList.favouriteIds);
  
  // Check if the product is already in the wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(handleAddtoWishlist({product_id: product.id}));
      //dispatch(addToWishlist(product));
    }
  };

  const handleAddToWishlist = () =>{
    if (isAuthenticated) {
       dispatch(handleAddtoWishlist({product_id: product.id}));
    } else {
      dispatch(addToWishlist(product));
    }
   
  }
  const handleRemoveToWishlist = () =>{
    if (isAuthenticated) {
      dispatch(handleRemovetoWishlist({product_id: product.id}));
    }
    
    dispatch(removeFromWishlist(product.id));
  }

  const checkFavourite = (favId) => {
    return favouriteIds && favouriteIds[favId];
  }

  const DiscountBadge = ({ discountValue, discountType }) => (
    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
      {discountValue}{discountType === 'percentage' ? '%' : '৳'} OFF
    </span>
  );

  const TrendingBadge = ({ isHot }) => (
    <div className="absolute top-7 left-1 bg-red-500 text-white px-1 py-1 rounded-full text-xs font-semibold uppercase">
      {isHot ? "Hot Picks" : "Trending"}
    </div>
  );
  
  const WishlistButton = ({ isFavourite, handleAddToWishlist, handleRemoveToWishlist }) => (
    <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 z-10">
      {isFavourite ? (
        <FaHeart className="w-5 h-5" title="Remove from Wishlist" onClick={handleRemoveToWishlist} />
      ) : (
        <FaRegHeart className="w-5 h-5" title="Add to Wishlist" onClick={handleAddToWishlist} />
      )}
    </button>
  );
  const ProductImage = ({ product, isImageLoaded, setIsImageLoaded }) => (
    <div  className="relative">
      <img
        src={product.image}
        alt={product.title}
        loading="lazy"
        className={`w-full h-32 sm:h-36 object-contain rounded-md  transition-opacity duration-500 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsImageLoaded(true)}
      />
      {!isImageLoaded && (
        <div className="absolute inset-0 w-full h-32 sm:h-36 bg-gray-300 animate-pulse rounded-md " />
      )}
    </div>
  );
  const ProductTitle = ({ name, slug }) => (
    <h3 className="text-sm sm:text-lg font-semibold truncate" title={name}>
      <span className="hover:text-blue-500 transition-colors duration-200">
        {name}
      </span>
    </h3>


  );
  const ProductStats = ({ views, orders }) => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 text-xs text-gray-600">
      {/* Views and Orders stack on small screens, inline on large screens */}
      <span className="flex items-center mb-1 lg:mb-0">
        <FaEye className="mr-1 text-gray-500" /> {views} views
      </span>
      <span className="flex items-center">
        <FaShoppingCart className="mr-1 text-gray-500" /> {orders} orders
      </span>
    </div>
  );
  
  const ProductPrice = ({ hasDiscount, discountPrice, basePrice }) => (
    hasDiscount ? (
      <div className="flex items-end flex-row space-x-2">
        <p className="text-lg sm:text-xl text-green-600 font-semibold truncate">{discountPrice}</p>
        <p className="text-xs text-gray-500 line-through mb-[0.1rem] truncate">{basePrice}</p>
      </div>
    ) : (
      <p className="text-lg sm:text-xl text-green-600 font-semibold truncate">{basePrice}</p>
    )
  );
  
  const ProductRating = ({ rating, reviews }) => (
    <div className="flex items-center flex-wrap text-xs sm:text-sm">
      {Array(Math.ceil(rating)).fill(0).map((_, i) => (
        <svg key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21 16.54 14.24 22 9.27 14.81 8.63 12 2 9.19 8.63 2 9.27 7.46 14.24 5.82 21z" />
        </svg>
      ))}
      <span className="ml-1 sm:ml-2 text-gray-600 truncate">({rating.toFixed(1)})</span>
      <span className="ml-1 sm:ml-2 text-gray-600 truncate">{reviews} reviews</span>
    </div>
  );
  
  const ActionButtons = ({ hasVariants, handleAddToCart, handleBuyNow }) => (
    <div className="flex space-x-2">
      {!hasVariants && (
        <button onClick={handleAddToCart} className="flex-grow bg-blue-500 text-white font-bold py-1 rounded hover:bg-blue-600 transition-colors text-xs disabled:cursor-not-allowed"
        disabled={cartLoading}
        >
          {cartLoading ? 'Loading...' : 'Add to Cart'}
        </button>
      )}
      <button onClick={handleBuyNow} className="flex-grow bg-green-500 text-white font-bold py-1 rounded hover:bg-green-600 transition-colors text-xs disabled:cursor-not-allowed" disabled={cartLoading} >
        
        {cartLoading ? 'Loading...' : 'Buy Now'}
      </button>
    </div>
  );
  
  const OutOfStock = () => (
    <div className="text-center">
      <span className="font-bold text-red-500">Out of Stock</span>
    </div>
  );
  

  return (
    <div className="border rounded-lg shadow-md bg-white hover:shadow-lg transition duration-200 relative p-2 min-h-[230px] sm:min-h-[300px] flex flex-col">
    {/* Wishlist Button - Separate from <Link> */}
      <WishlistButton 
        isFavourite={checkFavourite(product.id)} 
        handleAddToWishlist={handleAddToWishlist} 
        handleRemoveToWishlist={handleRemoveToWishlist} 
      />

      {/* Clickable Card Content */}
      <Link to={`/products/detail/${product.slug}`} className="flex-1">
        {/* Discount Badge */}
        {product.has_discount && (
          <DiscountBadge 
            discountValue={product.discount_value} 
            discountType={product.discount_type} 
          />
        )}

        {/* Trending Badge */}
        {cardForTrending && <TrendingBadge isHot={product.isHot} />}

        {/* Product Image */}
        <ProductImage 
          product={product} 
          isImageLoaded={isImageLoaded} 
          setIsImageLoaded={setIsImageLoaded} 
        />

        <div>
          <ProductTitle name={product.name} slug={product.slug} />
          <p className="text-xs text-gray-500 mb-1">
            <span className="line-clamp-2 font-semibold">{product.brand_name}</span>
          </p>

          <ProductStats views={product.total_views} orders={product.total_orders} />

          <ProductPrice 
            hasDiscount={product.has_discount} 
            discountPrice={product.discount_price} 
            basePrice={product.base_price} 
          />

          {product.avg_rating > 0 && 
            <ProductRating rating={product.avg_rating} reviews={product.total_reviews} />
          }
        </div>
      </Link>

      {/* Stock & Action Buttons */}
      <div className="mt-1">
        {product.availability_status ? (
          <ActionButtons 
            hasVariants={product.has_variants} 
            handleAddToCart={handleAddToCart} 
            handleBuyNow={handleBuyNow} 
          />
        ) : (
          <OutOfStock />
        )}
      </div>
    </div>

  );
};

export default ProductCard;
