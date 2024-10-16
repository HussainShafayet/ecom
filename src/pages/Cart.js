// src/pages/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext'; // Now this should work
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center">
          <h2 className="text-xl">Your cart is empty</h2>
          <Link to="/products" className="text-blue-500 hover:text-blue-600">Browse Products</Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col">
                <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded mb-4" />
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-700 mb-2">${item.price.toFixed(2)}</p>
                
                {/* Quantity Selector */}
                <div className="flex items-center mb-4">
                  <label className="mr-2">Quantity:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="border rounded-lg p-2 w-16"
                    min="1"
                  />
                </div>

                <button
                  className="bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition-colors mb-4"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Total Price: ${totalPrice.toFixed(2)}</h2>
            <Link
              to="/checkout"
              className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
