// The count on the cart icon of a signed-in customer is the shop's cart, read as soon as they are known to be signed in: right after the sign-in
// and when the shop opens with a saved session, not only after the cart page was opened (it used to read the phone's own list, empty after a sign-in).
import React from 'react';
import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import authReducer, {verifyOtp} from '../redux/slice/authSlice';
import cartReducer, {handleFetchCart, selectCartCount} from '../redux/slice/cartSlice';
import siteReducer from '../redux/slice/siteSlice';
import pageTitleReducer from '../redux/slice/pageTitleSlice';
import toastReducer from '../redux/slice/toastSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import api from '../api/axiosSetup';
import {Layout} from '../components/layout';
import {badgeCount} from '../utils/badgeCount';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/siteService', () => ({getSite: vi.fn(() => new Promise(() => {})), getSitePage: vi.fn(), getFaqs: vi.fn(), sendContactMessage: vi.fn(), subscribeToNewsletter: vi.fn()}));
vi.mock('../components/common/BackToTop', () => ({default: () => null}));
vi.mock('../components/common/SearchDropdown', () => ({default: () => null}));

const init = (reducer) => reducer(undefined, {type: '@@init'});
const line = (id, quantity) => ({id, name: `Item ${id}`, base_price: 100, has_discount: false, quantity, variant_id: id});
const SERVER_CART = {data: {success: true, data: [line(1, 2), line(2, 3)]}}; // 5 pieces

const makeStore = ({signedIn = true, cartItems = []} = {}) => configureStore({
  reducer: {auth: authReducer, cart: cartReducer, site: siteReducer, pageTitle: pageTitleReducer, toast: toastReducer, globalError: globalErrorReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}, cart: {...init(cartReducer), cartItems}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderShell = (store) => render(<Provider store={store}><MemoryRouter><Layout><p>a page</p></Layout></MemoryRouter></Provider>);
const cartReads = () => api.get.mock.calls.filter(([url]) => String(url).includes('/accounts/cart/')).length;

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('The count on the cart icon', () => {
  it('is the shop\'s cart as soon as a signed-in customer opens the shop, on a page that is not the cart', async () => {
    api.get.mockResolvedValue(SERVER_CART);
    renderShell(makeStore());

    await waitFor(() => expect(screen.getAllByText('5').length).toBeGreaterThan(0)); // the top bar and the bottom bar
    expect(cartReads()).toBe(1);
  });

  it('is there right after the sign-in, not only after the cart page was opened', async () => {
    api.get.mockResolvedValue(SERVER_CART);
    const store = makeStore({signedIn: false});
    renderShell(store);
    expect(cartReads()).toBe(0);
    expect(selectCartCount(store.getState())).toBe(0);

    await act(async () => {
      store.dispatch(verifyOtp.fulfilled({message: 'ok', tokens: {access: 'a', refresh: 'r'}}, 'request-id', {}));
    });

    await waitFor(() => expect(screen.getAllByText('5').length).toBeGreaterThan(0));
    expect(cartReads()).toBe(1);
  });

  it('asks the shop for nothing while nobody is signed in: a guest\'s cart is on the phone', async () => {
    renderShell(makeStore({signedIn: false, cartItems: [line(1, 2)]}));

    expect(await screen.findAllByText('2')).not.toHaveLength(0);
    expect(cartReads()).toBe(0);
  });

  it('keeps what is shown when the shop cannot be reached, and says nothing about it', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));
    const store = makeStore({cartItems: [line(1, 4)]});
    renderShell(store);

    await waitFor(() => expect(cartReads()).toBe(1));
    await waitFor(() => expect(store.getState().cart.cartLoading).toBe(false));
    expect(selectCartCount(store.getState())).toBe(4);
    expect(store.getState().cart.cartError).toBeFalsy();
  });
});

describe('What the count counts', () => {
  it('is the pieces, not the products: a-2, b-1, c-1 is 4 (the cart page says the same)', async () => {
    renderShell(makeStore({signedIn: false, cartItems: [line(1, 2), line(2, 1), line(3, 1)]}));
    expect((await screen.findAllByText('4')).length).toBeGreaterThan(0);
    expect(screen.queryByText('3')).toBeNull();
  });

  it('stops at 99+, so a big number does not push the badge out of its circle', async () => {
    renderShell(makeStore({signedIn: false, cartItems: [line(1, 120)]}));
    expect((await screen.findAllByText('99+')).length).toBeGreaterThan(0);
    expect(screen.queryByText('120')).toBeNull();
  });

  it('writes 99 as 99 and 100 as 99+', () => {
    expect(badgeCount(0)).toBe('0');
    expect(badgeCount(99)).toBe('99');
    expect(badgeCount(100)).toBe('99+');
  });
});

describe('The cart read', () => {
  const pendingOf = (arg) => cartReducer(init(cartReducer), handleFetchCart.pending('request-id', arg));

  it('puts the cart page into its loading state when the page asks', () => {
    expect(pendingOf(undefined).cartLoading).toBe(true);
  });

  it('does not when nobody asked with a page (quiet): the cart page must not flash a skeleton for the count', () => {
    expect(pendingOf({quiet: true}).cartLoading).toBe(false);
  });

  it('is always a list, so the count can be added up on every page', () => {
    const state = cartReducer(init(cartReducer), handleFetchCart.fulfilled({success: true}, 'request-id', undefined));
    expect(state.cartItems).toEqual([]);
  });
});
