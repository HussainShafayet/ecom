// The "Offers for you" list at checkout (backend docs/API_CONTRACT.md section 10: GET /coupons/available/ suggests the coupons
// a shop opted in, POST /coupons/validate/ decides). services/couponService is mocked.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import checkoutReducer, {handleGetOffers} from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import publicApi from '../api/publicApi';
import CouponOffers from '../components/checkout/CouponOffers';
import {getAvailableOffers, validateCoupon} from '../services/couponService';

// The first test imports the whole checkout page on a cold start: more than the default 5 s on a busy machine
vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/couponService', () => ({validateCoupon: vi.fn(), getAvailableOffers: vi.fn()}));

const MUG = {
  id: 1, name: 'Mug', slug: 'mug', sku: 'M-1', image: '', base_price: 500, discount_price: 500,
  has_discount: false, quantity: 1, minimum_order_quantity: 1, variant_id: 1, availability_status: true, has_variants: false,
  avg_rating: 4, total_reviews: 2, brand_name: 'Acme',
};
const SUMMER = {code: 'SUMMER25', public_title: '25% off your first order', discount_type: 'percentage', discount_value: 25,
  min_order_amount: null, max_discount_amount: 200, eligible: true, amount_short: 0};
const FREESHIP = {code: 'FREESHIP', public_title: 'Free delivery', discount_type: 'fixed', discount_value: 60,
  min_order_amount: 620, max_discount_amount: null, eligible: false, amount_short: 120};
const answer = (offers) => ({data: {success: true, data: {offers}}});
const init = (reducer) => reducer(undefined, {type: '@@init'});

const makeStore = () => configureStore({
  reducer: {cart: cartReducer, product: productReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, checkout: checkoutReducer},
  preloadedState: {
    auth: {...init(authReducer), isAuthenticated: false},
    cart: {...init(cartReducer), cartItems: [{...MUG, quantity: 1}]},
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderCheckout = async () => {
  const {default: Checkout} = await import('../pages/Checkout');
  publicApi.get.mockResolvedValue({data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, shipping_addresses: [], user_info: null}}});
  const store = makeStore();
  render(<Provider store={store}><MemoryRouter><Checkout /></MemoryRouter></Provider>);
  await screen.findByText('Place Order');
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('handleGetOffers', () => {
  it('keeps the offers the shop answered with', async () => {
    getAvailableOffers.mockResolvedValue(answer([SUMMER, FREESHIP]));
    const store = makeStore();
    await store.dispatch(handleGetOffers('500.00'));
    expect(getAvailableOffers).toHaveBeenCalledWith({subtotal: '500.00'});
    expect(store.getState().checkout.offers).toEqual([SUMMER, FREESHIP]);
  });

  it('is an empty list when the request fails, never the offers of another cart', async () => {
    const store = makeStore();
    getAvailableOffers.mockResolvedValueOnce(answer([SUMMER]));
    await store.dispatch(handleGetOffers('500.00'));
    getAvailableOffers.mockRejectedValueOnce({response: {data: {success: false, errors: ['Too many requests.']}}});
    await store.dispatch(handleGetOffers('900.00'));
    expect(store.getState().checkout.offers).toEqual([]);
  });

  it('drops an older answer that arrives after a newer one', async () => {
    let answerOld;
    getAvailableOffers.mockReturnValueOnce(new Promise((resolve) => { answerOld = resolve; }));
    getAvailableOffers.mockResolvedValueOnce(answer([FREESHIP]));
    const store = makeStore();
    const old = store.dispatch(handleGetOffers('500.00'));
    await store.dispatch(handleGetOffers('900.00'));
    answerOld(answer([SUMMER]));
    await old;
    expect(store.getState().checkout.offers).toEqual([FREESHIP]);
  });
});

describe('CouponOffers', () => {
  it('shows nothing without offers', () => {
    const {container} = render(<CouponOffers offers={[]} onUse={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('lets an offer in reach be used, and says what the others still need', () => {
    const onUse = vi.fn();
    render(<CouponOffers offers={[SUMMER, FREESHIP]} onUse={onUse} />);

    expect(screen.getByText('25% off your first order')).toBeTruthy();
    expect(screen.getByText('Up to ৳200 off')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: /SUMMER25/}));
    expect(onUse).toHaveBeenCalledWith(SUMMER);

    expect(screen.getByText('Add ৳120 more to use FREESHIP')).toBeTruthy();
    expect(screen.getByText('Min order ৳620')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /FREESHIP/})).toBeNull(); // out of reach: nothing to tap
  });

  it('cannot be tapped while a code is being checked', () => {
    render(<CouponOffers offers={[SUMMER]} disabled onUse={vi.fn()} />);
    expect(screen.getByRole('button', {name: /SUMMER25/}).disabled).toBe(true);
  });
});

describe('Offers at checkout', () => {
  it('asks for the cart\'s subtotal and lists what comes back', async () => {
    getAvailableOffers.mockResolvedValue(answer([SUMMER, FREESHIP]));
    await renderCheckout();

    expect(await screen.findByText('Offers for you')).toBeTruthy();
    expect(getAvailableOffers).toHaveBeenCalledWith({subtotal: '500.00'});
    expect(screen.getByText('Add ৳120 more to use FREESHIP')).toBeTruthy();
    // the folded summary on a phone says so without being opened
    expect(screen.getByText('1 offer for you: tap to see')).toBeTruthy();
  });

  it('applies a tapped offer like a typed code, and hides the list once one is applied', async () => {
    getAvailableOffers.mockResolvedValue(answer([SUMMER]));
    validateCoupon.mockResolvedValue({data: {data: {discount_amount: 125, total: 375}}});
    await renderCheckout();

    fireEvent.click(await screen.findByRole('button', {name: /SUMMER25/}));

    await waitFor(() => expect(validateCoupon).toHaveBeenCalledWith(expect.objectContaining({code: 'SUMMER25', subtotal: '500.00'})));
    expect(await screen.findByText('-৳125')).toBeTruthy();
    expect(screen.queryByText('Offers for you')).toBeNull();
    expect(screen.queryByText('1 offer for you: tap to see')).toBeNull();

    fireEvent.click(screen.getByText('Remove'));
    expect(screen.getByText('Offers for you')).toBeTruthy(); // back once the coupon is removed
  });

  it('shows the backend sentence when a tapped offer is refused, with its code left in the box', async () => {
    getAvailableOffers.mockResolvedValue(answer([SUMMER]));
    validateCoupon.mockRejectedValue({response: {data: {success: false, errors: ['You have already used this coupon.']}}});
    await renderCheckout();

    fireEvent.click(await screen.findByRole('button', {name: /SUMMER25/}));

    expect(await screen.findByText('You have already used this coupon.')).toBeTruthy();
    expect(screen.getByPlaceholderText('Promo code').value).toBe('SUMMER25');
    expect(screen.getByText('Offers for you')).toBeTruthy(); // the others stay
  });

  it('is simply absent when the offers cannot be fetched', async () => {
    getAvailableOffers.mockRejectedValue({response: {status: 500, data: {success: false, errors: ['Something went wrong.']}}});
    await renderCheckout();

    await waitFor(() => expect(getAvailableOffers).toHaveBeenCalled());
    expect(screen.queryByText('Offers for you')).toBeNull();
    expect(screen.getByPlaceholderText('Promo code')).toBeTruthy(); // typing a code still works
  });
});
