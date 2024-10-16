import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/productService'; // Fetch product details and related products from the API
import { FaArrowRight, FaShareAlt } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();  // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // Manage product quantity
  const [relatedProducts, setRelatedProducts] = useState([]); // Manage related products
  const [selectedColor, setSelectedColor] = useState(''); // Manage selected color

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);  // Fetch product details by ID
        
        setProduct(data);
        setLoading(false);

        // Fetch related products based on the current product's category or tags
        const relatedData = await getProductsByCategory(data.category); // Assuming category is a property in the product object
        
        setRelatedProducts(relatedData.products.slice(0,8));
      } catch (error) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found</div>;
  }

  const colors = ['Red', 'Blue', 'Green', 'Black', 'White']; // Define available colors

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div className="flex flex-col">
          <div className="relative group">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-auto object-cover rounded-lg shadow-lg mb-4 cursor-zoom-in"
            />
          </div>
          <div className="flex space-x-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product Image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition"
              />
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {/* Product Price */}
          <p className="text-2xl text-green-600 font-semibold mb-4">
            ${product.price.toFixed(2)}
          </p>

          {/* Choose Color */}
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
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, e.target.value))}
              className="border rounded-lg p-2 w-16"
              min="1"
            />
          </div>

          {/* Product Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Ratings */}
          <div className="flex items-center mb-4">
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
            <span className="ml-2 text-gray-600">{product.rating} / 5</span>
          </div>

          {/* Add to Cart Button */}
          <button
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-4"
            onClick={() => alert(`Added ${quantity} of ${product.title} in ${selectedColor} color to cart`)}
          >
            Add to Cart
          </button>

          {/* Link to More Products */}
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
              <Link to={`/products/${relatedProduct.id}`}>
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
