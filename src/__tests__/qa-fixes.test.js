// What a live QA run of the shop found (phone size, the real backend): a double tap on Place Order made two orders, the categories page had
// badges at the wrong place and a React key warning, the review stars could not be used without a finger, and a malformed answer could
// throw inside a reducer.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import checkoutReducer, {handleCheckout} from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import categoryReducer from '../redux/slice/categorySlice';
import contentReducer from '../redux/slice/contentSlice';
import pageTitleReducer from '../redux/slice/pageTitleSlice';
import reviewReducer from '../redux/slice/reviewSlice';
import bestSellingReducer, {fetchBestSellingProducts} from '../redux/slice/product/bestSellingSlice';
import newArrivalReducer, {fetchNewArrivalProducts} from '../redux/slice/product/newArrivalSlice';
import flashSaleReducer, {fetchFlashSaleProducts} from '../redux/slice/product/flashSaleSlice';
import productReducer, {fetchAllProducts, fetchFeaturedProducts} from '../redux/slice/productSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {getAllCategories, getBestSellingCategories, getFeaturedCategories, getFlashSaleCategories, getNewArrivalCategories} from '../services/categoryService';
import {getCategoriesContent} from '../services/contentService';
import Categories from '../pages/Categories';
import RatingAndReview from '../components/common/product/RatingAndReview';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/categoryService', () => ({
  getAllCategories: vi.fn(), getFlashSaleCategories: vi.fn(), getNewArrivalCategories: vi.fn(), getBestSellingCategories: vi.fn(), getFeaturedCategories: vi.fn(),
}));
vi.mock('../services/contentService', async (importOriginal) => ({...(await importOriginal()), getCategoriesContent: vi.fn()}));

const init = (reducer) => reducer(undefined, {type: '@@init'});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

// --- one order at a time ----------------------------------------------------------------------------------------------
describe('Place Order', () => {
  const BODY = {name: 'Rahim', items: []};
  const makeStore = () => configureStore({
    reducer: {checkout: checkoutReducer, cart: cartReducer, auth: authReducer},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });

  it('sends ONE order when it is asked twice in the same instant (a double tap, a retry)', async () => {
    publicApi.post.mockResolvedValue({data: {success: true, data: {order_id: 'GC-1'}}});
    const store = makeStore();

    const first = store.dispatch(handleCheckout(BODY));
    const second = store.dispatch(handleCheckout(BODY));
    await Promise.all([first, second]);

    expect(publicApi.post).toHaveBeenCalledTimes(1);
    expect(store.getState().checkout.order_id).toBe('GC-1');
  });

  it('allows another attempt once the first one has been answered (a refused order can be fixed and sent again)', async () => {
    publicApi.post.mockRejectedValueOnce({response: {data: {success: false, errors: ['Only 1 of Mug left in stock.']}}});
    publicApi.post.mockResolvedValueOnce({data: {success: true, data: {order_id: 'GC-2'}}});
    const store = makeStore();

    await store.dispatch(handleCheckout(BODY));
    expect(store.getState().checkout.responseError).toEqual(['Only 1 of Mug left in stock.']);
    await store.dispatch(handleCheckout(BODY));

    expect(publicApi.post).toHaveBeenCalledTimes(2);
    expect(store.getState().checkout.order_id).toBe('GC-2');
  });
});

// --- the categories page ------------------------------------------------------------------------------------------------
describe('The categories page', () => {
  const tiles = (prefix, discounted) => [
    {id: 1, name: `${prefix} One`, slug: `${prefix}-one`, image: '/a.jpg', has_discount: discounted, discount_amount: 20, discount_type: 'percentage'},
    {id: 2, name: `${prefix} Two`, slug: `${prefix}-two`, image: '/b.jpg', has_discount: false},
  ];
  const answer = (results) => Promise.resolve({data: {data: {results}}});

  const renderPage = () => {
    getFlashSaleCategories.mockReturnValue(answer(tiles('Flash', true)));
    getNewArrivalCategories.mockReturnValue(answer(tiles('New', true)));
    getBestSellingCategories.mockReturnValue(answer(tiles('Best', true)));
    getFeaturedCategories.mockReturnValue(answer(tiles('Featured', true)));
    getAllCategories.mockReturnValue(answer([]));
    getCategoriesContent.mockResolvedValue({data: {data: {image_sliders: [], right_banner: null}}});
    const store = configureStore({
      reducer: {category: categoryReducer, content: contentReducer, pageTitle: pageTitleReducer},
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    });
    return render(<Provider store={store}><MemoryRouter><Categories /></MemoryRouter></Provider>);
  };

  it('puts a discount badge ON its own category card, in every list', async () => {
    renderPage();
    const badges = await screen.findAllByText('20% OFF');
    expect(badges).toHaveLength(4);
    badges.forEach((badge) => {
      const card = badge.closest('.relative');
      expect(card.querySelector('img')).not.toBeNull(); // the badge is inside the card with the picture, not beside it
    });
  });

  it('gives React a key for every tile (it warned about a missing one)', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage();
    await screen.findAllByText('20% OFF');
    const keyWarnings = errors.mock.calls.filter((call) => String(call[0]).includes('unique "key"'));
    expect(keyWarnings).toHaveLength(0);
  });
});

// --- the review stars -----------------------------------------------------------------------------------------------------
describe('The review stars', () => {
  const renderForm = async () => {
    api.get.mockResolvedValue({data: {data: {count: 0, next: null, previous: null, results: [], can_review: true, review_status: 'can_review', order_id: null}}});
    const store = configureStore({
      reducer: {review: reviewReducer, auth: authReducer},
      preloadedState: {auth: {...init(authReducer), isAuthenticated: true}},
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    });
    render(<Provider store={store}><MemoryRouter><RatingAndReview product={{id: 23}} /></MemoryRouter></Provider>);
    return screen.findByRole('radiogroup', {name: /Your Rating/});
  };

  it('are five radio buttons a keyboard and a screen reader can reach, named by what they are worth', async () => {
    const group = await renderForm();
    const radios = [...group.querySelectorAll('[role="radio"]')];
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual(['1 star', '2 stars', '3 stars', '4 stars', '5 stars']);
    expect(radios.every((radio) => radio.tagName === 'BUTTON' && radio.type === 'button')).toBe(true);
    expect(radios.every((radio) => radio.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('choose the rating, and only that one is checked', async () => {
    const group = await renderForm();
    fireEvent.click(screen.getByRole('radio', {name: '4 stars'}));

    expect(screen.getByRole('radio', {name: '4 stars'}).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', {name: '5 stars'}).getAttribute('aria-checked')).toBe('false');
    expect(group.querySelectorAll('[aria-checked="true"]')).toHaveLength(1);
  });
});

// --- an answer without data ---------------------------------------------------------------------------------------------------
describe('A list answer that has no data', () => {
  const cases = [
    ['best selling', bestSellingReducer, fetchBestSellingProducts, 'best_selling'],
    ['new arrivals', newArrivalReducer, fetchNewArrivalProducts, 'new_arrival'],
    ['flash sale', flashSaleReducer, fetchFlashSaleProducts, 'flash_sale'],
    ['all products', productReducer, fetchAllProducts, 'items'],
    ['featured', productReducer, fetchFeaturedProducts, 'featured'],
  ];

  it.each(cases)('does not throw inside the %s reducer, and leaves a list (page 1 and "Load more")', (name, reducer, thunk, field) => {
    const fulfilled = (state, page) => {
      const action = thunk.fulfilled({}, 'r1', {page}); // the answer has no `data`
      action.meta.requestId = 'r1';
      return reducer(state, action);
    };
    let state = {...init(reducer), listRequestId: 'r1'};

    expect(() => fulfilled(state, 1)).not.toThrow();
    expect(fulfilled(state, 1)[field]).toEqual([]);

    state = {...state, [field]: [{id: 1}]};
    expect(() => fulfilled(state, 2)).not.toThrow();
    expect(fulfilled(state, 2)[field]).toEqual([{id: 1}]);
  });
});
