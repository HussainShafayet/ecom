import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowRight } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = 10.0;
  const taxPercentage = 0.1;
  const tax = totalPrice * taxPercentage;
  const grandTotal = totalPrice + shippingCost + tax;

  return (
    <div className="mx-auto">
      {cartItems.length === 0 ? (
        <div className="text-center">
          <h3 className="text-2xl mb-4">Your cart is empty</h3>
          <Link to="/products" className="text-blue-500 hover:text-blue-600 text-lg">
            Browse Products
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
           
            
            {/* Scrollable Cart Items Section */}
            <div className="lg:col-span-2 max-h-screen overflow-y-auto">
            <div className="mb-2">
              <h1 className="text-2xl mb-2">Shopping Cart</h1>
              <hr className='w-full'></hr>
            </div>
              <div className="flex flex-col gap-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group border rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-row items-center gap-1"
                  >
                    <img
                      src={item.images ? item.images[0] : 'fallback-image-url.jpg'}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-1">{item.title}</h2>

                      <p className="text-green-500 font-bold mb-2 text-lg">${item.price.toFixed(2)}</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center mb-2">
                        <div className="flex border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-l"
                            disabled={item.quantity === 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            className="w-12 text-center border-l border-r"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-r"
                          >
                            +
                          </button>
                        </div>
                        {/* Remove Button */}
                        <FaTrash className="ml-2 hover:bg-red-600 transition-colors"  onClick={() => setConfirmDelete(item.id)} /> 
                      </div>
                     
                    </div>

                    

                    {/* Confirm Delete Overlay */}
                    {confirmDelete === item.id && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center p-4">
                        <h3 className="text-white text-lg mb-4">Remove {item.title}?</h3>
                        <div className="flex space-x-4">
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Yes, Remove
                          </button>
                          <button
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="sticky top-[100px] bg-white shadow-lg rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              {/*<div className="flex flex-col space-y-4 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center">
                    <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded-lg mr-2" />
                    <p className="text-gray-800">{item.title}</p>
                  </div>
                ))}
              </div>*/}
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-4 block bg-blue-500 text-white text-center font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>

          {/* Sticky Checkout Button for Mobile */}
          <div className="fixed bottom-0 left-0 w-full bg-white p-4 lg:hidden shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">Total: ${grandTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Shipping & tax calculated at checkout</p>
              </div>
              <Link
                to="/checkout"
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                Checkout <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
