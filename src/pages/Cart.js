import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, removeFromCart, updateQuantity, selectTotalPrice, handleFetchCart, handleRemovetoCart, handleAddtoCart, clearCart} from '../redux/slice/cartSlice';
import {fetchAllProducts, MAX_QUANTITY} from '../redux/slice/productSlice';
import {clearSectionError} from '../redux/slice/globalErrorSlice';
import {ErrorDisplay, ProductSection, SectionError} from '../components/common';
import {CartCheckoutBar, CartItem, UndoSnackbar} from '../components/cart';
import {RecentlyViewed} from '../components/sections';
import {minimumOf, minimumOrderProblems} from '../utils/minimumOrder';
import debounce from 'lodash.debounce'; // Import lodash debounce
import {CartSkeleton, SectionSkeleton} from '../components/common/skeleton';

const SUGGESTION_COUNT = 12;
const UNDO_SECONDS = 6;

// One cart line: the same product in another colour/size is another line
const lineKey = (item) => `${item?.id}-${item?.variant_id ?? 0}`;

// Mobile first: the lines in one column with the page's own scroll (no scroll box inside the page), the total and Checkout in
// a bar fixed above the bottom navigation, a removal that is undone with one tap instead of asked about first. From `lg`:
// the lines beside a sticky order summary that has the Checkout button.
const Cart = () => {
  const totalPrice = useSelector(selectTotalPrice);
  const [confirmAllDelete, setConfirmAllDelete] = useState(false);
  const [quantityErrors, setQuantityErrors] = useState({}); // per line: why the shop refused the last quantity change (stock)
  const [undo, setUndo] = useState(null); // what was just removed { items, message }
  const {cartItems, cartFetchLoading, cartFetchError, cartRemoveError} = useSelector((state)=> state.cart);

  const {isLoading, items:products, error} = useSelector((state)=> state.product);
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const fetchCartError = useSelector((state) => state.globalError.sectionErrors["fetch-cart"]);
  const minimumProblems = minimumOrderProblems(cartItems); // lines below their product's minimum order
  const dispatch = useDispatch();
  const [originalQuantities, setOriginalQuantities] = useState({}); // Store original quantities
  const hasItems = cartItems.length > 0;

  useEffect(() => {
    isAuthenticated && dispatch(handleFetchCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (hasItems) dispatch(fetchAllProducts({page_size: SUGGESTION_COUNT * 2})); // more than it shows: some are already in the cart
  }, [dispatch, hasItems]);

  // The undo offer goes away by itself
  useEffect(() => {
    if (!undo) return undefined;
    const timer = setTimeout(() => setUndo(null), UNDO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [undo]);

   // Debounced API call
   const debouncedUpdateQuantity = useCallback(

    debounce(async (product, difference) => {
      if (difference !== 0) {
      const cartBody = {};
      cartBody.product_id = product?.id;
      cartBody.quantity = Math.abs(difference);
      cartBody.variant_id = product?.variant_id;
      cartBody.action = difference < 0 ? 'decrease' : 'increase';

      const result = await dispatch(handleAddtoCart(cartBody));
      const key = lineKey(product);
      setOriginalQuantities((prev) => ({
        ...prev,
        [key]: null,
      }));
      if (handleAddtoCart.rejected.match(result)) {
        // e.g. "Only 3 of Mug left in stock.": say so under that line, and show the quantity the server really holds
        const sentences = result.payload?.errors || ['The quantity could not be changed. Please try again.'];
        setQuantityErrors((prev) => ({...prev, [key]: sentences.join(' ')}));
        dispatch(handleFetchCart());
      } else {
        setQuantityErrors((prev) => {
          const next = {...prev};
          delete next[key];
          return next;
        });
      }

      }
    }, 1000),
    []
  );

  if (fetchCartError) {
    return (
      <SectionError
        message={fetchCartError}
        onRetry={() => {
          dispatch(clearSectionError('fetch-cart'));
          dispatch(handleFetchCart());
        }}
      />
    );
  }

  // The server's copy of a removal that failed is what the cart really holds: show that
  const removeOnServer = async (payload) => {
    const result = await dispatch(handleRemovetoCart(payload));
    if (handleRemovetoCart.rejected.match(result)) dispatch(handleFetchCart());
  };

  const handleRemoveItem = (item) =>{
    isAuthenticated && removeOnServer({product_id: item?.id, variant_id: item?.variant_id});
    dispatch(removeFromCart(item));
    setUndo({items: [item], message: `Removed “${item?.name}”`});
  }

  const handleRemoveAllItem = () => {
    const removeList = cartItems?.map(element =>
      element?.variant_id
        ? { product_id: element?.id, variant_id: element?.variant_id }
        : { product_id: element?.id }
    ) || [];
    isAuthenticated && removeOnServer(removeList);
    setUndo({items: cartItems, message: 'Cart cleared'});
    dispatch(clearCart());
    setConfirmAllDelete(false);
  };

  // Puts back what was removed, with the quantities it had (the server too, for a signed-in customer)
  const handleUndo = async () => {
    const restored = undo?.items || [];
    setUndo(null);
    restored.forEach((item) => dispatch(addToCart(item)));
    if (isAuthenticated) {
      await Promise.all(restored.map((item) => dispatch(handleAddtoCart({
        product_id: item.id, quantity: item.quantity, variant_id: item.variant_id, action: 'increase',
      }))));
      dispatch(handleFetchCart()); // whatever the shop could not put back (stock) is not shown as if it had
    }
  };

  const handleUpdateQuantity = (item, wanted) => {
    const key = lineKey(item);
    let prevQuantity = 0;
    if (originalQuantities[key]) {
      prevQuantity = originalQuantities[key];
    } else {
       setOriginalQuantities((prev) => ({
        ...prev,
        [key]: item?.quantity,
      }));
      prevQuantity = item?.quantity;
    }
    // never below the product's minimum order (refused at checkout), never above what one line may hold
    const newQuantity = Math.min(MAX_QUANTITY, Math.max(wanted, minimumOf(item)));
    const difference = newQuantity - prevQuantity; // Calculate actual difference

    // Update UI immediately
    dispatch(updateQuantity({ id: item?.id, quantity: newQuantity, variant_id: item?.variant_id }));

    // Only send API request if the quantity actually changed
    if (isAuthenticated && difference !== 0) {
        debouncedUpdateQuantity(item, difference); // API gets the actual difference
    }
};

  const inCart = new Set(cartItems.map((item) => item?.id));
  const suggestions = (products || []).filter((product) => !inCart.has(product?.id)).slice(0, SUGGESTION_COUNT);

  return (
    <>
      {/* phone: room for the fixed checkout bar (68 px) above the bottom nav (56 px); tablet: for the bar alone */}
      <div className="mx-auto pb-44 md:pb-28 lg:pb-0">
      {cartFetchLoading ? <CartSkeleton /> :
        cartFetchError ? (
        <SectionError message={cartFetchError} />
      ) :
      <>
          {cartRemoveError &&
            <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">{cartRemoveError}</p>
          }
          {!hasItems ? (
            <>
              <div className="py-10 text-center">
                <FaShoppingCart aria-hidden="true" className="mx-auto mb-4 text-5xl text-gray-300" />
                <h1 className="text-xl font-bold text-gray-900">Your cart is empty</h1>
                <p className="mt-1 text-sm text-gray-500">Add something you like and it will wait for you here.</p>
                <Link to="/products" className="mt-5 inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">
                  Start shopping
                </Link>
              </div>
              <RecentlyViewed />
            </>
          ) :
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              <div className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h1 className="text-xl font-bold sm:text-2xl">
                    Shopping Cart <span className="text-base font-normal text-gray-500">({cartItems.length})</span>
                  </h1>
                  <button type="button" onClick={() => setConfirmAllDelete(true)} className="min-h-10 px-2 text-sm font-medium text-red-600 hover:underline">
                    Clear cart
                  </button>
                </div>

                {confirmAllDelete && (
                  <div role="group" aria-label="Clear the cart" className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-gray-800">
                    <span>Remove all {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}?</span>
                    <span className="flex gap-2">
                      <button type="button" onClick={handleRemoveAllItem} className="h-10 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700">Remove all</button>
                      <button type="button" onClick={() => setConfirmAllDelete(false)} className="h-10 rounded-lg border border-gray-300 bg-white px-4 font-semibold text-gray-700">Keep</button>
                    </span>
                  </div>
                )}

                <ul className="flex flex-col gap-3">
                  {cartItems.map((item) => (
                    <CartItem
                      key={lineKey(item)}
                      item={item}
                      error={quantityErrors[lineKey(item)]}
                      onQuantityChange={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </ul>
              </div>

              {/* Order Summary */}
              <div className="rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">The delivery charge is added at checkout.</p>
                <hr className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
                {minimumProblems.length > 0 && <div className="mt-4"><ErrorDisplay errors={[...minimumProblems, 'Increase the quantity to continue.']} /></div>}
                {/* On a phone and a tablet the bar fixed to the bottom has the button */}
                <div className="hidden lg:block">
                  {minimumProblems.length > 0 ? (
                    <span
                      aria-disabled="true"
                      className="mt-4 block cursor-not-allowed rounded-lg bg-gray-300 py-2 text-center font-bold text-gray-500"
                    >
                      Proceed to Checkout
                    </span>
                  ) : (
                  <Link
                    to="/checkout"
                    className="mt-4 block rounded-lg bg-blue-600 py-2 text-center font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    Proceed to Checkout
                  </Link>
                  )}
                </div>
              </div>

              <CartCheckoutBar total={totalPrice} blocked={minimumProblems.length > 0} />
            </div>
          }
          </>
        }

        {/* More to add: what is not in the cart yet, as a row you swipe */}
        {hasItems && (isLoading ? <SectionSkeleton /> : !error && (
          <ProductSection className="my-10" title="You may also like" products={suggestions} carousel />
        ))}
      </div>

      {undo && <UndoSnackbar message={undo.message} onUndo={handleUndo} />}
    </>
  );
};

export default Cart;
