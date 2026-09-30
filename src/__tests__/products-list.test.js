// The products page, phone first: what the shopper chose lives in the address, ANY change of it is a new list from its first page
// (the old list is never added to: a new sort after "more" used to show another page of the new list under the old one),
// "Load more" keeps the list on the screen, a new list waits as a skeleton while the title and the controls stay, and every way
// it can come back empty or fail says what to do. Real slices, a mocked client.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

import productReducer, {fetchAllProducts} from '../redux/slice/productSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {getAllProducts} from '../services/productService';
import {DEFAULT_PAGE_SIZE, filterCount, readFilters, withoutFilters} from '../utils/productFilters';
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
const refused = (errors, status = 400) => ({response: {status, headers: {}, data: {success: false, errors}}});
const never = () => new Promise(() => {});

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = (product = {}) => configureStore({
  reducer: {product: productReducer, content: contentReducer, cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, toast: toastReducer},
  preloadedState: {product: {...init(productReducer), ...product}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const Where = () => <p data-testid="where">{useLocation().search}</p>;
const where = () => screen.getByTestId('where').textContent;

// `respond(params)` answers a products request (params = its query), by default the first two products
let respond;
const requested = () => api.get.mock.calls.map(([url]) => url).filter((url) => url.startsWith('/products'));

const renderPage = (url = '/products', store = makeStore()) => {
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Routes><Route path="/products" element={<><Products /><Where /></>} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};
// the page's own skeleton (a product card's picture pulses while it loads too, so `.animate-pulse` alone says nothing)
const skeleton = (container) => container.querySelector('div[aria-hidden="true"].grid');
const click = async (name) => { await act(async () => { fireEvent.click(screen.getByRole('button', {name})); }); };

// A products request is answered by `respond`: a value, a promise, or a throw (which is a refusal)
const reply = (url) => {
  const {pathname, searchParams} = new URL(url, 'http://shop.test');
  if (pathname !== '/products') return Promise.reject(new Error(`unexpected ${url}`));
  try { return Promise.resolve(respond(searchParams)); } catch (thrown) { return Promise.reject(thrown); }
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  respond = () => page([1, 2]);
  api.get.mockImplementation(reply);
  publicApi.get.mockResolvedValue({data: {data: {categories: [], brands: [], tags: [], colors: [], sizes: [], price_range: {}, discounts: []}}});
});

describe('The list', () => {
  it('waits as a skeleton, then draws the products two to a row with the title and how many there are', async () => {
    respond = () => page([1, 2, 3, 4], {count: 4});
    const {container} = renderPage();
    expect(skeleton(container)).toBeTruthy(); // from the very first frame
    expect(screen.getByRole('heading', {name: 'All products', level: 1})).toBeTruthy(); // the title does not wait

    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(skeleton(container)).toBeNull();
    expect(screen.getByText('4 products')).toBeTruthy();
    expect(screen.getByText('Product 1').closest('.grid').className).toContain('grid-cols-2');
    expect(requested()[0]).toBe(`/products?page=1&page_size=${DEFAULT_PAGE_SIZE}`);
  });

  it('never draws a list that another page loaded, not even for a frame', async () => {
    const store = makeStore({items: [PRODUCT(77)], listKey: undefined, count: 1});
    api.get.mockImplementation(() => never());
    const {container} = renderPage('/products', store);
    expect(screen.queryByText('Product 77')).toBeNull();
    expect(skeleton(container)).toBeTruthy();
  });

  it('says "1 product" for one', async () => {
    respond = () => page([1], {count: 1});
    renderPage();
    expect(await screen.findByText('1 product')).toBeTruthy();
  });

  it('titles a search and a category', async () => {
    renderPage('/products?search=shirt');
    expect(screen.getByRole('heading', {level: 1}).textContent).toBe('Results for “shirt”');
    cleanup();
    renderPage('/products?category=men-shirts');
    expect(screen.getByRole('heading', {level: 1}).textContent).toBe('men shirts');
  });

  it('ignores a page number in the address: the list always starts at its first page', async () => {
    renderPage('/products?page=3&ordering=-rating');
    await screen.findByText('Product 1');
    expect(requested()[0]).toContain('page=1');
    expect(requested()[0]).not.toContain('page=3');
    expect(requested()[0]).toContain('ordering=-rating');
  });

  it('encodes what it asks for: a brand called "Marks & Spencer" does not end the query', async () => {
    renderPage('/products?brands=Marks%20%26%20Spencer,Acme&search=a%26b');
    await screen.findByText('Product 1');
    expect(requested()[0]).toContain('brands=Marks%20%26%20Spencer,Acme');
    expect(requested()[0]).toContain('search=a%26b');
  });
});

describe('Load more', () => {
  it('adds the next page under the first, and says when there is no more', async () => {
    respond = (params) => (params.get('page') === '2' ? page([3, 4], {count: 4}) : page([1, 2], {next: 'http://x/products?page=2', count: 4}));
    renderPage();
    await screen.findByText('Product 1');
    expect(screen.queryByText(/seen every product/)).toBeNull();

    await click('Load more');
    expect(await screen.findByText('Product 3')).toBeTruthy();
    expect(screen.getByText('Product 1')).toBeTruthy();
    expect(requested()[1]).toContain('page=2');
    expect(screen.queryByRole('button', {name: 'Load more'})).toBeNull();
    expect(screen.getByText(/seen every product/)).toBeTruthy();
  });

  it('keeps the list on the screen while the next page is on its way', async () => {
    respond = (params) => (params.get('page') === '2' ? never() : page([1, 2], {next: 'http://x/products?page=2'}));
    const {container} = renderPage();
    await screen.findByText('Product 1');
    await click('Load more');

    expect(screen.getByRole('button', {name: 'Loading…'}).disabled).toBe(true);
    expect(screen.getByText('Product 1')).toBeTruthy();
    expect(skeleton(container)).toBeNull();
  });

  it('says so when the next page fails, keeps the list, and can be tried again', async () => {
    let fail = true;
    respond = (params) => {
      if (params.get('page') !== '2') return page([1, 2], {next: 'http://x/products?page=2'});
      if (fail) throw refused(['no'], 503);
      return page([3]);
    };
    renderPage();
    await screen.findByText('Product 1');
    await click('Load more');

    expect(screen.getByRole('alert').textContent).toContain('load more products');
    expect(screen.getByText('Product 1')).toBeTruthy();

    fail = false;
    await click('Load more');
    expect(await screen.findByText('Product 3')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('A change of the address is a new list', () => {
  const pages = (params) => {
    if (params.get('ordering') === 'discount_price') return page([9, 8], {count: 2});
    return params.get('page') === '2' ? page([3, 4], {count: 4}) : page([1, 2], {next: 'http://x/products?page=2', count: 4});
  };

  it('replaces the list, not adds to it, when the sort changes after "Load more"', async () => {
    respond = pages;
    renderPage();
    await screen.findByText('Product 1');
    await click('Load more');
    await screen.findByText('Product 3');

    await act(async () => { fireEvent.change(screen.getByLabelText('Sort'), {target: {value: 'discount_price'}}); });
    expect(await screen.findByText('Product 9')).toBeTruthy();
    expect(screen.queryByText('Product 1')).toBeNull();
    expect(screen.queryByText('Product 3')).toBeNull();
    expect(screen.getByText('2 products')).toBeTruthy();

    const last = requested().at(-1);
    expect(last).toContain('page=1'); // the first page of the new list, not page 2 of it
    expect(last).toContain('ordering=discount_price');
    expect(where()).toBe('?ordering=discount_price');
  });

  it('shows the new list as a skeleton (the controls stay) while it loads', async () => {
    respond = (params) => (params.get('ordering') ? never() : page([1, 2]));
    const {container} = renderPage();
    await screen.findByText('Product 1');
    await act(async () => { fireEvent.change(screen.getByLabelText('Sort'), {target: {value: '-rating'}}); });

    expect(screen.queryByText('Product 1')).toBeNull();
    expect(skeleton(container)).toBeTruthy();
    expect(screen.getByLabelText('Sort').value).toBe('-rating');
    expect(screen.getByRole('button', {name: /Filters/})).toBeTruthy();
  });

  it('a slow answer for the old list never lands on the new one', async () => {
    const store = makeStore();
    const slow = {};
    api.get.mockImplementation((url) => new Promise((resolve) => { slow[new URL(url, 'http://x').searchParams.get('ordering') || 'none'] = resolve; }));
    const first = store.dispatch(fetchAllProducts({page: 1, key: 'a'}));
    await vi.waitFor(() => expect(Object.keys(slow)).toHaveLength(1)); // (the test's module loader takes two imports at once badly)
    const second = store.dispatch(fetchAllProducts({page: 1, ordering: '-rating', key: 'b'}));
    await vi.waitFor(() => expect(Object.keys(slow)).toHaveLength(2));

    slow['-rating'](page([5, 6]));
    await second;
    slow.none(page([1, 2]));
    await first;

    expect(store.getState().product.items.map((item) => item.id)).toEqual([5, 6]);
    expect(store.getState().product.listKey).toBe('b');
  });

  it('gives each sort a name a shopper knows, Price being what they pay', async () => {
    renderPage();
    await screen.findByText('Product 1');
    const options = within(screen.getByLabelText('Sort')).getAllByRole('option');
    expect(options.map((option) => [option.value, option.textContent])).toEqual([
      ['', 'Newest'], ['discount_price', 'Price: Low to High'], ['-discount_price', 'Price: High to Low'], ['-rating', 'Top rated'],
    ]);
  });

  it('still shows an older link\'s sort in the box', async () => {
    renderPage('/products?ordering=price');
    await screen.findByText('Product 1');
    expect(screen.getByLabelText('Sort').value).toBe('price');
    expect(within(screen.getByLabelText('Sort')).getByRole('option', {name: 'List price: Low to High'})).toBeTruthy();
  });
});

describe('When there is nothing to show', () => {
  it('says why a first load failed, with the shop\'s own sentence and Try again', async () => {
    let failing = true;
    respond = () => { if (failing) throw refused(['Enter a valid price.']); return page([1, 2]); };
    renderPage();
    expect(await screen.findByText('Enter a valid price.')).toBeTruthy();
    expect(screen.getByRole('heading', {level: 1})).toBeTruthy(); // the page is still there

    failing = false;
    await click('Try again');
    expect(await screen.findByText('Product 1')).toBeTruthy();
  });

  it('says it was the shop, not a raw status line, when the server failed', async () => {
    api.get.mockImplementation(() => Promise.reject(refused([], 503)));
    renderPage();
    expect(await screen.findByText('Something went wrong on our side. Please try again in a moment.')).toBeTruthy();
    expect(screen.queryByText(/status code/)).toBeNull();
  });

  it('offers to clear the filters (and only them) when they match nothing', async () => {
    respond = (params) => (params.get('brands') ? page([]) : page([1, 2]));
    renderPage('/products?brands=Acme&min_price=500&ordering=-rating&search=shirt');
    expect(await screen.findByText('No products match these filters')).toBeTruthy();

    await click('Clear filters');
    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(where()).toBe('?search=shirt&ordering=-rating'); // the search and the sort stay
    expect(requested().at(-1)).not.toContain('brands');
  });

  it('says what a search found nothing for, and goes back to everything', async () => {
    respond = (params) => (params.get('search') ? page([]) : page([1, 2]));
    renderPage('/products?search=zzz');
    expect(await screen.findByText('No results for “zzz”')).toBeTruthy();
    expect(screen.queryByText(/seen every product/)).toBeNull();

    await click('See all products');
    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(where()).toBe('');
  });

  it('is honest about an empty shop', async () => {
    respond = () => page([]);
    renderPage();
    expect(await screen.findByText('No products here yet')).toBeTruthy();
    expect(screen.getByRole('link', {name: 'Back to home'}).getAttribute('href')).toBe('/');
  });
});

describe('The controls', () => {
  it('has a labelled Filters button with the number of chosen filters, only when some are chosen', async () => {
    renderPage();
    await screen.findByText('Product 1');
    expect(screen.getByRole('button', {name: 'Filters'}).className).toContain('h-11');
    expect(screen.queryByLabelText(/chosen/)).toBeNull();

    cleanup();
    renderPage('/products?category=shoes&brands=A,B&min_price=10&search=x&ordering=-rating');
    expect(await screen.findByLabelText('4 chosen')).toBeTruthy(); // the category, two brands, the price range; not the search or the sort
  });

  it('gives the Sort box a visible name and a 44 px height', async () => {
    renderPage();
    await screen.findByText('Product 1');
    expect(screen.getByLabelText('Sort').closest('div').className).toContain('h-11');
  });
});

describe('The address helpers', () => {
  it('read what is chosen', () => {
    const filters = readFilters(new URLSearchParams('category=shoes&brands=A,B&tags= x ,&colors=Red&sizes=M&min_price=10&discount_type=percentage&discount_value=20&search=a&ordering=-rating&page_size=60&page=4'));
    expect(filters).toEqual({
      category: 'shoes', brands: ['A', 'B'], tags: ['x'], colors: ['Red'], sizes: ['M'], min_price: '10', max_price: null,
      discount_type: 'percentage', discount_value: '20', search: 'a', ordering: '-rating', page_size: 60,
    });
    expect(filterCount(filters)).toBe(1 + 2 + 1 + 1 + 1 + 1 + 1);
  });

  it('keep the page size sane and count nothing for an empty address', () => {
    expect(readFilters(new URLSearchParams('page_size=9999')).page_size).toBe(120);
    expect(readFilters(new URLSearchParams('page_size=abc')).page_size).toBe(DEFAULT_PAGE_SIZE);
    expect(filterCount(readFilters(new URLSearchParams('')))).toBe(0);
  });

  it('keep the search, the sort and the page size when the filters go', () => {
    const kept = withoutFilters(new URLSearchParams('brands=A&category=x&search=s&ordering=price&page_size=60&page=2'));
    expect(kept.toString()).toBe('search=s&ordering=price&page_size=60');
  });
});

describe('The products request and the store', () => {
  it('builds an encoded query from only what was asked for', async () => {
    await getAllProducts(30, '-rating', 2, 'men-shirts', ['Marks & Spencer'], ['a'], 100, 0, ['XL'], ['Sky Blue'], 'percentage', 20, 'a b');
    expect(api.get.mock.calls[0][0]).toBe('/products?page=2&page_size=30&ordering=-rating&category=men-shirts&brands=Marks%20%26%20Spencer&tags=a&min_price=100&sizes=XL&colors=Sky%20Blue&discount_type=percentage&discount_value=20&search=a%20b');
  });

  it('keeps how many products there are, and a failure as a sentence', async () => {
    const store = makeStore();
    respond = () => page([1, 2], {count: 57, next: 'x'});
    await store.dispatch(fetchAllProducts({page: 1, key: 'k'}));
    expect(store.getState().product.count).toBe(57);
    expect(store.getState().product.listKey).toBe('k');

    api.get.mockRejectedValue(refused(['Nope.']));
    await store.dispatch(fetchAllProducts({page: 1, key: 'k2'}));
    expect(store.getState().product.error).toBe('Nope.');
    expect(store.getState().product.isLoading).toBe(false);
  });
});
