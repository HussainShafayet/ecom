// `hasMore` used to be computed from action.meta.arg.limit, but no thunk actually receives a `limit` argument
// (the real param is `page_size`) - so it was always false and the product list's "load more" (InfiniteScroll,
// Products.js) stopped working after the first page even when more products existed. Fixed to read the
// backend's own `next` field instead of guessing from array length.
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';

import productReducer, {fetchAllProducts} from '../redux/slice/productSlice';
import api from '../api/axiosSetup';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn()}}));

const PRODUCT = (id) => ({id, name: `Product ${id}`, slug: `product-${id}`});

const makeStore = () => configureStore({
  reducer: {product: productReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Product list pagination (hasMore)', () => {
  it('is true after a page when the backend says there is a next page', async () => {
    api.get.mockResolvedValueOnce({
      data: {data: {results: [PRODUCT(1), PRODUCT(2)], count: 4, next: 'http://x/products?page=2', previous: null}},
    });
    const store = makeStore();

    await store.dispatch(fetchAllProducts({page: 1, page_size: 2}));

    expect(store.getState().product.hasMore).toBe(true);
    expect(store.getState().product.items).toHaveLength(2);
  });

  it('is false once the last page comes back with no next page, and appends rather than replaces', async () => {
    api.get.mockResolvedValueOnce({
      data: {data: {results: [PRODUCT(1), PRODUCT(2)], count: 4, next: 'http://x/products?page=2', previous: null}},
    });
    const store = makeStore();
    await store.dispatch(fetchAllProducts({page: 1, page_size: 2}));

    api.get.mockResolvedValueOnce({
      data: {data: {results: [PRODUCT(3), PRODUCT(4)], count: 4, next: null, previous: 'http://x/products?page=1'}},
    });
    await store.dispatch(fetchAllProducts({page: 2, page_size: 2}));

    expect(store.getState().product.hasMore).toBe(false);
    expect(store.getState().product.items.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });
});
