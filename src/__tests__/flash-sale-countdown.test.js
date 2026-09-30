// The flash sale's countdown: the shop says how many seconds are left (measured on ITS clock), the storefront turns that into a moment
// on the phone's clock when the answer arrives and counts down to it from the clock, not by counting ticks (a phone that slept is
// right again when it wakes). When it reaches zero the shop is asked what is true now. No window set = no countdown, as before.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import flashSaleReducer, {fetchFlashSaleProducts} from '../redux/slice/product/flashSaleSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {anchorFlashSale, formatCountdown, spokenTime} from '../utils/flashSale';
import FlashSale from '../components/sections/FlashSale';
import FlashSaleCountdown from '../components/sections/FlashSaleCountdown';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, sku: `P-${id}`, image: '', base_price: 100, discount_price: 100,
  has_discount: false, brand_name: 'Acme', variant_id: id, availability_status: true, has_variants: false,
  avg_rating: 0, total_reviews: 0, total_views: 1, total_orders: 1,
});
const sale = (over = {}) => ({starts_at: null, ends_at: '2026-10-01T15:00:00Z', is_live: true, starts_in_seconds: null, ends_in_seconds: 8049, ...over});
const answer = (ids, flash_sale) => ({data: {data: {count: ids.length, next: null, previous: null, results: ids.map(PRODUCT), flash_sale}}});

describe('The helpers', () => {
  it('turn the shop\'s seconds into moments on this clock, as of when the answer arrived', () => {
    expect(anchorFlashSale(sale({ends_in_seconds: 60}), 1_000_000)).toEqual({isLive: true, startsAt: null, endsAt: 1_060_000});
    expect(anchorFlashSale(sale({is_live: false, starts_in_seconds: 30, ends_in_seconds: 90}), 1_000_000)).toEqual({isLive: false, startsAt: 1_030_000, endsAt: 1_090_000});
    expect(anchorFlashSale(sale({ends_in_seconds: null}), 1_000_000).endsAt).toBeNull();
    expect(anchorFlashSale(sale({is_live: false, ends_in_seconds: 0}), 1_000_000).endsAt).toBe(1_000_000);
  });

  it('know no window when the shop set none', () => {
    expect(anchorFlashSale(null)).toBeNull();
    expect(anchorFlashSale(undefined)).toBeNull();
  });

  it('write the time left as a clock, with days from a day up', () => {
    expect(formatCountdown({days: 0, hours: 2, minutes: 14, seconds: 9})).toBe('02:14:09');
    expect(formatCountdown({days: 0, hours: 0, minutes: 0, seconds: 0})).toBe('00:00:00');
    expect(formatCountdown({days: 2, hours: 5, minutes: 4, seconds: 3})).toBe('2d 05:04:03');
  });

  it('say it in words for a screen reader, never the seconds', () => {
    expect(spokenTime({days: 2, hours: 5, minutes: 14})).toBe('2 days 5 hours');
    expect(spokenTime({days: 1, hours: 0, minutes: 14})).toBe('1 day');
    expect(spokenTime({days: 0, hours: 2, minutes: 14})).toBe('2 hours 14 minutes');
    expect(spokenTime({days: 0, hours: 1, minutes: 0})).toBe('1 hour');
    expect(spokenTime({days: 0, hours: 0, minutes: 14})).toBe('14 minutes');
    expect(spokenTime({days: 0, hours: 0, minutes: 0})).toBe('less than a minute');
  });
});

describe('The countdown', () => {
  const START = new Date('2026-10-01T12:00:00.000Z');
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
    vi.setSystemTime(START);
    Object.defineProperty(document, 'visibilityState', {value: 'visible', configurable: true});
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const seconds = (n) => n * 1000;
  const after = async (ms) => { await act(async () => { vi.advanceTimersByTime(ms); }); };

  it('shows the time left and counts down a second at a time', async () => {
    render(<FlashSaleCountdown endsAt={Date.now() + seconds(2 * 3600 + 14 * 60 + 9)} />);
    expect(screen.getByRole('timer').textContent).toContain('Ends in');
    expect(screen.getByRole('timer').textContent).toContain('02:14:09');

    await after(1000);
    expect(screen.getByRole('timer').textContent).toContain('02:14:08');
    await after(9000);
    expect(screen.getByRole('timer').textContent).toContain('02:13:59');
  });

  it('shows days from a day up', () => {
    render(<FlashSaleCountdown endsAt={Date.now() + seconds(2 * 86400 + 5 * 3600 + 14 * 60 + 9)} />);
    expect(screen.getByRole('timer').textContent).toContain('2d 05:14:09');
  });

  it('is a timer a screen reader is told in words, not at every tick', async () => {
    render(<FlashSaleCountdown endsAt={Date.now() + seconds(2 * 3600 + 14 * 60 + 9)} />);
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Flash sale ends in 2 hours 14 minutes');
    expect(screen.getByRole('timer').querySelector('[aria-hidden="true"]')).toBeTruthy(); // the changing digits are not read
    await after(seconds(15 * 60));
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Flash sale ends in 1 hour 59 minutes');
  });

  it('can say what it counts to', () => {
    render(<FlashSaleCountdown endsAt={Date.now() + seconds(90)} label="Starts in" />);
    expect(screen.getByRole('timer').textContent).toContain('Starts in');
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Flash sale starts in 1 minute');
  });

  it('calls onEnd once when it reaches zero, and stops at 00:00:00', async () => {
    const onEnd = vi.fn();
    render(<FlashSaleCountdown endsAt={Date.now() + 2500} onEnd={onEnd} />);
    expect(onEnd).not.toHaveBeenCalled();
    await after(3000);
    expect(screen.getByRole('timer').textContent).toContain('00:00:00');
    expect(onEnd).toHaveBeenCalledTimes(1);
    await after(10_000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('is right again when a sleeping tab wakes, because it reads the clock instead of counting ticks', async () => {
    render(<FlashSaleCountdown endsAt={Date.now() + seconds(3600)} />);
    expect(screen.getByRole('timer').textContent).toContain('01:00:00');

    vi.setSystemTime(new Date(START.getTime() + seconds(50 * 60))); // fifty minutes pass with no timer firing
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(screen.getByRole('timer').textContent).toContain('00:10:00');
  });

  it('draws nothing without a moment to count to', () => {
    const {container} = render(<FlashSaleCountdown endsAt={null} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('The flash sale section', () => {
  const makeStore = () => configureStore({
    reducer: {flash_sale: flashSaleReducer, content: contentReducer, cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });
  const renderSection = async (forRoute = false, store = makeStore()) => {
    const utils = render(<Provider store={store}><MemoryRouter><FlashSale forRoute={forRoute} /></MemoryRouter></Provider>);
    await act(async () => {});
    return {store, ...utils};
  };
  const asked = () => api.get.mock.calls.filter(([url]) => url.startsWith('/products/flash-sale'));

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    publicApi.get.mockResolvedValue({data: {data: {page_content: {image_sliders: [], video_sliders: [], left_banner: null, right_banner: null}}}});
  });

  it('counts down to the end in the header of the section, from the seconds the shop gave', async () => {
    api.get.mockResolvedValue(answer([1, 2], sale()));
    await renderSection();
    const timer = await screen.findByRole('timer');
    expect(timer.textContent).toContain('Ends in');
    expect(timer.textContent).toMatch(/02:1[34]:\d\d/);
    expect(timer.getAttribute('aria-label')).toMatch(/^Flash sale ends in 2 hours 1[34] minutes?$/);
    expect(screen.getByRole('region', {name: 'Flash Sale'}).contains(timer)).toBe(true);
    expect(screen.getByText('Product 1')).toBeTruthy();
  });

  it('draws no countdown when the shop set no window (the sale is always on)', async () => {
    api.get.mockResolvedValue(answer([1], null));
    await renderSection();
    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('draws no countdown for a sale with no end', async () => {
    api.get.mockResolvedValue(answer([1], sale({ends_at: null, ends_in_seconds: null})));
    await renderSection();
    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('is simply not there on the homepage when the sale is over', async () => {
    api.get.mockResolvedValue(answer([], sale({is_live: false, ends_in_seconds: 0})));
    const {container} = await renderSection(false);
    expect(screen.queryByRole('region', {name: 'Flash Sale'})).toBeNull();
    expect(screen.queryByText(/has ended/)).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('says on its own page that the sale is over, with a way on', async () => {
    api.get.mockResolvedValue(answer([], sale({is_live: false, ends_in_seconds: 0})));
    await renderSection(true);
    expect(await screen.findByText('This flash sale has ended')).toBeTruthy();
    expect(screen.getByRole('link', {name: 'See all products'}).getAttribute('href')).toBe('/products');
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('says on its own page that the sale has not started, counting down to its start', async () => {
    api.get.mockResolvedValue(answer([], sale({is_live: false, starts_in_seconds: 86400, ends_in_seconds: 172800})));
    await renderSection(true);
    expect(await screen.findByText('The flash sale has not started yet')).toBeTruthy();
    const timer = screen.getByRole('timer');
    expect(timer.textContent).toContain('Starts in');
    expect(timer.textContent).toMatch(/(1d 00:00:0\d|23:59:5\d)/);
  });

  it('asks the shop again when the countdown reaches zero, and the section goes away once the sale is over', async () => {
    api.get.mockResolvedValueOnce(answer([1], sale({ends_in_seconds: 1})));
    api.get.mockResolvedValueOnce(answer([], sale({is_live: false, ends_in_seconds: 0})));
    await renderSection();
    expect(await screen.findByText('Product 1')).toBeTruthy();
    expect(asked()).toHaveLength(1);

    await waitFor(() => expect(asked()).toHaveLength(2), {timeout: 4000});
    await waitFor(() => expect(screen.queryByText('Product 1')).toBeNull(), {timeout: 4000});
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('shows the products, and the countdown to the end, once a sale that had not started does', async () => {
    api.get.mockResolvedValueOnce(answer([], sale({is_live: false, starts_in_seconds: 1, ends_in_seconds: 3601})));
    api.get.mockResolvedValueOnce(answer([1], sale({ends_in_seconds: 3600})));
    await renderSection(true);
    expect(await screen.findByText('The flash sale has not started yet')).toBeTruthy();

    expect((await screen.findAllByText('Product 1', {}, {timeout: 4000})).length).toBeGreaterThan(0); // (this page also lists them as "Recommended")
    expect(screen.queryByText('The flash sale has not started yet')).toBeNull();
    expect((await screen.findByRole('timer')).textContent).toContain('Ends in');
  });
});

describe('The slice', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps the window as moments on this device\'s clock, anchored when the answer arrived', async () => {
    const store = configureStore({reducer: {flash_sale: flashSaleReducer}, middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})});
    api.get.mockResolvedValue(answer([1], sale({ends_in_seconds: 7200})));
    vi.spyOn(Date, 'now').mockReturnValue(5_000_000);
    await store.dispatch(fetchFlashSaleProducts({page_size: 12}));
    expect(store.getState().flash_sale.flash_window).toEqual({isLive: true, startsAt: null, endsAt: 5_000_000 + 7_200_000});
  });

  it('forgets the window when the shop takes it away', async () => {
    const store = configureStore({reducer: {flash_sale: flashSaleReducer}, middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})});
    api.get.mockResolvedValueOnce(answer([1], sale()));
    await store.dispatch(fetchFlashSaleProducts({page_size: 12}));
    expect(store.getState().flash_sale.flash_window).not.toBeNull();

    api.get.mockResolvedValueOnce(answer([1], null));
    await store.dispatch(fetchFlashSaleProducts({page_size: 12}));
    expect(store.getState().flash_sale.flash_window).toBeNull();
  });
});
