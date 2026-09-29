// The customer's session (src/api/session.js, the axios interceptor, authSlice/authActions): the backend's access token
// lives minutes and its refresh token is single-use (every refresh retires the old one), so renewing must happen once
// however many requests need it, and only the server refusing the refresh token may sign anybody out. The real store and
// the real axios instance are used; only the network (the axios adapters and the refresh POST) is replaced.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';
import axios, {AxiosError} from 'axios';
import Cookies from 'js-cookie';

import store from '../redux/store';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {saveTokens} from '../api/session';
import authReducer, {dismissSessionNotice, sessionEnded, sessionRefreshed} from '../redux/slice/authSlice';
import {restoreSession} from '../redux/slice/authActions';
import {addToCart, clearCart} from '../redux/slice/cartSlice';
import {clearAllErrors} from '../redux/slice/globalErrorSlice';
import {dismissToast} from '../redux/slice/toastSlice';
import {SessionExpiredBanner} from '../components/layout';

const ITEM = {id: 1, name: 'Kettle', quantity: 2, variant_id: 3, base_price: 10, discount_price: 10};

// What an adapter answers with: a response, or the AxiosError a bad status becomes
const respond = (config, status, data = {}) => {
  const response = {data, status, statusText: '', headers: {}, config};
  if (status < 400) return Promise.resolve(response);
  return Promise.reject(new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response));
};
const refused = (status) => new AxiosError('refused', 'ERR_BAD_REQUEST', {}, {}, {status, data: {}});
const newTokens = (access = 'new', refresh = 'r2') => ({data: {data: {access, refresh}}});

const signIn = ({access = 'old', refresh = 'r1'} = {}) => {
  Cookies.set('access_token', access);
  Cookies.set('refresh_token', refresh);
  store.dispatch(sessionRefreshed({access, refresh}));
};
const state = () => store.getState();

beforeEach(() => {
  vi.spyOn(axios, 'post');
  store.dispatch(sessionEnded()); // signed out, cookies gone...
  store.dispatch(dismissSessionNotice()); // ...and nothing said about it
  store.dispatch(clearCart());
  store.dispatch(clearAllErrors());
  state().toast.items.forEach(({id}) => store.dispatch(dismissToast(id)));
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe('Renewing the access token', () => {
  it('renews once for every request that found it expired, and retries each with the new token', async () => {
    signIn();
    api.defaults.adapter = vi.fn((config) => (config.headers.Authorization === 'Bearer new' ? respond(config, 200, {ok: true}) : respond(config, 401)));
    axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(newTokens()), 10)));

    const answers = await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(answers.map((answer) => answer.status)).toEqual([200, 200, 200]);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][1]).toEqual({refresh: 'r1'});
    expect(state().auth.accessToken).toBe('new');
    expect(Cookies.get('access_token')).toBe('new');
    expect(Cookies.get('refresh_token')).toBe('r2'); // the single-use refresh token is replaced too
  });

  it('does not renew again when another request already did while this one was on its way', async () => {
    signIn();
    let first = true;
    api.defaults.adapter = vi.fn((config) => {
      if (first) {
        first = false;
        store.dispatch(sessionRefreshed({access: 'new', refresh: 'r2'})); // someone else's renewal lands
        return respond(config, 401);
      }
      return respond(config, 200, {ok: true});
    });

    const answer = await api.get('/a');

    expect(answer.status).toBe(200);
    expect(axios.post).not.toHaveBeenCalled();
    expect(api.defaults.adapter.mock.calls[1][0].headers.Authorization).toBe('Bearer new');
  });
});

describe('When the session really is over', () => {
  const expectSignedOutQuietly = () => {
    expect(state().auth.isAuthenticated).toBe(false);
    expect(state().auth.accessToken).toBeNull();
    expect(state().auth.sessionExpired).toBe(true);
    expect(Cookies.get('refresh_token')).toBeUndefined();
    expect(Cookies.get('access_token')).toBeUndefined();
    expect(state().cart.cartItems).toEqual([]); // the account's cart is not left behind to be added to it again
    expect(state().toast.items).toEqual([]); // nothing over the page: the banner and the sign-in page say it
    expect(state().globalError.sectionErrors).toEqual({});
  };

  it('signs out quietly when the server refuses the refresh token', async () => {
    signIn();
    store.dispatch(addToCart(ITEM));
    api.defaults.adapter = vi.fn((config) => respond(config, 401));
    axios.post.mockRejectedValue(refused(401));

    await expect(api.get('/accounts/cart/', {section: 'fetch-cart'})).rejects.toMatchObject({response: {status: 401}});

    expectSignedOutQuietly();
  });

  it('signs out quietly when there is no refresh token at all, without asking the server', async () => {
    signIn();
    Cookies.remove('refresh_token');
    api.defaults.adapter = vi.fn((config) => respond(config, 401));

    await expect(api.get('/accounts/cart/', {section: 'fetch-cart'})).rejects.toMatchObject({response: {status: 401}});

    expect(axios.post).not.toHaveBeenCalled();
    expectSignedOutQuietly();
  });

  it('signs out when a freshly renewed token is refused as well', async () => {
    signIn();
    api.defaults.adapter = vi.fn((config) => respond(config, 401));
    axios.post.mockResolvedValue(newTokens());

    await expect(api.get('/accounts/cart/', {section: 'fetch-cart'})).rejects.toMatchObject({response: {status: 401}});

    expect(axios.post).toHaveBeenCalledTimes(1); // it did not try again and again
    expectSignedOutQuietly();
  });

  it('carries on as a guest for a page everyone may see, instead of failing it', async () => {
    signIn();
    api.defaults.adapter = vi.fn((config) => respond(config, 401));
    const asGuest = vi.spyOn(publicApi, 'request').mockResolvedValue({status: 200, data: {ok: 'as a guest'}});
    axios.post.mockRejectedValue(refused(401));

    const answer = await api.get('/products', {section: 'products', optionalAuth: true});

    expect(answer.data).toEqual({ok: 'as a guest'});
    expect(asGuest).toHaveBeenCalledTimes(1);
    expect(asGuest.mock.calls[0][0].url).toBe('/products');
    expect(asGuest.mock.calls[0][0].headers.Authorization).toBeUndefined(); // without the customer's token
    expect(state().auth.isAuthenticated).toBe(false);
  });
});

describe('When the renewal itself does not get through', () => {
  it.each([
    ['there is no connection', new AxiosError('Network Error', 'ERR_NETWORK')],
    ['the server has a hiccup (503)', refused(503)],
    ['there are too many requests (429)', refused(429)],
  ])('keeps the session when %s', async (_, failure) => {
    signIn();
    api.defaults.adapter = vi.fn((config) => respond(config, 401));
    axios.post.mockRejectedValue(failure);

    await expect(api.get('/accounts/cart/', {section: 'fetch-cart'})).rejects.toMatchObject({response: {status: 401}});

    expect(state().auth.isAuthenticated).toBe(true);
    expect(state().auth.sessionExpired).toBe(false);
    expect(Cookies.get('refresh_token')).toBe('r1'); // still there for the next try
    expect(state().toast.items).toEqual([]); // told to the part of the page that asked, not as a toast
    expect(state().globalError.sectionErrors['fetch-cart']).toBe('Could not reach the server. Please try again.');
  });
});

describe('When the app opens', () => {
  it('turns a signed-in flag without a refresh cookie into a guest, quietly, and drops the account copy of the cart', () => {
    signIn();
    Cookies.remove('access_token');
    Cookies.remove('refresh_token'); // e.g. the browser cleared them
    store.dispatch(addToCart(ITEM));

    store.dispatch(restoreSession());

    expect(state().auth.isAuthenticated).toBe(false);
    expect(state().auth.sessionExpired).toBe(false); // nothing to announce on a page that just opened
    expect(state().cart.cartItems).toEqual([]);
  });

  it('keeps a customer signed in from their refresh token, even when the access token is gone', () => {
    store.dispatch(sessionRefreshed({access: 'x', refresh: 'y'})); // the flag was persisted as signed in
    Cookies.set('refresh_token', 'R');
    Cookies.remove('access_token');

    store.dispatch(restoreSession());

    expect(state().auth.isAuthenticated).toBe(true);
    expect(state().auth.refreshToken).toBe('R');
    expect(state().auth.accessToken).toBeNull(); // the first request that needs it renews it
  });

  it('leaves a guest and their cart alone', () => {
    store.dispatch(addToCart(ITEM));

    store.dispatch(restoreSession());

    expect(state().auth.isAuthenticated).toBe(false);
    expect(state().cart.cartItems).toHaveLength(1);
  });
});

describe('The cookies', () => {
  it('last as long as the backend refresh token (30 days), not just until the browser closes', () => {
    const set = vi.spyOn(Cookies, 'set');

    saveTokens({access: 'a', refresh: 'r'});

    expect(set).toHaveBeenCalledWith('refresh_token', 'r', {expires: 30, secure: false, sameSite: 'Strict'}); // plain http in tests/dev
    expect(set).toHaveBeenCalledWith('access_token', 'a', {expires: 30, secure: false, sameSite: 'Strict'});
  });
});

describe('The session expired banner', () => {
  const renderBanner = (auth, url = '/cart') => {
    const bannerStore = configureStore({
      reducer: {auth: authReducer},
      preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), ...auth}},
    });
    render(<Provider store={bannerStore}><MemoryRouter initialEntries={[url]}><SessionExpiredBanner /></MemoryRouter></Provider>);
    return bannerStore;
  };

  it('says so and offers to sign in again, on any page', () => {
    renderBanner({sessionExpired: true});
    expect(screen.getByText(/Your session expired/)).toBeTruthy();
    expect(screen.getByText('Sign in').getAttribute('href')).toBe('/signin');
  });

  it('goes away when dismissed', () => {
    const bannerStore = renderBanner({sessionExpired: true});
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText(/Your session expired/)).toBeNull();
    expect(bannerStore.getState().auth.sessionExpired).toBe(false);
  });

  it('is not there when nothing expired, when they are signed in again, or on the sign-in pages (which say it themselves)', () => {
    renderBanner({sessionExpired: false});
    expect(screen.queryByText(/Your session expired/)).toBeNull();
    cleanup();
    renderBanner({sessionExpired: true, isAuthenticated: true});
    expect(screen.queryByText(/Your session expired/)).toBeNull();
    cleanup();
    renderBanner({sessionExpired: true}, '/signin');
    expect(screen.queryByText(/Your session expired/)).toBeNull();
    cleanup();
    renderBanner({sessionExpired: true}, '/verify-otp/abc');
    expect(screen.queryByText(/Your session expired/)).toBeNull();
  });
});
