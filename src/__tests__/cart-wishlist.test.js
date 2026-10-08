// "Move to wishlist" on a cart line: keep it for later instead of removing it. It goes into the wishlist FIRST (the shop's for a signed-in
// customer, this phone's for a guest) and leaves the cart only when that worked, with the same one-tap undo as a removal.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import recentlyViewedReducer from '../redux/slice/recentlyViewedSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import {getAllProducts} from '../services/productService';
import Cart from '../pages/Cart';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getAllProducts: vi.fn()}));
vi.mock('lodash.debounce', () => ({default: (fn) => fn}));

const KNIFE = {
  id: 9, name: 'Lite Chef Knife Set', slug: 'lite-chef-knife-set', image: '', base_price: 500, discount_price: 500, has_discount: false,
  quantity: 2, minimum_order_quantity: 1, variant_id: 5, availability_status: true,
};
const MUG = {id: 10, name: 'Blue Mug', slug: 'blue-mug', image: '', base_price: 400, discount_price: 400, has_discount: false, quantity: 1, minimum_order_quantity: 1, variant_id: 6, availability_status: true};
const failure = (errors) => ({response: {data: {success: false, errors}}});
const init = (reducer) => reducer(undefined, {type: '@@init'});

const makeStore = ({signedIn = false, favouriteIds = {}} = {}) => configureStore({
  reducer: {cart: cartReducer, product: productReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, recentlyViewed: recentlyViewedReducer, toast: toastReducer},
  preloadedState: {
    auth: {...init(authReducer), isAuthenticated: signedIn},
    cart: {...init(cartReducer), cartItems: [KNIFE, MUG]},
    wishList: {...init(wishListReducer), favouriteIds},
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderCart = (options) => {
  const store = makeStore(options);
  render(<Provider store={store}><MemoryRouter><Cart /></MemoryRouter></Provider>);
  return store;
};
const move = (name) => screen.getByRole('button', {name: `Move ${name} to your wishlist`});
const inCart = (store) => store.getState().cart.cartItems.map((item) => item.id);
const toasts = (store) => store.getState().toast.items.map((item) => item.message);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  getAllProducts.mockResolvedValue({data: {data: {results: [], next: null}}});
  api.get.mockResolvedValue({data: {data: [KNIFE, MUG]}});
  api.post.mockResolvedValue({data: {success: true, message: 'ok', data: {product_id: 9}}});
  api.put.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
});

describe('Move to wishlist, as a guest', () => {
  it('puts the product in the wishlist on this phone and takes the line out of the cart, saying so', () => {
    const store = renderCart();
    expect(screen.getAllByRole('button', {name: /to your wishlist$/})).toHaveLength(2); // one on each line

    fireEvent.click(move('Lite Chef Knife Set'));

    expect(inCart(store)).toEqual([10]);
    expect(store.getState().wishList.items.map((item) => item.id)).toEqual([9]);
    expect(store.getState().wishList.favouriteIds[9]).toBe(9);
    expect(screen.getByText('Moved “Lite Chef Knife Set” to your wishlist')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled(); // a guest's wishlist is not the shop's
  });

  it('can be undone with one tap: the line comes back with its quantity (the wishlist keeps its heart)', async () => {
    const store = renderCart();
    fireEvent.click(move('Lite Chef Knife Set'));

    await act(async () => { fireEvent.click(screen.getByRole('button', {name: /Undo/i})); });

    expect([...inCart(store)].sort((a, b) => a - b)).toEqual([9, 10]); // the undone line goes back at the end of the list
    expect(store.getState().cart.cartItems.find((item) => item.id === 9).quantity).toBe(2);
    expect(store.getState().wishList.favouriteIds[9]).toBe(9);
  });

  it('does not add a product that is already in the wishlist twice, and still takes it out of the cart', () => {
    const store = renderCart({favouriteIds: {9: 9}});
    fireEvent.click(move('Lite Chef Knife Set'));
    expect(inCart(store)).toEqual([10]);
    expect(store.getState().wishList.items).toHaveLength(0); // nothing was pushed: it is already marked
  });
});

describe('Move to wishlist, signed in', () => {
  it('asks the shop to keep it, then takes the line out of the cart on the shop too', async () => {
    const store = renderCart({signedIn: true});
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    await act(async () => { fireEvent.click(move('Lite Chef Knife Set')); });

    await waitFor(() => expect(inCart(store)).toEqual([10]));
    expect(api.post).toHaveBeenCalledWith('/accounts/favourite/', {product_id: 9}, {section: 'add-wishlist'});
    expect(api.put).toHaveBeenCalledWith('/accounts/cart/', {product_id: 9, variant_id: 5}, {section: 'cart-remove'});
  });

  it('leaves the line in the cart and says why when the shop refuses the wishlist', async () => {
    api.post.mockRejectedValue(failure(['Your wishlist is full.']));
    const store = renderCart({signedIn: true});
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    await act(async () => { fireEvent.click(move('Lite Chef Knife Set')); });

    await waitFor(() => expect(toasts(store)).toEqual(['Your wishlist is full.']));
    expect(inCart(store)).toEqual([9, 10]);
    expect(api.put).not.toHaveBeenCalled(); // nothing was removed on the shop either
  });
});
