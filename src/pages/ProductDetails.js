import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';  // Fetch product details from the API

const ProductDetails = () => {
  const { id } = useParams();  // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);  // Fetch product details by ID
        setProduct(data);
        setLoading(false);
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

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Product Information */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {/* Product Price */}
          <p className="text-2xl text-green-600 font-semibold mb-4">
            ${product.price.toFixed(2)}
          </p>

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
            <span className="ml-2 text-gray-600">
              {product.rating} / 5
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-4"
            onClick={() => console.log(`Added ${product.title} to cart`)}
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
