import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaChevronDown, FaShareAlt, FaTag, FaBox, FaWeightHanging, FaRulerCombined, FaCubes, FaTools } from 'react-icons/fa';
import { InputField, Loader, ProductCard, RatingAndReview } from '../components/common/'; // Star and dropdown icons
import {useDispatch, useSelector} from 'react-redux';
import {setMainImage, incrementQuantity, decrementQuantity, fetchProductById,fetchAllProducts} from '../redux/slice/productSlice';
//import {addToCart} from '../redux/slice/cartSlice';
import {addToCart, addToCartAndRemoveFromWishlist} from '../redux/slice/cartSlice';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const ProductDetails = () => {
  const { id } = useParams();
  const {isLoading, product, error, mainImage, items:products, quantity, relatedProductsLoading} = useSelector((state)=> state.product);

  const [selectedColor, setSelectedColor] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open/close state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null); // Filter reviews by rating
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const reviewsRef = useRef(null);

  //dispatch
  const dispatch = useDispatch();
  //navigate
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.category) {
      dispatch(fetchAllProducts({category: product.category, limit:30}))
    }
  }, [dispatch, product]);

   // Detect clicks outside the dropdown
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);


  if (isLoading) {
    return <div><Loader message='Loading product details' /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!isLoading && !product) {
    return <div className="text-center text-gray-600">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p>The product you are looking for does not exist or may have been removed.</p>
            <Link
              to="/products"
              className="mt-4 inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Back to Products
            </Link>
      </div>;
  }



  const handleImageClick = (image) => {
    dispatch(setMainImage(image));
  };

  const handleIncrementQuantity = () => {
    dispatch(incrementQuantity())
  };

  const handleDecrementQuantity = () => {
    dispatch(decrementQuantity())
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);; // Toggle dropdown visibility on click
  };

  const handleRatingClick = (rating) => {
    setSelectedRatingFilter(rating); // Set the filter for selected rating
    setDropdownOpen(false); // Close dropdown after selecting
  };

  const filterReviews = (reviews) => {
    if (!selectedRatingFilter) {
      return reviews; // Show all reviews if no filter is selected
    }
    return reviews.filter(review => review.rating === selectedRatingFilter); // Filter by selected rating
  };

  const handleAddToCart = () => {
    const extProd = {...product}
    extProd.quantity = quantity;
    extProd.selectedColor = selectedColor;
    //dispatch(addToCart(extProd));
    dispatch(addToCartAndRemoveFromWishlist(extProd))
  };

  const handleBuyNow = () => {
    const extProd = { ...product, quantity: 1 };
    dispatch(addToCart(extProd));
    navigate('/checkout');
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
  const discountPercentage = product.discountPercentage || 0;
  const discountedPrice = calculateDiscountedPrice(product.price, discountPercentage);

  

  return (
    <div className="container mx-auto  my-6">
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Image Gallery */}
          <div className="flex gap-2">
            <div className="flex flex-col space-y-1 h-full overflow-auto custom-scrollbar-custom">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer p-1 border-2 border-gray-300 hover:border-blue-500 transition"
                  onClick={() => handleImageClick(image)}
                />
              ))}
            </div>
            <div className="relative group w-full h-full">
              <Zoom>
                <img
                  src={mainImage}
                  alt={product.title}
                  loading='lazy'
                  className={`w-full h-96 object-contain object-center rounded-md mb-4 transition-opacity duration-500 shadow-md ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)} // Set image loaded state
                />

                {/* Blurred Placeholder */}
                {!isImageLoaded && (
                  <img
                    src={product.thumbnail}
                    alt="Loading"
                    className="absolute inset-0 w-full h-96 bg-gray-200 rounded-md mb-4 animate-pulse object-contain shadow-md"
                  />
                )}
              </Zoom>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h1 className="text-3xl font-bold mb-1">{product.title}</h1>

            {/* Product Price */}
            {discountPercentage > 0 ? (
              <div className="mb-1 flex flex-row space-x-1">
                <p className=" text-gray-500 line-through">
                  {product.price.toFixed(2)}
                </p>
                <p className="text-2x text-green-600 font-semibold">
                  {discountedPrice.toFixed(2)} <span className="text-red-500">({discountPercentage}% OFF)</span>
                </p>
              </div>
            ) : (
              <p className="text-2xl text-green-600 font-semibold mb-1">
                {product.price.toFixed(2)}
              </p>
            )}

          {/* Color Selector */}
          <div className="flex items-center space-x-2 my-2">
              <span className="font-semibold">Color:</span>
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-colors border ${
                      selectedColor === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>

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

            <p className="text-gray-700 mb-2">{product.description}</p>

            {/* Ratings Dropdown Button */}
            <div
              className="relative mb-4"
            >
              <button
                ref={buttonRef}
                className="flex items-center p-2 rounded-lg "
                onClick={toggleDropdown}
              
              >
                <div className="flex">
                {Array(Math.ceil(product.rating))
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
                <span className="font-bold">{product.rating.toFixed(1)} / 5</span>
                <FaChevronDown className="ml-2" />
              </button>

              {/* Enhanced Dropdown menu */}
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-300 shadow-md rounded-lg p-4 z-20">
                  <div className="flex items-center mb-2">
                  <div className="flex">
                    {Array(Math.ceil(product.rating))
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
                    <span className="font-bold text-lg">{product.rating.toFixed(1)} out of 5</span>
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
          <div className="flex space-x-2">
            <button
              onClick={handleBuyNow}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add to Cart
            </button>
            <Link
              to="/products"
              className="text-blue-500 hover:text-blue-600 font-bold mt-2"
            >
              Back to Products
            </Link>
          </div>

            

            {/* Share Buttons */}
            <div className="flex items-center mt-4">
              <span className="mr-2 text-gray-700">Share:</span>
              <button className="text-blue-500 hover:text-blue-600">
                <FaShareAlt />
              </button>
            </div>
          </div>
        


          {/* Product Details Information Section */}
        
          <section className="mt-4">
            <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h3>
              <ul className="text-sm text-gray-700 space-y-3 ml-3">
                <li className="flex items-center">
                  <FaTag className="text-blue-500 mr-2" />
                  <span className="font-semibold mr-1">Brand:</span> {product.brand}
                </li>
                <li className="flex items-center">
                  <FaBox className="text-green-500 mr-2" />
                  <span className="font-semibold mr-1">Model:</span> {product.model || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaWeightHanging className="text-red-500 mr-2" />
                  <span className="font-semibold mr-1">Weight:</span> {product.weight || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaRulerCombined className="text-purple-500 mr-2" />
                  <span className="font-semibold mr-1">Dimensions:</span> 
                  {product.dimensions
                    ? `${product.dimensions.width || 'N/A'} x ${product.dimensions.height || 'N/A'} x ${product.dimensions.depth || 'N/A'} cm`
                    : 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaCubes className="text-yellow-500 mr-2" />
                  <span className="font-semibold mr-1">Materials:</span> {product.material || 'N/A'}
                </li>
                <li className="flex items-center">
                  <FaTools className="text-gray-500 mr-2" />
                  <span className="font-semibold mr-1">Other Features:</span> {product.features || 'N/A'}
                </li>
              </ul>
            </div>
          </section>
        </div>


        {/* Review and Rating Section */}
        <section className='mt-4' ref={reviewsRef}>
          <RatingAndReview reviews={product.reviews} product={product} />
        </section>
      </>
      {/* Related Products Section */}
      <div className="mx-auto my-12">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        {relatedProductsLoading ? <div>
          <Loader message='Releted Products Loading' />
        </div>:

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        }
      </div>
    </div>
  );
};

export default ProductDetails;
