// The admin's mid-page banner on the Home page, and the words on a slide's button (backend `apps/content`: `mid_banner`, `cta_label`).
// Swiper needs a real browser, so it is a stand-in here; the content service is mocked.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import contentReducer, {fetchHomeContent} from '../redux/slice/contentSlice';
import {Slider} from '../components/common';
import {MidBanner} from '../components/sections';
import {getHomeContent} from '../services/contentService';

vi.mock('../services/contentService', async (importOriginal) => ({...(await importOriginal()), getHomeContent: vi.fn()}));
vi.mock('swiper/react', () => ({
  Swiper: ({children}) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

const ITEM = (extra = {}) => ({order: 1, type: 'product', link: 'kettle', external_link: null, media: 'http://shop.test/media/mid.jpg', media_type: 'image', caption: 'Kettles', cta_label: 'Shop Now', ...extra});
const home = (page_content) => ({data: {data: {page_content: {image_sliders: [], video_sliders: [], left_banner: null, right_banner: null, mid_banner: null, ...page_content}}}});

const makeStore = (content = {}) => configureStore({
  reducer: {content: contentReducer},
  preloadedState: {content: {...contentReducer(undefined, {type: '@@init'}), ...content}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderWith = (ui, store = makeStore()) => ({store, ...render(<Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>)});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The mid-page banner in the store', () => {
  it('comes with the home content, and is gone when the home content fails', async () => {
    getHomeContent.mockResolvedValue(home({mid_banner: ITEM()}));
    const store = makeStore();
    await store.dispatch(fetchHomeContent());
    expect(store.getState().content.mid_banner).toMatchObject({link: 'kettle', cta_label: 'Shop Now'});

    getHomeContent.mockRejectedValue(new Error('offline'));
    await store.dispatch(fetchHomeContent());
    expect(store.getState().content.mid_banner).toBeNull();
  });

  it('is null from a backend that does not send one', async () => {
    getHomeContent.mockResolvedValue({data: {data: {page_content: {image_sliders: [], video_sliders: [], left_banner: null, right_banner: null}}}});
    const store = makeStore();
    await store.dispatch(fetchHomeContent());
    expect(store.getState().content.mid_banner).toBeNull();
  });
});

describe('MidBanner', () => {
  it('draws nothing until the admin has put a banner there', () => {
    const {container} = renderWith(<MidBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('is one picture that leads where the admin chose, with the headline and the button over it', () => {
    renderWith(<MidBanner />, makeStore({mid_banner: ITEM({cta_label: 'See the deals'})}));

    const picture = screen.getByAltText('Kettles');
    expect(picture.getAttribute('src')).toBe('http://shop.test/media/mid.jpg');
    expect(picture.closest('a').getAttribute('href')).toBe('/products/detail/kettle');
    expect(screen.getByText('Kettles')).toBeTruthy(); // the headline
    expect(screen.getByText('See the deals')).toBeTruthy(); // and the button says what they wrote
    expect(screen.queryByText('Shop Now')).toBeNull();
  });

  it('leaves to another website in a new tab, and to a category in this one', () => {
    renderWith(<MidBanner />, makeStore({mid_banner: ITEM({type: 'external', link: null, external_link: 'https://example.com/sale'})}));
    const external = screen.getByAltText('Kettles').closest('a');
    expect(external.getAttribute('href')).toBe('https://example.com/sale');
    expect(external.getAttribute('target')).toBe('_blank');
    cleanup();

    renderWith(<MidBanner />, makeStore({mid_banner: ITEM({type: 'category', link: 'shoes'})}));
    expect(screen.getByAltText('Kettles').closest('a').getAttribute('href')).toBe('/products/?category=shoes');
  });

  it('has no button when the admin cleared its words, and no text at all without a headline either', () => {
    renderWith(<MidBanner />, makeStore({mid_banner: ITEM({cta_label: ''})}));
    expect(screen.getByText('Kettles')).toBeTruthy();
    expect(screen.queryByText('Shop Now')).toBeNull();
    cleanup();

    const {container} = renderWith(<MidBanner />, makeStore({mid_banner: ITEM({caption: '', cta_label: ''})}));
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('span.rounded-full')).toBeNull();
    expect(screen.getByAltText('Promotion')).toBeTruthy(); // a real alt text, not nothing
  });

  it('holds its place while the picture loads', () => {
    const {container} = renderWith(<MidBanner />, makeStore({mid_banner: ITEM()}));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    fireEvent.load(screen.getByAltText('Kettles'));
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });
});

describe('The button on a slide', () => {
  const SLIDE = (order, extra = {}) => ({order, type: 'product', link: `product-${order}`, external_link: null, media: `/slide-${order}.jpg`, media_type: 'image', caption: '', ...extra});

  it('says what the admin wrote', () => {
    renderWith(<Slider image_sliders={[SLIDE(1, {caption: 'Big Sale', cta_label: 'See the deals'})]} />);
    expect(screen.getByText('See the deals')).toBeTruthy();
    expect(screen.queryByText('Shop Now')).toBeNull();
  });

  it('is "Shop Now" from the backend\'s default, and for an older backend that sends no words, when the slide has a headline', () => {
    renderWith(<Slider image_sliders={[SLIDE(1, {caption: 'Big Sale', cta_label: 'Shop Now'}), SLIDE(2, {caption: 'Old backend'}), SLIDE(3)]} />);
    expect(screen.getAllByText('Shop Now')).toHaveLength(2); // (the third has neither a headline nor words)
  });

  it('is not drawn when the admin left the words empty, and the headline stays', () => {
    renderWith(<Slider image_sliders={[SLIDE(1, {caption: 'Big Sale', cta_label: ''})]} />);
    expect(screen.getByText('Big Sale')).toBeTruthy();
    expect(screen.queryByText('Shop Now')).toBeNull();
  });

  it('can be a button without a headline', () => {
    renderWith(<Slider image_sliders={[SLIDE(1, {caption: '', cta_label: 'Look'})]} />);
    expect(screen.getByText('Look')).toBeTruthy();
  });
});
