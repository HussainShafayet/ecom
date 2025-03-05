import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {removeFromCart, updateQuantity, selectCartItems, selectTotalPrice, handleFetchCart, handleRemovetoCart, handleAddtoCart, clearCart} from '../redux/slice/cartSlice';
import {fetchAllProducts} from '../redux/slice/productSlice';
import {Loader, ProductCard} from '../components/common';
import debounce from 'lodash.debounce'; // Import lodash debounce
import {CartSkeleton, SectionSkeleton} from '../components/common/skeleton';

const Cart = () => {
  //const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const [confirmDelete, setConfirmDelete] = useState({});
  const [confirmAllDelete, setConfirmAllDelete] = useState(false);
  const {cartItems, cartFetchLoading, cartFetchError, cartRemoveLoading, cartRemoveError} = useSelector((state)=> state.cart);

  const {isLoading, items:products, error} = useSelector((state)=> state.product);
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const fetchCartError = useSelector((state) => state.globalError.sectionErrors["fetch-cart"]);
  const dispatch = useDispatch();
  const [originalQuantities, setOriginalQuantities] = useState({}); // Store original quantities

  useEffect(() => {
    isAuthenticated && dispatch(handleFetchCart());
    if (cartItems.length > 0) {
      dispatch(fetchAllProducts({page_size:12}));
    }
   }, [dispatch]);

   // Debounced API call
   const debouncedUpdateQuantity = useCallback(
    
    debounce((product, difference) => {
      if (difference !== 0) {
      const cartBody = {};
      cartBody.product_id = product.id;
      cartBody.quantity = Math.abs(difference);
      cartBody.variant_id = product.variant_id;
      cartBody.action = difference < 0 ? 'decrease' : 'increase';

      dispatch(handleAddtoCart(cartBody));
      setOriginalQuantities((prev) => ({
        ...prev,
        [product.id]: null,
      }));
      
      }
    }, 1000),
    []
  );
 
 
  if (fetchCartError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {fetchCartError} - Please try again later.
    </div>;
  }
  const handleRemoveItem = (item) =>{
    isAuthenticated && dispatch(handleRemovetoCart({product_id: item.id, variant_id: item.variant_id}));
    dispatch(removeFromCart(item));
  }

  const handleRemoveAllItem = () => {
    const removeList = cartItems?.map(element => 
      element.variant_id 
        ? { product_id: element.id, variant_id: element.variant_id } 
        : { product_id: element.id }
    ) || [];
    isAuthenticated && dispatch(handleRemovetoCart(removeList));
    dispatch(clearCart());
  };

  const handleUpdateQuantity = (id, newQuantity, item) => {
    let prevQuantity = 0;
    if (originalQuantities[id]) {
      prevQuantity = originalQuantities[id];
    } else {
       setOriginalQuantities((prev) => ({
        ...prev,
        [id]: item.quantity,
      }));
      prevQuantity = item.quantity;
    }
    const difference = newQuantity - prevQuantity; // Calculate actual difference
    
    // Update UI immediately
    dispatch(updateQuantity({ id, quantity: newQuantity, variant_id: item.variant_id }));

    // Only send API request if the quantity actually changed
    if (isAuthenticated && difference !== 0) {
        debouncedUpdateQuantity(item, difference); // API gets the actual difference
    }
};

   

  return (
    <>
   
      <div className="mx-auto">
      {cartFetchLoading ? <CartSkeleton /> :
        cartFetchError ? (
        <div className="text-center text-red-500 font-semibold py-4">
          {cartFetchError} - Please try again later.
        </div>
      ) :
      <>
          {cartRemoveError &&
            <div className="text-center text-red-500 font-semibold py-4">
              {cartRemoveError} - Please try again later.
            </div>
          }
          {cartItems.length === 0 ? (
            <div className="text-center">
              <h3 className="text-2xl mb-4">Your cart is empty</h3>
              <Link to="/products" className="text-blue-500 hover:text-blue-600 text-lg">
                Browse Products
              </Link>
            </div>
          ) : 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
              {/* Scrollable Cart Items Section */}
              <div className="lg:col-span-2 relative">
                <div className='flex justify-between items-center'>
                  <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                  {cartItems.length > 0 && 
                    <span className='text-blue-500 cursor-pointer hover:underline transition-colors' onClick={() => setConfirmAllDelete(true)}>Clear Cart</span>
                  }
                </div>
                

                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto scrollbar-custom">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow p-2 bg-white flex flex-row items-center gap-3 relative w-full"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-12 sm:h-12 md:w-24 md:h-24  rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 text-xs sm:text-sm md:text-base w-full">
                        <h2 className="font-semibold truncate w-full" title={item.name}>
                          {item.name}
                        </h2>
                        <p className="text-gray-500 text-wrap">
                          {item.brand_name && <span>Brand: {item.brand_name} • </span>}
                          {item.color_name && <span>Color: {item.color_name} • </span>}
                          {item.size_name && <span>Size: {item.size_name} • </span>}
                          {item.avg_rating && <span>Avg Rating: {item.avg_rating}</span>}
                        </p>

                        {/* Price Section */}
                        {item.has_discount ? (
                          <div className="flex flex-row space-x-1">
                            <p className="text-gray-500 line-through">{item.base_price}</p>
                            <p className="text-green-600 font-semibold">
                              {item.discount_price}{' '}
                              <span className="text-red-500">({item.discount_value}{item.discount_type == 'percentage' ? '%' : '৳'} OFF)</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-green-600 font-semibold">{item.base_price}</p>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-l"
                            disabled={item.quantity === 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value, 10) || 1;
                              handleUpdateQuantity(item.id, newValue, item);
                            }}
                            className="w-12 text-center border-l border-r"
                            min="1"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        onClick={() => setConfirmDelete({ id: item.id, variant_id: item.variant_id })}
                      >
                        <FaTrash />
                      </button>

                      {/* Confirm Delete Warning in Card */}
                      {confirmDelete?.id === item.id && confirmDelete?.variant_id === item.variant_id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 p-3 rounded-lg">
                          <div className="text-center">
                            <p className="text-gray-800 mb-2">Are you sure you want to remove this item?</p>
                            <div className="flex justify-center gap-2">
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                onClick={() => {
                                  handleRemoveItem(item);
                                  setConfirmDelete({});
                                }}
                              >
                                Yes
                              </button>
                              <button
                                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                                onClick={() => setConfirmDelete({})}
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



                 {/* Confirm All Delete Warning in Card */}
                 {confirmAllDelete && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 p-3 rounded-lg">
                      <div className="text-center">
                        <p className="text-gray-800 mb-2">Are you sure you want to remove all item?</p>
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                            onClick={() => {
                              //removeFromCart(item.id);
                              handleRemoveAllItem()
                              setConfirmAllDelete(false);
                            }}
                          >
                            Yes
                          </button>
                          <button
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                            onClick={() => setConfirmAllDelete(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Order Summary */}
              <div className="sticky top-24 bg-white shadow-sm rounded-lg p-4">
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
          }
          </>
        }
          {/* Related Products Section */}
          {isLoading ? <SectionSkeleton /> :
            error ? (
            <div className="text-center text-red-500 font-semibold py-4">
              {error} - Please try again later.
            </div>
          ) :
          <>
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
        }
      </div>
    {/*}*/}
    </>
  );
};

export default Cart;


