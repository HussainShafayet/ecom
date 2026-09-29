// How the storefront tells the customer that something failed: never a page-wide screen, but the sentence in the part of
// the page that asked (with a Try again), a toast for what belongs to no part, an offline bar, a quiet second and third
// try for reads, and the backend's own words when it explained the refusal. Real store and real axios clients; only the
// network (the axios adapters) is replaced.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';
import {AxiosError} from 'axios';

import store from '../redux/store';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {apiErrorMessage} from '../api/errors';
import toastReducer, {dismissToast, pushToast} from '../redux/slice/toastSlice';
import globalErrorReducer, {clearAllErrors, setSectionError} from '../redux/slice/globalErrorSlice';
import flashSaleReducer from '../redux/slice/product/flashSaleSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import {getFlashSaleProducts} from '../services/productService';
import {SectionError, Toaster} from '../components/common';
import {OfflineBanner} from '../components/layout';
import FlashSale from '../components/sections/FlashSale';

vi.mock('../services/productService', async (importOriginal) => ({
  ...(await importOriginal()),
  getFlashSaleProducts: vi.fn(),
}));

const state = () => store.getState();

// What an adapter answers with: a response, or the AxiosError a bad status becomes; no `status` = no answer at all
const respond = (config, status, data = {}, headers = {}) => {
  if (status === undefined) return Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config));
  const response = {data, status, statusText: '', headers, config};
  if (status < 400) return Promise.resolve(response);
  return Promise.reject(new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response));
};

// Runs a request to its end, however many quiet tries that takes (the pauses are fake time)
const settle = async (request) => {
  const outcome = request.then((response) => ({response}), (error) => ({error}));
  await vi.advanceTimersByTimeAsync(3000);
  return outcome;
};

beforeEach(() => {
  vi.useFakeTimers();
  store.dispatch(clearAllErrors());
  state().toast.items.forEach(({id}) => store.dispatch(dismissToast(id)));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanup();
});

describe('The sentence for a failed request', () => {
  const failed = (status, data, headers) => ({response: {status, data, headers}});

  it('is the backend\'s own words when it explained a refusal', () => {
    expect(apiErrorMessage(failed(404, {errors: ['Product not found.']}))).toBe('Product not found.');
    expect(apiErrorMessage(failed(400, {error: 'Only 1 of Kettle left in stock.', errors: ['Only 1 of Kettle left in stock.']}))).toBe('Only 1 of Kettle left in stock.');
  });

  it('is a general sentence when the backend said nothing useful, and never a technical one', () => {
    expect(apiErrorMessage(failed(404, {}))).toBe('We could not find what you were looking for.');
    expect(apiErrorMessage(failed(400, {}))).toBe('Invalid request. Please check your input.');
    expect(apiErrorMessage(failed(403, {}))).toBe('You do not have permission to do that.');
    expect(apiErrorMessage(failed(418, {}))).toBe('Something went wrong. Please try again.');
  });

  it('blames the shop, not the customer, for a server error, whatever the server said', () => {
    expect(apiErrorMessage(failed(500, {errors: ['Traceback...']}))).toBe('Something went wrong on our side. Please try again in a moment.');
    expect(apiErrorMessage(failed(503, {}))).toBe('Something went wrong on our side. Please try again in a moment.');
  });

  it('says how long to wait when the server said so (429 with Retry-After)', () => {
    expect(apiErrorMessage(failed(429, {}, {'retry-after': '30'}))).toBe('Too many requests. Please try again in 30 seconds.');
    expect(apiErrorMessage(failed(429, {}, {}))).toBe('Too many requests. Please try again in a moment.');
  });

  it('is about the connection when there was no answer at all', () => {
    expect(apiErrorMessage({})).toBe('Could not reach the server. Check your connection and try again.');
  });
});

describe('A failed read', () => {
  it('is tried again quietly, and nobody hears of it when the next try works', async () => {
    let calls = 0;
    api.defaults.adapter = vi.fn((config) => (++calls === 1 ? respond(config) : respond(config, 200, {ok: true})));

    const {response} = await settle(api.get('/products', {section: 'products'}));

    expect(response.status).toBe(200);
    expect(api.defaults.adapter).toHaveBeenCalledTimes(2);
    expect(state().globalError.sectionErrors).toEqual({});
    expect(state().toast.items).toEqual([]);
  });

  it('is given up after two more tries, and then the part of the page that asked is told', async () => {
    api.defaults.adapter = vi.fn((config) => respond(config));

    const {error} = await settle(api.get('/products', {section: 'products'}));

    expect(error).toBeTruthy();
    expect(api.defaults.adapter).toHaveBeenCalledTimes(3); // the request + 2 tries
    expect(state().globalError.sectionErrors.products).toBe('Could not reach the server. Check your connection and try again.');
    expect(state().toast.items).toEqual([]);
  });

  it('is tried again for a 503 too, but not for a refusal like a 404', async () => {
    api.defaults.adapter = vi.fn((config) => respond(config, 503));
    await settle(api.get('/products', {section: 'products'}));
    expect(api.defaults.adapter).toHaveBeenCalledTimes(3);

    api.defaults.adapter = vi.fn((config) => respond(config, 404, {errors: ['Product not found.']}));
    await settle(api.get('/products/x', {section: 'product-details'}));
    expect(api.defaults.adapter).toHaveBeenCalledTimes(1);
    expect(state().globalError.sectionErrors['product-details']).toBe('Product not found.');
  });

  it('is never repeated when it is a write (asking twice could order twice)', async () => {
    api.defaults.adapter = vi.fn((config) => respond(config, 503));
    await settle(api.post('/orders/', {}, {section: 'checkout'}));
    expect(api.defaults.adapter).toHaveBeenCalledTimes(1);
  });
});

describe('Telling the customer', () => {
  it('goes to the part of the page that asked, in the backend\'s words, and never becomes a page-wide screen', async () => {
    api.defaults.adapter = vi.fn((config) => respond(config, 400, {errors: ['Only 1 of Kettle left in stock.']}));

    await settle(api.post('/accounts/cart/', {}, {section: 'add-cart'}));

    expect(state().globalError.sectionErrors['add-cart']).toBe('Only 1 of Kettle left in stock.');
    expect(state().globalError.globalError).toBeUndefined(); // there is no such thing any more
    expect(state().toast.items).toEqual([]);
  });

  it('is a toast for a request that names no part of the page', async () => {
    api.defaults.adapter = vi.fn((config) => respond(config, 500));

    await settle(api.post('/somewhere/', {}));

    expect(state().toast.items).toEqual([expect.objectContaining({type: 'error', message: 'Something went wrong on our side. Please try again in a moment.'})]);
    expect(state().globalError.sectionErrors).toEqual({});
  });

  it('is taken back once that part of the page works again', async () => {
    store.dispatch(setSectionError({section: 'products', error: 'Could not reach the server.'}));
    api.defaults.adapter = vi.fn((config) => respond(config, 200, {ok: true}));

    await settle(api.get('/products', {section: 'products'}));

    expect(state().globalError.sectionErrors).toEqual({});
  });

  it('works the same for the public client', async () => {
    publicApi.defaults.adapter = vi.fn((config) => respond(config, 404, {}));
    await settle(publicApi.get('/content/pages/home', {section: 'home-content'}));
    await vi.waitFor(() => expect(state().globalError.sectionErrors['home-content']).toBe('We could not find what you were looking for.'));

    publicApi.defaults.adapter = vi.fn((config) => respond(config, 200, {}));
    await settle(publicApi.get('/content/pages/home', {section: 'home-content'}));
    await vi.waitFor(() => expect(state().globalError.sectionErrors).toEqual({}));
  });
});

describe('Toasts', () => {
  const renderToaster = () => {
    const toastStore = configureStore({reducer: {toast: toastReducer}});
    render(<Provider store={toastStore}><Toaster /></Provider>);
    return toastStore;
  };

  it('appear over the page and go away by themselves', () => {
    const toastStore = renderToaster();

    act(() => { toastStore.dispatch(pushToast('Could not save that.', 'error', 5000)); });
    expect(screen.getByRole('alert').textContent).toContain('Could not save that.');

    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByText('Could not save that.')).toBeNull();
  });

  it('are one toast, not five, when the same thing happens five times', () => {
    const toastStore = renderToaster();
    act(() => {
      for (let i = 0; i < 5; i += 1) toastStore.dispatch(pushToast('Could not reach the server.', 'error'));
    });
    expect(screen.getAllByText('Could not reach the server.')).toHaveLength(1);
  });

  it('can be dismissed, and good news is not an alert', () => {
    const toastStore = renderToaster();
    act(() => { toastStore.dispatch(pushToast("You're back online.", 'success')); });
    expect(screen.getByRole('status').textContent).toContain("You're back online.");

    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText("You're back online.")).toBeNull();
  });

  it('draw nothing without toasts, and do not need the toast slice to exist', () => {
    const empty = render(<Provider store={configureStore({reducer: {other: (s = {}) => s}})}><Toaster /></Provider>);
    expect(empty.container.innerHTML).toBe('');
  });
});

describe('The offline bar', () => {
  const goOffline = () => {
    Object.defineProperty(window.navigator, 'onLine', {value: false, configurable: true});
    act(() => { window.dispatchEvent(new Event('offline')); });
  };
  const goOnline = () => {
    Object.defineProperty(window.navigator, 'onLine', {value: true, configurable: true});
    act(() => { window.dispatchEvent(new Event('online')); });
  };
  const renderBar = () => {
    const barStore = configureStore({reducer: {toast: toastReducer}});
    render(<Provider store={barStore}><OfflineBanner /><Toaster /></Provider>);
  };

  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {value: true, configurable: true});
  });

  it('appears while there is no connection and is gone, with a "back online" toast, when it returns', () => {
    renderBar();
    expect(screen.queryByText(/You're offline/)).toBeNull();

    goOffline();
    expect(screen.getByRole('alert').textContent).toContain("You're offline");

    goOnline();
    expect(screen.queryByText(/You're offline/)).toBeNull();
    expect(screen.getByText("You're back online.")).toBeTruthy();
  });

  it('is there straight away when the page opens offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {value: false, configurable: true});
    renderBar();
    expect(screen.getByText(/You're offline/)).toBeTruthy();
  });
});

describe('The error card of a part of the page', () => {
  it('says what went wrong and offers Try again, which asks for just that part again', () => {
    const retry = vi.fn();
    render(<SectionError message="Something went wrong on our side." onRetry={retry} />);

    expect(screen.getByRole('alert').textContent).toContain("We couldn't load this.");
    expect(screen.getByText('Something went wrong on our side.')).toBeTruthy();
    fireEvent.click(screen.getByText('Try again'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('offers to reload the page where the part has no way to ask again', () => {
    render(<SectionError message="Not found." />);
    expect(screen.getByText('Reload page')).toBeTruthy();
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('is what the flash sale section shows, and Try again brings the products back', async () => {
    vi.useRealTimers();
    getFlashSaleProducts.mockResolvedValue({data: {data: {results: [{
      id: 1, name: 'Blue Kettle', slug: 'blue-kettle', image: '', base_price: 1200, discount_price: 900, has_discount: false,
      availability_status: true, has_variants: false, variant_id: 3, avg_rating: 0, total_reviews: 0,
    }], next: null}}});
    const sectionStore = configureStore({
      reducer: {flash_sale: flashSaleReducer, content: contentReducer, globalError: globalErrorReducer, cart: cartReducer, auth: authReducer, wishList: wishListReducer},
      preloadedState: {globalError: {sectionErrors: {'flash-sale': 'Something went wrong on our side. Please try again in a moment.'}}},
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    });
    render(<Provider store={sectionStore}><MemoryRouter><FlashSale /></MemoryRouter></Provider>);

    expect(screen.getByText('Something went wrong on our side. Please try again in a moment.')).toBeTruthy();
    expect(screen.queryByText('Blue Kettle')).toBeNull();
    expect(getFlashSaleProducts).toHaveBeenCalledTimes(1); // the one on mount

    fireEvent.click(screen.getByText('Try again'));

    expect(await screen.findByText('Blue Kettle')).toBeTruthy();
    expect(getFlashSaleProducts).toHaveBeenCalledTimes(2);
    expect(sectionStore.getState().globalError.sectionErrors).toEqual({});
  });
});
