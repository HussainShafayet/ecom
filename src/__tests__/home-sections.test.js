// The homepage's "Shop by Category" banners replaced the old horizontal scroller: the category name is always
// readable (a permanent gradient, not a hover-only overlay with no background), and the discount badge sits
// inside its own card instead of escaping into the row (see docs/spec/04-components-ui.md).
import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import categoryReducer from '../redux/slice/categorySlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import CategoriesSection from '../components/sections/CategoriesSection';
import {getAllCategories} from '../services/categoryService';

vi.mock('../services/categoryService', () => ({
  getAllCategories: vi.fn(),
  getFlashSaleCategories: vi.fn(),
  getNewArrivalCategories: vi.fn(),
  getBestSellingCategories: vi.fn(),
  getFeaturedCategories: vi.fn(),
}));

const CATEGORY = (id, overrides = {}) => ({
  id, name: `Category ${id}`, slug: `category-${id}`, image: 'https://example.com/x.jpg', has_discount: false, ...overrides,
});

const results = (categories) => ({data: {data: {results: categories}}});

const renderSection = () => render(
  <Provider store={configureStore({
    reducer: {category: categoryReducer, globalError: globalErrorReducer},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  })}>
    <MemoryRouter>
      <CategoriesSection />
    </MemoryRouter>
  </Provider>
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The Shop by Category homepage section', () => {
  it('shows every category name without needing a hover', async () => {
    getAllCategories.mockResolvedValue(results([CATEGORY(1, {name: 'Electronics'}), CATEGORY(2, {name: 'Fashion'})]));
    renderSection();
    expect(await screen.findByText('Electronics')).toBeTruthy();
    expect(screen.getByText('Fashion')).toBeTruthy();
  });

  it('shows the discount badge on a category that has one, and not on one that does not', async () => {
    getAllCategories.mockResolvedValue(results([
      CATEGORY(1, {name: 'Electronics', has_discount: true, discount_amount: 10, discount_type: 'percentage'}),
      CATEGORY(2, {name: 'Fashion'}),
    ]));
    renderSection();
    expect(await screen.findByText('10% OFF')).toBeTruthy();
  });

  it('draws nothing when there are no categories', async () => {
    getAllCategories.mockResolvedValue(results([]));
    const {container} = renderSection();
    await waitFor(() => expect(getAllCategories).toHaveBeenCalled());
    await waitFor(() => expect(container.textContent).toBe(''));
  });
});
