import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaChevronDown, FaShareAlt, FaTag, FaBox, FaWeightHanging, FaRulerCombined, FaCubes, FaTools, FaCopy, FaTwitter, FaWhatsapp, FaFacebookF, FaFacebook } from 'react-icons/fa';
import { ErrorDisplay, InputField, Loader, ProductCard, RatingAndReview, RichTextToHTML } from '../components/common/'; // Star and dropdown icons
import {useDispatch, useSelector} from 'react-redux';
import {setMainImage, incrementQuantity, decrementQuantity, fetchProductById,fetchAllProducts, setSelectedColor, setSelectedSize} from '../redux/slice/productSlice';
//import {addToCart} from '../redux/slice/cartSlice';
import {addToCart, addToCartAndRemoveFromWishlist, handleAddtoCart, handleClonedProduct} from '../redux/slice/cartSlice';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import {ProductDetailsSkeleton} from '../components/common/skeleton';
import defaultImage from '../assets/images/default_product_image.jpg';

const ProductDetails = () => {
  const { slug } = useParams();
  const {isLoading, product, error, mainImage, items:products, quantity, relatedProductsLoading, selectedColor, selectedSize} = useSelector((state)=> state.product);
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const {cartLoading, cartError, cartAddedSuccessfull} = useSelector((state)=> state.cart);
  const addcartError = useSelector((state) => state.globalError.sectionErrors["add-cart"]);

  
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null); // Filter reviews by rating
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);

  const ratingDropdownRef = useRef(null);
  const shareDropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const reviewsRef = useRef(null);

  //dispatch
  const dispatch = useDispatch();
  //navigate
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProductById(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?.category) {
      dispatch(fetchAllProducts({category: product?.category, limit:30}))
    }
  }, [dispatch, product]);
// Handle clicks outside each dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      ratingDropdownRef.current &&
      !ratingDropdownRef.current.contains(event.target)
    ) {
      setIsRatingDropdownOpen(false);
    }
    if (
      shareDropdownRef.current &&
      !shareDropdownRef.current.contains(event.target)
    ) {
      setIsShareDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);



  const handleImageClick = (image) => {
    dispatch(setMainImage(image));
  };

  const handleIncrementQuantity = () => {
    dispatch(incrementQuantity())
  };

  const handleDecrementQuantity = () => {
    dispatch(decrementQuantity())
  };

    // Toggle rating dropdown
    const toggleRatingDropdown = () => {
      setIsRatingDropdownOpen((prev) => !prev);
      setIsShareDropdownOpen(false); // Close share dropdown if open
    };
  
    // Toggle share dropdown
    const toggleShareDropdown = () => {
      setIsShareDropdownOpen((prev) => !prev);
      setIsRatingDropdownOpen(false); // Close rating dropdown if open
    };

  const handleRatingClick = (rating) => {
    setSelectedRatingFilter(rating); // Set the filter for selected rating
    setIsRatingDropdownOpen(false); // Close dropdown after selecting
  };

  const filterReviews = (reviews) => {
    if (!selectedRatingFilter) {
      return reviews; // Show all reviews if no filter is selected
    }
    return reviews?.filter(review => review?.rating === selectedRatingFilter); // Filter by selected rating
  };

  const handleAddToCart = async () => {
    try {
      let clonedProduct;
  
      if (isAuthenticated) {
        const cartBody = {
          product_id: product?.id,
          quantity,
          variant_id: selectedSize?.variant_id || selectedColor?.variant_id,
          action: 'increase'
        };
  
        const response = await dispatch(handleAddtoCart(cartBody)).unwrap();
        
        if (response.success) {
          clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
        }
      } else {
        clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
      }
  
      if (clonedProduct) {
        dispatch(addToCart(clonedProduct));
      }
    } catch (error) {
      console.log('handle add to cart error: ', error);
    }
  };

  const handleBuyNow = async () => {

    try {
      if (product.has_variants) {
        navigate(`/products/detail/${product?.slug}`);
      } else {
        let clonedProduct;
        if (isAuthenticated) {
          const cartBody = {
            product_id: product?.id,
            quantity,
            variant_id: selectedSize?.variant_id || selectedColor?.variant_id,
            action: 'increase'
          };
          const response = await dispatch(handleAddtoCart(cartBody)).unwrap();
          if (response.success) {
            clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
          }
          
        }else{
          clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
        }

        if (clonedProduct) {
          dispatch(addToCart(clonedProduct));
          navigate('/checkout');
        }
        
      }
      } catch (error) {
      console.log('handle buy now error: ', error);
    }
   
  };

  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * (discountPercentage / 100));
    }
    return price;
  };

  const handleSeeCustomerReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start'});
      //const offset = -600; // Adjust this value to your header height
      //window.scrollBy({ top: offset, behavior: 'smooth' });
      setIsRatingDropdownOpen(false); // Close dropdown after selecting
    }
  };

  const handleSelectColor = (color) =>{
    dispatch(setSelectedColor(color))
    dispatch(setMainImage(color?.media_files[0]));
    dispatch(setSelectedSize(color?.sizes[0]))
    
    
  }

  const handleSelectSize = (variant) =>{
    dispatch(setSelectedSize(variant));
  }

 
  const shareProduct = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.title,
          text: `Check out this product: ${product?.title}`,
          url: window.location.href,
        })
        .then(() => console.log("Product shared successfully!"))
        .catch((error) => console.error("Error sharing product:", error));
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  }

  const copyLinkToClipboard = () => {
    const link = window.location.href;
  
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Use Clipboard API if supported
      navigator.clipboard
        .writeText(link)
        .then(() => alert('Product link copied to clipboard!'))
        .catch((error) => console.error('Error copying link:', error));
    } else {
      // Fallback for unsupported browsers
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom of page
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
  
      try {
        document.execCommand('copy');
        alert('Product link copied to clipboard!');
      } catch (error) {
        console.error('Fallback: Error copying link', error);
        alert('Failed to copy link. Please copy manually.');
      }
  
      document.body.removeChild(textarea);
    }
  };
  


  const colors = ['Red', 'Blue', 'Green', 'Black', 'White'];

  const ratingBreakdown = {
    5: 80,
    4: 11,
    3: 4,
    2: 2,
    1: 3,
  };

  // Assume discountPercentage is a property of the product (e.g., product.discountPercentage)
  const discountPercentage = product && product?.discountPercentage || 0;
  const discountedPrice = product && calculateDiscountedPrice(product?.price, discountPercentage) || 0;

  

  return (
    <>
     {isLoading ? <ProductDetailsSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :
    <div className="container mx-auto  my-6">
    {Array.isArray(cartError) ? 
      <ErrorDisplay errors={cartError} /> :
        <>
          {addcartError && <div className="text-center text-red-500 font-semibold py-4">
          {addcartError}.
        </div>}
        </>
      }
      {product &&
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Image Gallery */}
          <div className="flex gap-2">
            <div className="flex flex-col space-y-1 h-full overflow-auto custom-scrollbar-custom">
              {(selectedColor?selectedColor:product)?.media_files?.map((image, index) => (
                <div key={image?.file_url}>
                  {image?.file_type === 'image'? 
                    <img
                      src={image?.thumbnail_url}
                      alt={`Product Image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer p-1 border-2 border-gray-300 hover:border-blue-500 transition"
                      onClick={() => handleImageClick(image)}
                    />
                    : 
                    <video
                      src={image?.file_url}
                      className="w-20 h-20 object-cover rounded-sm"
                      onClick={() => handleImageClick(image)}
                    />
                  }
                </div>
              ))}
            </div>
            <div className="relative group w-full h-full">
            {mainImage?.file_type === 'image'? 
              <Zoom>
                <img
                  src={mainImage?.file_url}
                  alt={product?.name}
                  loading='lazy'
                  className={`w-full h-96 object-contain object-center rounded-md mb-4 transition-opacity duration-500 shadow-md ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)} // Set image loaded state
                />

                {/* Blurred Placeholder */}
                {!isImageLoaded && (
                  <img
                    src={product?.thumbnail}
                    alt="Loading"
                    className="absolute inset-0 w-full h-96 bg-gray-200 rounded-md mb-4 animate-pulse object-contain shadow-md"
                  />
                )}
              </Zoom>
              :
              mainImage?.file_type === 'video' ?
                <video
                  src={mainImage?.file_url}
                  muted
                  controls
                  preload='true'
                  className={`w-full h-96 object-contain object-center rounded-md mb-4 transition-opacity duration-500 shadow-md`}
                />
              :
              <img
                src={defaultImage}
                alt='default image'
                loading="lazy"
                className={`w-full h-96 object-contain object-center rounded-md mb-4 transition-opacity duration-500 shadow-md}`}
              />
              }
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h1 className="text-3xl font-bold mb-1">{product?.name}</h1>

            {/* Product Price */}
            {selectedSize? 
              <>
              {product?.has_discount ? (
                <div className="mb-1 flex flex-row space-x-1">
                  <p className=" text-gray-500 line-through">
                    {selectedSize?.base_price}
                  </p>
                  <p className="text-2x text-green-600 font-semibold">
                  {selectedSize?.discount_price} <span className="text-red-500">({product?.discount_value}{product?.discount_type == 'percentage'?'%':'৳'} OFF)</span>
                  </p>
                </div>
              ) : (
                <p className="text-2xl text-green-600 font-semibold mb-1">
                  {selectedSize?.base_price}
                </p>
              )}
              </>
            :
              <>
                {product?.has_discount ? (
                  <div className="mb-1 flex flex-row space-x-1">
                    <p className=" text-gray-500 line-through">
                      {product?.base_price}
                    </p>
                    <p className="text-2x text-green-600 font-semibold">
                    {product?.discount_price} <span className="text-red-500">({product?.discount_value}{product?.discount_type == 'percentage'?'%':'৳'} OFF)</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl text-green-600 font-semibold mb-1">
                    {product?.base_price}
                  </p>
                )}
              </>
            
            }
           

          {/* Color Selector */}
          {product?.colors?.length > 0 && 

            <>
             <div className="mt-6 mb-3 flex items-center space-x-2">
                <span className="font-semibold">Color:</span>
                <div className="flex items-center gap-3">
                  {product?.colors?.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectColor(color)}
                      className={`w-8 h-8 rounded-full border shadow-md transform transition-transform duration-200 relative ${
                        selectedColor?.name === color?.name
                          ? 'ring-2 ring-blue-500 scale-110 border-blue-500'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color?.hex_code }}
                      title={color?.name}
                    >
                      {/* Tooltip */}
                      <span
                        className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs rounded-lg px-2 py-1 opacity-0 transition-opacity duration-200 text-nowrap ${
                          selectedColor === color ? 'opacity-100' : 'group-hover:opacity-100'
                        }`}
                      >
                        {color?.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          }

          {/* size Selector */}
          {(selectedColor?.sizes?.length > 0) ?  
            <>
              <div className="flex items-center space-x-2 my-2">
                <span className="font-semibold">Size:</span>
                <div className="flex gap-3">
                  {selectedColor?.sizes?.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSize(variant)}
                      className={`px-2 py-1 text-sm font-medium rounded-lg border shadow-sm transition-transform duration-200 hover:scale-105 ${
                        selectedSize?.name === variant?.name
                          ? ' text-blue-500 border-blue-500'
                          : ' text-gray-700 hover:bg-blue-100 border-gray-300'
                      }`}
                      title={`${variant?.name}`}
                    >
                      {variant?.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
            : (product?.sizes?.length > 0) ? 
              <div className="flex items-center space-x-2 my-2">
                <span className="font-semibold">Size:</span>
                <div className="flex gap-3">
                  {product?.sizes?.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSize(variant)}
                      className={`px-2 py-1 text-sm font-medium rounded-lg border shadow-sm transition-transform duration-200 hover:scale-105 ${
                        selectedSize.name === variant?.name
                          ? ' text-blue-500 border-blue-500'
                          : ' text-gray-700 hover:bg-blue-100 border-gray-300'
                      }`}
                      title={`${variant?.name}`}
                    >
                      {variant?.name}
                    </button>
                  ))}
                </div>
              </div>
            : ''
          }

            {/* Quantity Selector */}
            <div className="flex items-center mb-1">
              <label className="mr-3 text-gray-700">Quantity:</label>
              <div className="border flex rounded">
                <button onClick={handleDecrementQuantity} className="p-2 bg-gray-200 hover:bg-gray-300">
                  -
                </button>
                <InputField
                  type="number"
                  value={quantity}
                  onChange={(e) => e.target.value}
                  className="-gray-300 w-12 text-center"
                  min="1"
                />
                <button onClick={handleIncrementQuantity} className="p-2 bg-gray-200 hover:bg-gray-300">
                  +
                </button>
              </div>
            </div>

            {/*<p className="text-gray-700 mb-2">*/}
              <RichTextToHTML content={product.short_description} />
            {/*</p>*/}
            

            {/* Ratings Dropdown Button */}
            <div
              className="relative mb-4 mt-2 flex justify-items-center space-x-3"
              ref={ratingDropdownRef}
            >
              <button
                ref={buttonRef}
                className="flex items-center rounded-lg "
                onClick={toggleRatingDropdown}
              
              >
                <div className="flex">
                {Array(Math.ceil(product.avg_rating))
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21 16.54 14.24 22 9.27 14.81 8.63 12 2 9.19 8.63 2 9.27 7.46 14.24 5.82 21z" />
                    </svg>
                  ))}
              </div>
                <span className="font-bold">{product?.avg_rating} / 5</span>
                <FaChevronDown className="ml-2" />
              </button>
              <div className='space-x-3 font-bold'>
                <span>{product?.total_reviews} reviews</span>
                <span>{product?.total_orders} orders</span>
              </div>
              
              {/* Enhanced Dropdown menu */}
              {isRatingDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-300 shadow-md rounded-lg p-4 z-20">
                  <div className="flex items-center mb-2">
                  <div className="flex">
                    {Array(Math.ceil(product?.avg_rating))
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21 16.54 14.24 22 9.27 14.81 8.63 12 2 9.19 8.63 2 9.27 7.46 14.24 5.82 21z" />
                        </svg>
                      ))}
                  </div>
                    <span className="font-bold text-lg">{product?.avg_rating} out of 5</span>
                  </div>
                  {Object.keys(ratingBreakdown).reverse().map(star => (
                    <div
                      key={star}
                      className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                      onClick={() => handleRatingClick(parseInt(star))} // Filter reviews by rating
                    >
                      <span className="w-12 text-nowrap font-semibold text-gray-800">{star} star</span>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full mx-2">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
                          style={{ width: `${ratingBreakdown[star]}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-700">{ratingBreakdown[star]}%</span>
                    </div>
                  ))}
                  <span className="block text-center text-blue-500 hover:text-blue-700 font-semibold mt-4 transition cursor-pointer" onClick={handleSeeCustomerReviews}>
                    See customer reviews &gt;
                  </span>
                </div>
              )}
            </div>

          
            {/* Button Group */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">

            {(selectedColor && selectedSize?.availability_status) || (selectedSize?.availability_status)? 
              <>
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:cursor-not-allowed"
                disabled={cartLoading}
              >
                {cartLoading ? 'Loading...' : 'Buy Now'}
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors  disabled:cursor-not-allowed`}
                disabled={cartLoading}
              >
                {cartLoading ? 'Loading...' : 'Add to Cart'}
              </button>
              </>
              : (!product.colors && (!product.sizes || product?.sizes?.length == 0) && product.availability_status)?
                <>
                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:cursor-not-allowed"
                  disabled={cartLoading}
                >
                  {cartLoading ? 'Loading...' : 'Buy Now'}
                </button>

                {/* Add to Cart Button */}
                <button
                onClick={handleAddToCart}
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors  disabled:cursor-not-allowed`}
                disabled={cartLoading}
              >
                {cartLoading ? 'Loading...' : 'Add to Cart'}
              </button>
                </>
                : 
                <div className='text-center'>
                  <span className='font-bold text-red-500'>Out of Stock</span>
                </div>
            }
              {/* Back to Products Link */}
              <Link
                to="/products"
                className="text-center bg-gray-200 text-blue-500 hover:text-blue-600 font-bold py-2 px-4 rounded-lg transition"
              >
                Back to Products
              </Link>
            </div>


            

            {/* Share Buttons */}

            <div className="relative mt-4" ref={shareDropdownRef}>
              {/* Dropdown Trigger */}
              <button
                onClick={toggleShareDropdown}
                className="text-blue-500 hover:text-blue-600 transition"
              >
                <FaShareAlt />
                {/*<span>Share</span>*/}
              </button>

              {/* Dropdown Menu */}
              {isShareDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-md z-10">
                  <ul className="py-2">
                    {/* Web Share API */}
                    {/*<li>
                      <button
                        onClick={shareProduct}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition"
                      >
                        <FaShareAlt className="text-blue-500" />
                        Share via App
                      </button>
                    </li>*/}

                    {/* Copy Link */}
                    <li>
                      <button
                        onClick={copyLinkToClipboard}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition"
                      >
                        <FaCopy className="text-gray-500" />
                        Copy Link
                      </button>
                    </li>

                    {/* Social Media Links */}
                    <li>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition"
                      >
                        <FaFacebook className="text-blue-700" />
                        Facebook
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          window.location.href
                        )}&text=${encodeURIComponent(product?.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition"
                      >
                        <FaTwitter className="text-blue-500" />
                        Twitter
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Check out this product: ${product?.title} ${window.location.href}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition"
                      >
                        <FaWhatsapp className="text-green-500" />
                        WhatsApp
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        


          {/* Product Details Information Section */}
        
          <section className="mt-4">
            <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h3>
              <ul className="text-sm text-gray-700 space-y-3 ml-3">
                <li className="flex items-center">
                  <FaTag className="text-blue-500 mr-2" />
                  <span className="font-semibold mr-1">Category:</span> 
                  {product?.categories?.map((category, index) =>(
                    <Link key={index} to={`/products/?category=${category?.slug}`}  className={`text-blue-500 hover:text-blue-600 underline transition-all mr-1`} target='_blank'>
                      {category?.name} 
                    </Link>
                  ))}
                </li>
                <li className="flex items-center">
                  <FaTag className="text-blue-500 mr-2" />
                  <span className="font-semibold mr-1">Brand:</span>
                  <Link to={`/products/?brands=${product?.brand?.name}`}  className={`text-blue-500 hover:text-blue-600 underline transition-all mr-1`} target='_blank'>
                    {product?.brand?.name} 
                  </Link>
                   
                </li>
                <li className="flex items-center">
                  <FaTag className="text-blue-500 mr-2" />
                  <span className="font-semibold mr-1">Tags:</span> 
                  {product?.tags?.map((tag, index) =>(
                    <Link key={index} to={`/products/?tags=${tag?.name}`}  className={`text-blue-500 hover:text-blue-600 underline transition-all mr-1`} target='_blank'>
                      {tag?.name} 
                    </Link>
                  ))}
                </li>
                <li className="flex items-center">
                  <FaBox className="text-green-500 mr-2" />
                  <span className="font-semibold mr-1">Model:</span> {product?.model || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaWeightHanging className="text-red-500 mr-2" />
                  <span className="font-semibold mr-1">Weight:</span> {product?.weight || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaRulerCombined className="text-purple-500 mr-2" />
                  <span className="font-semibold mr-1">Dimensions:</span> 
                  {product?.dimension
                    ? `${product?.dimension?.width || 'N/A'} x ${product?.dimension.height || 'N/A'} x ${product?.dimension?.depth || 'N/A'} cm`
                    : 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaCubes className="text-yellow-500 mr-2" />
                  <span className="font-semibold mr-1">Materials:</span> {product?.material || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaTools className="text-gray-500 mr-2" />
                  <span className="font-semibold mr-1">Other Features:</span> {product?.features || 'N/A'}
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-4">
            <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
              <div className='flex'>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Return & Warranty</h3>
                    <ul className="text-sm text-gray-700 space-y-3 ml-3">
                      <li className="flex items-center">
                        <FaTag className="text-blue-500 mr-2" />
                        <span className="font-semibold mr-1">Warranty:</span> {product?.warranty_information || 'N/A'}
                      </li>
                      <li className="flex items-center">
                        <FaBox className="text-green-500 mr-2" />
                        <span className="font-semibold mr-1">Shipping:</span> {product?.shipping_information || 'N/A'}
                      </li>
                      <li className="flex items-center">
                        <FaWeightHanging className="text-red-500 mr-2" />
                        <span className="font-semibold mr-1">Return Policy:</span> {product?.return_policy || 'N/A'}
                      </li>
                    
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Scan with mobile</h3>
                    <img src={product?.qrcode_image_url} className='w-44 h-44' />
                  </div>
              </div>
              
            </div>
          </section>
          
          <section>
            <RichTextToHTML content={product?.long_description} />
          </section>
        </div>


        {/* Review and Rating Section */}
        <section className='mt-4' ref={reviewsRef}>
          <RatingAndReview product={product} />
        </section>


        {/* Related Products Section */}
      <div className="mx-auto my-12">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        {relatedProductsLoading ? <div>
          <Loader message='Releted Products Loading' />
        </div>:

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((product) => (
            <ProductCard key={product?.id} product={product} />
          ))}
        </div>
        }
      </div>
      </> 
      }
      
    </div>
     }
    </>
  );
};

export default ProductDetails;
