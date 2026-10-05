// The banner at the top of a sale page (/products/flash-sale, new-arrival, best-selling, featured): the page's slider with the right banner
// beside it. One `RouteBanner` serves all four pages (each used to carry its own copy). Real slices, mocked services.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import productReducer from '../redux/slice/productSlice';
import newArrivalReducer from '../redux/slice/product/newArrivalSlice';
import bestSellingReducer from '../redux/slice/product/bestSellingSlice';
import flashSaleReducer from '../redux/slice/product/flashSaleSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import {getBestSellingProducts, getFeaturedProducts, getFlashSaleProducts, getNewArrivalProducts} from '../services/productService';
import {getBestSellingContent, getFeaturedContent, getFlashSaleContent, getNewArrivalContent} from '../services/contentService';
import RouteBanner from '../components/sections/RouteBanner';
import BestSelling from '../components/sections/BestSelling';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import FlashSale from '../components/sections/FlashSale';
import NewArrival from '../components/sections/NewArrival';

vi.setConfig({testTimeout: 15000});

vi.mock('../services/productService', async (importOriginal) => ({
  ...(await importOriginal()), getBestSellingProducts: vi.fn(), getFeaturedProducts: vi.fn(), getNewArrivalProducts: vi.fn(), getFlashSaleProducts: vi.fn(),
}));
vi.mock('../services/contentService', async (importOriginal) => ({
  ...(await importOriginal()), getBestSellingContent: vi.fn(), getFeaturedContent: vi.fn(), getNewArrivalContent: vi.fn(), getFlashSaleContent: vi.fn(),
}));

const SLIDE = {id: 1, media: 'http://localhost:8000/media/slide.png', media_type: 'image', caption: 'Big sale', link: 'x', type: 'category'};
const IMAGE_BANNER = {id: 2, media: 'http://localhost:8000/media/banner.png', media_type: 'image', caption: 'Side banner', link: 'summer', type: 'category'};
const VIDEO_BANNER = {id: 3, media: 'http://localhost:8000/media/banner.mp4', media_type: 'video', caption: 'Watch this', link: 'summer', type: 'category'};
const content = (right_banner = null, image_sliders = []) => ({data: {data: {page_content: {image_sliders, video_sliders: [], left_banner: null, right_banner}}}});
const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, sku: `P-${id}`, image: '', base_price: 100, discount_price: 100, has_discount: false, brand_name: 'Acme',
  variant_id: id, availability_status: true, has_variants: false, avg_rating: 0, total_reviews: 0, total_views: 1, total_orders: 1,
});
const products = {data: {data: {count: 1, next: null, previous: null, results: [PRODUCT(1)]}}};

const makeStore = (preloaded) => configureStore({
  reducer: {
    product: productReducer, new_arrival: newArrivalReducer, best_selling: bestSellingReducer, flash_sale: flashSaleReducer, content: contentReducer,
    cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer,
  },
  preloadedState: preloaded,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const withContent = (right_banner, image_sliders = []) => ({content: {...contentReducer(undefined, {type: '@@init'}), right_banner, image_sliders}});
const renderBanner = (right_banner, image_sliders) => render(
  <Provider store={makeStore(withContent(right_banner, image_sliders))}><MemoryRouter><RouteBanner /></MemoryRouter></Provider>
);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  for (const fetch of [getBestSellingProducts, getNewArrivalProducts, getFeaturedProducts, getFlashSaleProducts]) fetch.mockResolvedValue(products);
});

describe('The banner', () => {
  it('shows a picture banner as a link, with a blurred place-holder until the picture has loaded', () => {
    renderBanner(IMAGE_BANNER);

    const picture = screen.getByAltText('Side banner');
    expect(picture.getAttribute('src')).toBe(IMAGE_BANNER.media);
    expect(picture.closest('a').getAttribute('href')).toBe('/products/?category=summer');
    expect(picture.className).toContain('opacity-0');
    expect(screen.getByAltText('Loading')).toBeTruthy();

    fireEvent.load(picture);

    expect(screen.queryByAltText('Loading')).toBeNull();
    expect(picture.className).toContain('opacity-100');
  });

  it('shows a video banner muted and looping, with its caption as the link (or "Click" without one)', () => {
    const {container} = renderBanner(VIDEO_BANNER);
    const video = container.querySelector('video');
    expect(video.getAttribute('src')).toBe(VIDEO_BANNER.media);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(screen.getByRole('link', {name: 'Watch this'}).getAttribute('href')).toBe('/products/?category=summer');
    cleanup();

    renderBanner({...VIDEO_BANNER, caption: ''});
    expect(screen.getByRole('link', {name: 'Click'})).toBeTruthy();
  });

  it('draws the slider beside it, and nothing of a banner there is none', () => {
    const {container} = renderBanner(null, [SLIDE]);
    expect(container.querySelector('.swiper')).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByAltText('Loading')).toBeNull();
  });
});

describe.each([
  ['flash sale', FlashSale, getFlashSaleContent],
  ['new arrival', NewArrival, getNewArrivalContent],
  ['best selling', BestSelling, getBestSellingContent],
  ['featured', FeaturedProducts, getFeaturedContent],
])('The %s page', (_, Section, fetchContent) => {
  const render_ = (forRoute) => render(<Provider store={makeStore()}><MemoryRouter><Section forRoute={forRoute} /></MemoryRouter></Provider>);

  it('draws the banner when it is a page of its own, from the content it fetched', async () => {
    fetchContent.mockResolvedValue(content(IMAGE_BANNER));
    render_(true);

    expect(await screen.findByAltText('Side banner')).toBeTruthy();
    expect(fetchContent).toHaveBeenCalled();
  });

  it('draws no banner as a section of the home page, and does not ask for one', async () => {
    fetchContent.mockResolvedValue(content(IMAGE_BANNER));
    render_(false);

    expect(await screen.findAllByText('Product 1')).toHaveLength(1);
    await waitFor(() => expect(screen.queryByAltText('Side banner')).toBeNull());
    expect(fetchContent).not.toHaveBeenCalled();
  });
});
