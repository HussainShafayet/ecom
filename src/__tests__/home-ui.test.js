// The pieces every homepage section is built from: the title row (SectionHeader), the titled list of product cards
// (ProductSection, a grid or a phone-friendly swipe row) and the recently viewed list built from them.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import recentlyViewedReducer, {recordViewed} from '../redux/slice/recentlyViewedSlice';
import {ProductSection, SectionHeader} from '../components/common';
import {RecentlyViewed} from '../components/sections';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, image: '', base_price: 100 * id, has_discount: false,
  availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0,
});

const makeStore = () => configureStore({
  reducer: {cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, recentlyViewed: recentlyViewedReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderWithStore = (ui, store = makeStore()) => ({
  store,
  ...render(<Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>),
});

beforeEach(() => {
  cleanup();
});

describe('SectionHeader', () => {
  it('shows the title, the subtitle and a View All link that stays in the same tab', () => {
    renderWithStore(<SectionHeader title="Flash Sale" subtitle="Deals" to="/products/flash-sale" />);
    expect(screen.getByRole('heading', {name: 'Flash Sale'})).toBeTruthy();
    expect(screen.getByText('Deals')).toBeTruthy();
    const link = screen.getByText('View All').closest('a');
    expect(link.getAttribute('href')).toBe('/products/flash-sale');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('draws no link without a destination, and no subtitle without one', () => {
    renderWithStore(<SectionHeader title="Recommended" />);
    expect(screen.queryByText('View All')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('ProductSection', () => {
  it('draws the title row and one card per product', () => {
    renderWithStore(<ProductSection title="Best Selling" to="/products/best-selling" products={[PRODUCT(1), PRODUCT(2), PRODUCT(3)]} />);
    expect(screen.getByRole('heading', {name: 'Best Selling'})).toBeTruthy();
    expect(screen.getAllByText(/^Product \d$/)).toHaveLength(3);
    expect(screen.getByText('View All').closest('a').getAttribute('href')).toBe('/products/best-selling');
  });

  it('draws nothing when there is nothing to show', () => {
    const {container, unmount} = renderWithStore(<ProductSection title="Best Selling" products={[]} />);
    expect(container.innerHTML).toBe('');
    unmount();
    const second = renderWithStore(<ProductSection title="Best Selling" />);
    expect(second.container.innerHTML).toBe('');
  });

  it('is a plain grid by default and a snapping swipe row on a phone when asked', () => {
    const grid = renderWithStore(<ProductSection title="A" products={[PRODUCT(1)]} />);
    expect(grid.container.querySelector('.grid').className).not.toContain('snap-x');
    grid.unmount();

    const row = renderWithStore(<ProductSection title="A" products={[PRODUCT(1)]} carousel />);
    const list = row.container.querySelector('.snap-x');
    expect(list.className).toContain('overflow-x-auto');
    expect(list.className).toContain('md:grid'); // and the same grid from tablet width up
  });
});

describe('the homepage', () => {
  it('lists what the shopper looked at recently, and nothing before they looked at anything', () => {
    const {store, container} = renderWithStore(<RecentlyViewed />);
    expect(container.innerHTML).toBe('');
    act(() => { store.dispatch(recordViewed(PRODUCT(7))); });
    expect(screen.getByRole('heading', {name: 'Recently Viewed'})).toBeTruthy();
    expect(screen.getByText('Product 7')).toBeTruthy();
  });
});
