// Back from a product to the products list: the same list (every page loaded so far) and the same scroll, with no request and no
// skeleton, when it was loaded within the last few minutes. A new visit (a link, another address, an old list) is a new list from page 1.
// Real slices, a mocked client.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Link, MemoryRouter, Route, Routes, useNavigate} from 'react-router-dom';

import productReducer, {fetchAllProducts, restoreProductsList} from '../redux/slice/productSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {recallScroll, rememberScroll, restoreScroll} from '../utils/scrollMemory';
import ScrollToTop from '../components/common/ScrollToTop';
import Products from '../pages/Products';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, sku: `P-${id}`, image: '', base_price: 100, discount_price: 100,
  has_discount: false, brand_name: 'Acme', variant_id: id, availability_status: true, has_variants: false,
  avg_rating: 0, total_reviews: 0, total_views: 1, total_orders: 1,
});
const page = (ids, {next = null, count = ids.length} = {}) => ({data: {data: {results: ids.map(PRODUCT), count, next, previous: null}}});
const init = (reducer) => reducer(undefined, {type: '@@init'});

// What is in the store when the shopper comes Back: the products page's list (three products of the first address, two pages of 40,
// loaded `ageMs` ago) kept in `savedList`, while `items` is what the product page loaded after it (its related products)
const LEFT = (ageMs = 1000, over = {}) => ({
  savedList: {key: '', items: [PRODUCT(1), PRODUCT(2), PRODUCT(3)], page: 2, hasMore: true, count: 40, at: Date.now() - ageMs},
  items: [PRODUCT(90), PRODUCT(91)], listKey: undefined, listPage: 1, hasMore: false, count: 2, ...over,
});
const makeStore = (product = {}) => configureStore({
  reducer: {product: productReducer, content: contentReducer, cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, toast: toastReducer},
  preloadedState: {product: {...init(productReducer), ...product}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const requested = () => api.get.mock.calls.map(([url]) => url).filter((url) => url.startsWith('/products'));
const skeleton = (container) => container.querySelector('div[aria-hidden="true"].grid');

// a scroll box that remembers where it was put
const makeScroller = (top = 0) => {
  const box = document.createElement('div');
  Object.defineProperty(box, 'scrollTop', {writable: true, value: top});
  return box;
};

// `entries` are what MemoryRouter starts with (its first entry counts as arriving by Back/Forward, "POP")
const renderPage = ({store = makeStore(LEFT()), entries = ['/products'], scroller = makeScroller()} = {}) => {
  const Back = () => {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate(-1)}>go back</button>;
  };
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={entries}>
        <Routes>
          <Route path="/" element={<Link to="/products">to the shop</Link>} />
          <Route path="/products" element={<><Products scrollContainerRef={{current: scroller}} /><Back /></>} />
          <Route path="/products/detail/:slug" element={<p>a product</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, scroller, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  api.get.mockImplementation((url) => (url.startsWith('/products') ? Promise.resolve(page([7, 8])) : Promise.reject(new Error(`unexpected ${url}`))));
  publicApi.get.mockResolvedValue({data: {data: {categories: [], brands: [], tags: [], colors: [], sizes: [], price_range: {}, discounts: []}}});
});

describe('Back to the products list', () => {
  it('draws the list that was left, every page of it, with no skeleton and no request, though other products have been loaded since', async () => {
    const {container} = renderPage();

    expect(screen.getByText('Product 1')).toBeTruthy(); // from the very first frame
    expect(screen.queryByText('Product 90')).toBeNull(); // (the related products the product page loaded are not the list)
    expect(screen.getByText('Product 3')).toBeTruthy();
    expect(skeleton(container)).toBeNull();
    expect(screen.getByText('40 products')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Load more'})).toBeTruthy(); // and it still knows there is more
    await act(async () => {});
    expect(requested()).toEqual([]);
  });

  it('asks again for a list that was loaded long ago', async () => {
    const {container} = renderPage({store: makeStore(LEFT(6 * 60 * 1000))});

    expect(skeleton(container)).toBeTruthy();
    expect(screen.queryByText('Product 1')).toBeNull();
    expect(await screen.findByText('Product 7')).toBeTruthy();
    expect(requested()).toHaveLength(1);
  });

  it('asks again when the address is not the one the list was for', async () => {
    renderPage({entries: ['/products?ordering=-rating']});

    expect(await screen.findByText('Product 7')).toBeTruthy();
    expect(requested()[0]).toContain('ordering=-rating');
  });

  it('asks again when nothing was saved (a first visit, or a page reload)', async () => {
    renderPage({store: makeStore()});

    expect(await screen.findByText('Product 7')).toBeTruthy();
    expect(requested()).toHaveLength(1);
  });

  it('is not overwritten by an answer for another page\'s products that was still on its way when the shopper came Back', async () => {
    const {store} = renderPage({store: makeStore(LEFT(1000, {isLoading: true, listRequestId: 'related'}))});
    expect(screen.getByText('Product 1')).toBeTruthy();

    await act(async () => {
      store.dispatch({type: fetchAllProducts.fulfilled.type, payload: {data: [PRODUCT(99)], next: null, count: 1}, meta: {arg: {}, requestId: 'related'}});
    });

    expect(screen.getByText('Product 1')).toBeTruthy();
    expect(screen.queryByText('Product 99')).toBeNull();
  });

  it('is a new list when the shopper arrives by a link, however fresh the old one is', async () => {
    renderPage({entries: ['/']});
    expect(requested()).toEqual([]);

    await act(async () => { fireEvent.click(screen.getByText('to the shop')); });

    expect(await screen.findByText('Product 7')).toBeTruthy(); // not Product 1 of the list that was left
    expect(requested()).toHaveLength(1);
  });

  it('is a new list again once the shopper changes the sort, and Back to the first address asks for it rather than waiting for ever', async () => {
    renderPage();
    expect(screen.getByText('Product 1')).toBeTruthy();

    await act(async () => { fireEvent.change(screen.getByLabelText('Sort'), {target: {value: '-rating'}}); });
    expect(await screen.findByText('Product 7')).toBeTruthy();
    expect(requested()).toHaveLength(1);

    api.get.mockImplementation((url) => (url.startsWith('/products') ? Promise.resolve(page([21, 22])) : Promise.reject(new Error(`unexpected ${url}`))));
    await act(async () => { fireEvent.click(screen.getByText('go back')); });

    expect(await screen.findByText('Product 21')).toBeTruthy(); // not a skeleton that never ends
    expect(requested()).toHaveLength(2);
  });
});

describe('The scroll', () => {
  it('is put back on Back to a list that is shown again', () => {
    rememberScroll('here', 640);
    const scroller = makeScroller(0);

    renderPage({entries: [{pathname: '/products', key: 'here'}], scroller});

    expect(scroller.scrollTop).toBe(640);
  });

  it('starts at the top when the list has to be asked for again', () => {
    rememberScroll('there', 640);
    const scroller = makeScroller(900);

    renderPage({store: makeStore(LEFT(6 * 60 * 1000)), entries: [{pathname: '/products', key: 'there'}], scroller});

    expect(scroller.scrollTop).toBe(0);
  });

  it('is noted as a product is opened', async () => {
    const scroller = makeScroller(900);
    renderPage({entries: [{pathname: '/products', key: 'noted'}], scroller});

    await act(async () => { fireEvent.click(screen.getByText('Product 2')); }); // the card is a link to the product

    expect(recallScroll('noted')).toBe(900);
    expect(screen.getByText('a product')).toBeTruthy();
  });
});

describe('ScrollToTop', () => {
  const renderIt = (entries) => {
    const box = {scrollTo: vi.fn()};
    render(<MemoryRouter initialEntries={entries}><ScrollToTop scrollContainerRef={{current: box}} /></MemoryRouter>);
    return box;
  };

  it('takes a new page to the top', () => {
    expect(renderIt([{pathname: '/orders', key: 'fresh'}]).scrollTo).toHaveBeenCalledWith({top: 0, behavior: 'smooth'});
  });

  it('leaves Back to a page that was scrolled alone: that page puts it back', () => {
    rememberScroll('scrolled', 300);
    expect(renderIt([{pathname: '/products', key: 'scrolled'}]).scrollTo).not.toHaveBeenCalled();
  });
});

describe('restoreScroll', () => {
  it('tries again on the next frames until the page is tall enough', async () => {
    let top = 0;
    let room = 0;
    const box = {get scrollTop() { return top; }, set scrollTop(value) { top = Math.min(value, room); }};
    const frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });

    restoreScroll(box, 500);
    expect(top).toBe(0); // not tall enough yet
    room = 700; // the cards have settled
    frames.shift()();
    expect(top).toBe(500);
    expect(frames).toEqual([]); // and it stops there

    window.requestAnimationFrame.mockRestore();
  });

  it('gives up after a number of frames', () => {
    const box = {scrollTop: 0, get scrollHeight() { return 0; }};
    Object.defineProperty(box, 'scrollTop', {get: () => 0, set: () => {}});
    let count = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { count += 1; callback(); return count; });

    restoreScroll(box, 500, 5);

    expect(count).toBe(5);
    window.requestAnimationFrame.mockRestore();
  });
});

describe('The products list is kept apart from other pages\' products', () => {
  it('is saved when the products page\'s own request is answered, with when', async () => {
    const store = makeStore();
    api.get.mockResolvedValue(page([1, 2], {count: 9}));
    const before = Date.now();
    await store.dispatch(fetchAllProducts({key: 'ordering=-rating', ordering: '-rating'}));

    const {savedList} = store.getState().product;
    expect(savedList).toMatchObject({key: 'ordering=-rating', page: 1, count: 9});
    expect(savedList.items.map((item) => item.id)).toEqual([1, 2]);
    expect(savedList.at).toBeGreaterThanOrEqual(before);
    expect(savedList.at).toBeLessThanOrEqual(Date.now());
  });

  it('grows with every page that was loaded under the same key', async () => {
    const store = makeStore();
    api.get.mockResolvedValueOnce(page([1, 2], {next: 'more', count: 4}));
    await store.dispatch(fetchAllProducts({key: '', page: 1}));
    api.get.mockResolvedValueOnce(page([3, 4], {count: 4}));
    await store.dispatch(fetchAllProducts({key: '', page: 2}));

    const {savedList} = store.getState().product;
    expect(savedList.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    expect(savedList).toMatchObject({page: 2, hasMore: false});
  });

  it('is not touched by products another page loads (related products, the cart\'s suggestions, the home page)', async () => {
    const store = makeStore();
    api.get.mockResolvedValueOnce(page([1, 2]));
    await store.dispatch(fetchAllProducts({key: ''}));
    api.get.mockResolvedValueOnce(page([7, 8]));
    await store.dispatch(fetchAllProducts({category: 'shoes'})); // no key: not the products page

    const {items, savedList, listKey} = store.getState().product;
    expect(items.map((item) => item.id)).toEqual([7, 8]);
    expect(listKey).toBeUndefined();
    expect(savedList.items.map((item) => item.id)).toEqual([1, 2]);

    store.dispatch(restoreProductsList());
    const restored = store.getState().product;
    expect(restored.items.map((item) => item.id)).toEqual([1, 2]);
    expect(restored.listKey).toBe('');
  });
});
