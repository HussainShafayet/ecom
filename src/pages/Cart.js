import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {removeFromCart, updateQuantity, selectCartItems, selectTotalPrice, handleFetchCart, handleRemovetoCart} from '../redux/slice/cartSlice';
import {fetchAllProducts} from '../redux/slice/productSlice';
import {Loader, ProductCard} from '../components/common';

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const {isLoading, items:products, error} = useSelector((state)=> state.product);
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    isAuthenticated && dispatch(handleFetchCart());
    if (cartItems.length > 0) {
      dispatch(fetchAllProducts({page_size:12}));
    }
   }, [dispatch]);
 
 
   if (error) {
     return <div>{error}</div>;
   }
  const handleRemoveItem = (id) =>{
    dispatch(handleRemovetoCart({product_id: id}));
    dispatch(removeFromCart(id));
  }

  const handleUpdateQuantity = (id, quantity)=>{
    dispatch(updateQuantity({ id, quantity })) 
  }

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
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scrollable Cart Items Section */}
          <div className="lg:col-span-2 max-h-screen overflow-y-auto scrollbar-custom">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 bg-white flex flex-col md:flex-row items-center gap-3 relative"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.has_discount && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      ({item.discount_value}{item.discount_type == 'percentage'?'%':'৳'} OFF)
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 text-sm">
                    <h2 className="font-semibold mb-1">{item.name}</h2>
                    <p className="text-gray-500 mb-1">
                      <span>{item.category}</span> • <span>{item.brand_name}</span> • <span>{item.avg_rating}</span>
                    </p>
                    <p className="text-gray-500 mb-2">
                      {item.color_name && <span>Color: {item.color_name}</span>}
                      {item.size_name && <span> • Size: {item.size_name}</span>}
                    </p>
                    {item.has_discount ? (
                      <div className="flex flex-row space-x-1">
                        <p className=" text-gray-500 line-through">
                          {item.base_price}
                        </p>
                        <p className="text-2x text-green-600 font-semibold">
                        {item.discount_price} <span className="text-red-500">({item.discount_value}{item.discount_type == 'percentage'?'%':'৳'} OFF)</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-2x text-green-600 font-semibold">
                        {item.base_price}
                      </p>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity -1)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-l"
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                        className="w-10 text-center border-l border-r"
                        min="1"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <FaTrash />
                  </button>

                  {/* Confirm Delete Warning in Card */}
                  {confirmDelete === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 p-3 rounded-lg">
                      <div className="text-center">
                        <p className="text-gray-800 mb-2">Are you sure you want to remove this item?</p>
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                            onClick={() => {
                              //removeFromCart(item.id);
                              handleRemoveItem(item.id)
                              setConfirmDelete(null);
                            }}
                          >
                            Yes
                          </button>
                          <button
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="sticky top-24 bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-4 block bg-blue-500 text-white text-center font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>

          {/* Sticky Checkout Button for Mobile */}
          <div className="fixed bottom-0 left-0 w-full bg-white p-4 lg:hidden shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">Total: {totalPrice}</p>
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
        
        {/* Related Products Section */}
        {cartItems.length  >0 && 
        <div className="mx-auto my-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          {isLoading ? <div>
            <Loader message='Releted Products Loading' />
          </div>:

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          }
        </div>
        }
      </>
      )}
    </div>
  );
};

export default Cart;


