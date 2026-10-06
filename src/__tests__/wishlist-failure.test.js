// A wishlist heart that did not work says so (it used to fail silently: the section error nothing showed, or a console.error).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer, {addToWishlist} from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import {ProductCard} from '../components/common';
import WishList from '../pages/user/WishList';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const KETTLE = {
  id: 1, name: 'Blue Kettle', slug: 'kettle', image: '', base_price: 900, has_discount: false, availability_status: true,
  has_variants: false, variant_id: 3, avg_rating: 0, total_reviews: 0,
};
const init = (reducer) => reducer(undefined, {type: '@@init'});
const failure = (errors) => ({response: {data: {success: false, errors}}});

const makeStore = ({signedIn = true} = {}) => configureStore({
  reducer: {cart: cartReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, toast: toastReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const toasts = (store) => store.getState().toast.items.map((item) => item.message);
const renderCard = (store) => render(<Provider store={store}><MemoryRouter><ProductCard product={KETTLE} /></MemoryRouter></Provider>);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The heart on a product card', () => {
  it('says why the shop refused, in its own words, and stays empty', async () => {
    api.post.mockRejectedValue(failure(['Your wishlist is full.']));
    const store = makeStore();
    renderCard(store);

    fireEvent.click(screen.getByLabelText('Add to wishlist'));

    await waitFor(() => expect(toasts(store)).toEqual(['Your wishlist is full.']));
    expect(screen.getByLabelText('Add to wishlist').getAttribute('aria-pressed')).toBe('false');
  });

  it('says it could not when the shop did not answer', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    const store = makeStore();
    renderCard(store);

    fireEvent.click(screen.getByLabelText('Add to wishlist'));

    await waitFor(() => expect(toasts(store)).toEqual(['Could not add this to your wishlist. Please try again.']));
  });

  it('fills when the shop took it, and says nothing', async () => {
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    const store = makeStore();
    renderCard(store);

    fireEvent.click(screen.getByLabelText('Add to wishlist'));

    await waitFor(() => expect(screen.getByLabelText('Remove from wishlist').getAttribute('aria-pressed')).toBe('true'));
    expect(toasts(store)).toEqual([]);
  });

  it('says so when it could not be taken out, and the heart stays filled', async () => {
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    api.put.mockRejectedValue(failure(['Something went wrong on our side.']));
    const store = makeStore();
    renderCard(store);
    fireEvent.click(screen.getByLabelText('Add to wishlist'));
    await screen.findByLabelText('Remove from wishlist');

    fireEvent.click(screen.getByLabelText('Remove from wishlist'));

    await waitFor(() => expect(toasts(store)).toEqual(['Something went wrong on our side.']));
    expect(screen.getByLabelText('Remove from wishlist').getAttribute('aria-pressed')).toBe('true');
  });

  it('is local for a guest: no server call, nothing to fail', () => {
    const store = makeStore({signedIn: false});
    renderCard(store);

    fireEvent.click(screen.getByLabelText('Add to wishlist'));

    expect(screen.getByLabelText('Remove from wishlist')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
    expect(toasts(store)).toEqual([]);
  });
});

describe('Clear Wishlist', () => {
  // (the empty page also asks for suggestions through the same client: count only the wishlist's own reads)
  const wishlistFetches = () => api.get.mock.calls.filter(([url]) => String(url).includes('/accounts/favourite/')).length;
  const renderWishlist = (store) => render(<Provider store={store}><MemoryRouter><WishList /></MemoryRouter></Provider>);
  // (the page shows its skeleton while it fetches the signed-in customer's list)
  const clearAll = async () => {
    fireEvent.click(await screen.findByText('Clear Wishlist'));
    fireEvent.click(screen.getByText('Yes'));
  };

  it('is a real button, and empties the list at once', async () => {
    api.get.mockResolvedValue({data: {data: [KETTLE]}});
    api.put.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    const store = makeStore();
    store.dispatch(addToWishlist(KETTLE));
    renderWishlist(store);
    expect((await screen.findByText('Clear Wishlist')).tagName).toBe('BUTTON');

    await clearAll();

    await waitFor(() => expect(screen.getByText(/Your wishlist is empty/)).toBeTruthy());
    expect(toasts(store)).toEqual([]);
  });

  it('says so when the server could not, and shows what it still holds', async () => {
    api.get.mockResolvedValue({data: {data: [KETTLE]}});
    api.put.mockRejectedValue(failure(['Something went wrong on our side.']));
    const store = makeStore();
    store.dispatch(addToWishlist(KETTLE));
    renderWishlist(store);
    await waitFor(() => expect(wishlistFetches()).toBe(1)); // the page's own fetch

    await clearAll();

    await waitFor(() => expect(toasts(store)).toEqual(['Could not clear your wishlist. Please try again.']));
    await waitFor(() => expect(wishlistFetches()).toBe(2)); // fetched again to show what is really there
  });
});
