// Placing an order must never send the customer to the products page. The shop empties the cart the moment it took the order (`handleCheckout`
// clears it before it returns), a beat before `isCheckoutFulfilled` says the order is placed; in that beat the page used to see "empty cart,
// no order" and its guard ("nothing to buy here") took the customer to /products instead of to their order. A page that is not in the middle
// of placing an order still sends an empty cart away.
import React from 'react';
import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import checkoutReducer, {handleCheckout} from '../redux/slice/checkoutSlice';
import cartReducer, {clearCart} from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const MUG = {id: 1, name: 'Mug', slug: 'mug', image: '', base_price: 500, discount_price: 500, has_discount: false, quantity: 1, minimum_order_quantity: 1, variant_id: 1, availability_status: true};
const PLACED = {order_id: 'GC-20261006-0001', status: 'pending', created_at: '2026-10-06T10:00:00Z', subtotal: 500, delivery_charge: 60, total: 560};
const init = (reducer) => reducer(undefined, {type: '@@init'});

const renderCheckout = async ({cartItems = [MUG]} = {}) => {
  const {default: Checkout} = await import('../pages/Checkout');
  const content = {data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, shipping_addresses: [], user_info: null}}};
  publicApi.get.mockResolvedValue(content);
  api.get.mockResolvedValue(content);
  const store = configureStore({
    reducer: {cart: cartReducer, product: productReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, checkout: checkoutReducer},
    preloadedState: {auth: {...init(authReducer), isAuthenticated: false}, cart: {...init(cartReducer), cartItems}},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/products" element={<p>the products page</p>} />
          <Route path="/order-confirmation/:orderId" element={<p>the order page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.sessionStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('After Place Order', () => {
  it('takes the customer to their order, not to the products page, though the cart is empty a beat before the order is marked placed', async () => {
    const store = await renderCheckout();
    await screen.findByText('Place Order');

    await act(async () => {
      store.dispatch(handleCheckout.pending('request-id', {})); // Place Order was pressed
      store.dispatch(clearCart()); // the shop took the order: the cart is emptied first ...
    });
    await new Promise((resolve) => setTimeout(resolve, 50)); // ... and the page has its chance to react
    expect(screen.queryByText('the products page')).toBeNull();
    expect(screen.queryByText('the order page')).toBeNull(); // still on the checkout page, waiting for the shop's answer to be recorded

    await act(async () => {
      store.dispatch(handleCheckout.fulfilled(PLACED, 'request-id', {})); // ... then the order is marked placed
    });
    expect(await screen.findByText('the order page')).toBeTruthy();
    expect(screen.queryByText('the products page')).toBeNull();
  });

  it('still sends an empty cart away when no order is being placed', async () => {
    await renderCheckout({cartItems: []});
    expect(await screen.findByText('the products page')).toBeTruthy();
  });

  it('keeps the customer on the form when the shop refuses the order (the cart is not emptied)', async () => {
    const store = await renderCheckout();
    await screen.findByText('Place Order');

    await act(async () => {
      store.dispatch(handleCheckout.pending('request-id', {}));
      store.dispatch(handleCheckout.rejected(null, 'request-id', {}, {errors: ['Only 1 of Mug left in stock.']}));
    });

    await waitFor(() => expect(screen.getByText('Only 1 of Mug left in stock.')).toBeTruthy());
    expect(screen.queryByText('the products page')).toBeNull();
  });
});
