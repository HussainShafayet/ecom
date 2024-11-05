import React from 'react';
import {useDispatch} from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {addToCart} from '../../redux/slice/cartSlice';

const ProductCard = ({ product }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleAddToCart = () => {
    const extProd = {...product}
    extProd.quantity = 1;
    dispatch(addToCart(extProd));
  };

  const handleBuyNow = () => {
    const extProd = {...product}
    extProd.quantity = 1
    // Dispatch addToCart with the product details and quantity
    dispatch(addToCart(extProd));

    // Redirect to the checkout page
    navigate('/checkout');
  };
    return (
      <div className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300 relative">
        {product.discountPercentage && (
          <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </span>
        )}
        <Link to={`/products/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        </Link>
  
        <div className="p-4">
          <h3 className="text-lg font-semibold">
            <Link to={`/products/${product.id}`} className="hover:text-blue-500">
              {product.title}
            </Link>
          </h3>
          <p className="text-gray-600 mt-2">{product.price.toFixed(2)}</p>
  
          {/* Product Rating */}
          <div className="flex mt-2">
            {Array(Math.ceil(product.rating)).fill(0).map((_, i) => (
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
  
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
};
  

export default ProductCard;
