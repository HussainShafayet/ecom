import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/productService';
import { FaStar, FaChevronDown, FaShareAlt } from 'react-icons/fa';
import { InputField } from '../components/common/'; // Star and dropdown icons
import { useCart } from '../context/CartContext';  // Import the useCart hook

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open/close state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null); // Filter reviews by rating

   // Import addToCart function from CartContext
   const { addToCart } = useCart(); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        console.log('product', data);
        
        setProduct(data);
        setMainImage(data.images[0]);
        setLoading(false);

        const relatedData = await getProductsByCategory(data.category);
        setRelatedProducts(relatedData.products.slice(0, 8));
      } catch (error) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility on click
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

  const handleMouseEnter = () => {
    setDropdownOpen(true); // Show dropdown on hover
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false); // Hide dropdown when mouse leaves
  };
  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * (discountPercentage / 100));
    }
    return price;
  };

  if (loading) {
    return <div className="text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found</div>;
  }

  const colors = ['Red', 'Blue', 'Green', 'Black', 'White'];

  const ratingBreakdown = {
    5: 80,
    4: 11,
    3: 4,
    2: 2,
    1: 3,
  };

  const filteredReviews = filterReviews(product.reviews || []); // Filter reviews based on selected rating

    // Assume discountPercentage is a property of the product (e.g., product.discountPercentage)
    const discountPercentage = product.discountPercentage || 0;
    const discountedPrice = calculateDiscountedPrice(product.price, discountPercentage);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);  // Add product to cart with selected quantity and color
    alert(`Added ${quantity} of ${product.title} in ${selectedColor} to cart`);
  };

  return (
    <div className="container my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col space-y-2">
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
          <div className="relative group w-full">
            <img
              src={mainImage || 'fallback-image-url.jpg'}
              alt={product.title}
              className="w-full h-96 object-contain object-center rounded-lg shadow-lg mb-4 cursor-zoom-in"
            />
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {/* Product Price */}
          {discountPercentage > 0 ? (
            <div className="mb-4">
              <p className=" text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-2x text-green-600 font-semibold">
                ${discountedPrice.toFixed(2)} <span className="text-red-500">({discountPercentage}% OFF)</span>
              </p>
            </div>
          ) : (
            <p className="text-2xl text-green-600 font-semibold mb-4">
              ${product.price.toFixed(2)}
            </p>
          )}

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Choose Color:</h2>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    selectedColor === color
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
            </div>
            {selectedColor && <p className="mt-2 text-gray-700">Selected Color: {selectedColor}</p>}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mb-4">
            <label className="mr-4 text-gray-700">Quantity:</label>
            <div className="border flex rounded">
              <button onClick={decrementQuantity} className="p-2 bg-gray-200 hover:bg-gray-300">
                -
              </button>
              <InputField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="-gray-300 w-12 text-center"
                min="1"
              />
              <button onClick={incrementQuantity} className="p-2 bg-gray-200 hover:bg-gray-300">
                +
              </button>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Ratings Dropdown Button */}
          <div
            className="relative mb-4"
          >
            <button
              className="flex items-center p-2 rounded-lg "
              onClick={toggleDropdown}
              onMouseEnter={handleMouseEnter}
             
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
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-20" onMouseLeave={handleMouseLeave}>
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
                <Link to="/reviews" className="block text-center text-blue-500 hover:text-blue-700 font-semibold mt-4 transition">
                  See customer reviews &gt;
                </Link>
              </div>
            )}
          </div>

          <button
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-4"
            onClick={handleAddToCart}  // Add to cart functionality
          >
            Add to Cart
          </button>

          <Link
            to="/products"
            className="text-blue-500 hover:text-blue-600 font-bold"
          >
            Back to Products
          </Link>

          {/* Share Buttons */}
          <div className="flex items-center mt-4">
            <span className="mr-2 text-gray-700">Share:</span>
            <button className="text-blue-500 hover:text-blue-600">
              <FaShareAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="border rounded-lg p-4">
              <Link to={`/product/${relatedProduct.id}`}>
                <img src={relatedProduct.images[0]} alt={relatedProduct.title} className="w-full h-40 object-cover mb-2" />
                <h3 className="font-semibold">{relatedProduct.title}</h3>
                <p className="text-gray-700">${relatedProduct.price.toFixed(2)}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
