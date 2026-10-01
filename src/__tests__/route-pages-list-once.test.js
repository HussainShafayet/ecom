// The pages of the sale-style sections (/products/best-selling, /new-arrival, /featured; the flash sale's own page is in
// flash-sale-countdown.test.js) list their products once. They used to draw the same array twice: the list, and a "Recommended Products"
// copy of it. Services are mocked.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import productReducer from '../redux/slice/productSlice';
import newArrivalReducer from '../redux/slice/product/newArrivalSlice';
import bestSellingReducer from '../redux/slice/product/bestSellingSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import {getBestSellingProducts, getFeaturedProducts, getNewArrivalProducts} from '../services/productService';
import {getBestSellingContent, getFeaturedContent, getNewArrivalContent} from '../services/contentService';
import BestSelling from '../components/sections/BestSelling';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import NewArrival from '../components/sections/NewArrival';

vi.setConfig({testTimeout: 15000});

vi.mock('../services/productService', async (importOriginal) => ({
  ...(await importOriginal()), getBestSellingProducts: vi.fn(), getFeaturedProducts: vi.fn(), getNewArrivalProducts: vi.fn(),
}));
vi.mock('../services/contentService', async (importOriginal) => ({
  ...(await importOriginal()), getBestSellingContent: vi.fn(), getFeaturedContent: vi.fn(), getNewArrivalContent: vi.fn(),
}));

const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, sku: `P-${id}`, image: '', base_price: 100, discount_price: 100,
  has_discount: false, brand_name: 'Acme', variant_id: id, availability_status: true, has_variants: false,
  avg_rating: 0, total_reviews: 0, total_views: 1, total_orders: 1,
});
const products = {data: {data: {count: 2, next: null, previous: null, results: [PRODUCT(1), PRODUCT(2)]}}};
const content = {data: {data: {image_sliders: [], video_sliders: [], left_banner: null, right_banner: null}}};

const renderPage = (Section) => {
  const store = configureStore({
    reducer: {product: productReducer, new_arrival: newArrivalReducer, best_selling: bestSellingReducer, content: contentReducer, cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });
  return render(<Provider store={store}><MemoryRouter><Section forRoute /></MemoryRouter></Provider>);
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  getBestSellingProducts.mockResolvedValue(products);
  getNewArrivalProducts.mockResolvedValue(products);
  getFeaturedProducts.mockResolvedValue(products);
  getBestSellingContent.mockResolvedValue(content);
  getNewArrivalContent.mockResolvedValue(content);
  getFeaturedContent.mockResolvedValue(content);
});

describe.each([
  ['best selling', BestSelling, 'Best Selling', getBestSellingProducts],
  ['new arrival', NewArrival, 'New Arrival', getNewArrivalProducts],
  ['featured', FeaturedProducts, 'Featured', getFeaturedProducts],
])('The %s page', (_, Section, title, fetchProducts) => {
  it('lists its products once, under its own title', async () => {
    renderPage(Section);

    expect(await screen.findAllByText('Product 1')).toHaveLength(1);
    expect(screen.getAllByText('Product 2')).toHaveLength(1);
    expect(screen.getAllByRole('heading', {name: new RegExp(title, 'i')}).length).toBeGreaterThan(0);
    expect(screen.queryByText('Recommended Products')).toBeNull();
  });

  it('holds a place for one list while it loads, not two', async () => {
    let answer;
    fetchProducts.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
    const {container} = renderPage(Section);

    await waitFor(() => expect(container.querySelector('.animate-pulse')).toBeTruthy());
    expect(container.querySelectorAll('.animate-pulse .my-5')).toHaveLength(1); // the one list's skeleton (+ the hero's, which is not a `my-5`)
    answer(products);
    expect(await screen.findAllByText('Product 1')).toHaveLength(1);
  });
});
