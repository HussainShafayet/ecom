// Recently viewed keeps a capped, deduped list of product snapshots (persisted to localStorage via
// redux-persist), and the homepage section draws nothing until the shopper has actually viewed something.
import React from 'react';
import {beforeEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import recentlyViewedReducer, {recordViewed, clearRecentlyViewed} from '../redux/slice/recentlyViewedSlice';
import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import RecentlyViewed from '../components/sections/RecentlyViewed';

const PRODUCT = (id, overrides = {}) => ({id, name: `Product ${id}`, slug: `product-${id}`, base_price: 100, ...overrides});

describe('recentlyViewedSlice', () => {
  it('adds a newly viewed product to the front', () => {
    const state = recentlyViewedReducer(undefined, recordViewed(PRODUCT(1)));
    expect(state.items.map((p) => p.id)).toEqual([1]);
    expect(state.ids).toEqual({1: 1});
  });

  it('moves an already-viewed product back to the front instead of duplicating it', () => {
    let state = recentlyViewedReducer(undefined, recordViewed(PRODUCT(1)));
    state = recentlyViewedReducer(state, recordViewed(PRODUCT(2)));
    state = recentlyViewedReducer(state, recordViewed(PRODUCT(1)));

    expect(state.items.map((p) => p.id)).toEqual([1, 2]);
    expect(Object.keys(state.ids)).toHaveLength(2);
  });

  it('caps the list at 12, dropping the oldest', () => {
    let state;
    for (let id = 1; id <= 13; id++) {
      state = recentlyViewedReducer(state, recordViewed(PRODUCT(id)));
    }

    expect(state.items).toHaveLength(12);
    expect(state.items.map((p) => p.id)).not.toContain(1);
    expect(state.items[0].id).toBe(13);
    expect(Object.keys(state.ids)).toHaveLength(12);
  });

  it('ignores a payload with no id', () => {
    const state = recentlyViewedReducer(undefined, recordViewed({name: 'No id'}));
    expect(state.items).toHaveLength(0);
  });

  it('clears the list', () => {
    let state = recentlyViewedReducer(undefined, recordViewed(PRODUCT(1)));
    state = recentlyViewedReducer(state, clearRecentlyViewed());
    expect(state.items).toEqual([]);
    expect(state.ids).toEqual({});
  });
});

const makeStore = (items = []) => configureStore({
  reducer: {recentlyViewed: recentlyViewedReducer, auth: authReducer, cart: cartReducer, wishList: wishListReducer},
  preloadedState: {recentlyViewed: {items, ids: Object.fromEntries(items.map((p) => [p.id, p.id]))}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderSection = (items) => render(
  <Provider store={makeStore(items)}>
    <MemoryRouter>
      <RecentlyViewed />
    </MemoryRouter>
  </Provider>
);

beforeEach(() => {
  cleanup();
});

describe('The Recently Viewed homepage section', () => {
  it('draws nothing when nothing has been viewed yet', () => {
    const {container} = renderSection([]);
    expect(container.firstChild).toBeNull();
  });

  it('shows the viewed products once there are some', () => {
    renderSection([PRODUCT(1, {name: 'Blue Shirt'}), PRODUCT(2, {name: 'Red Shoes'})]);
    expect(screen.getByText('Blue Shirt')).toBeTruthy();
    expect(screen.getByText('Red Shoes')).toBeTruthy();
  });
});
