// The checkout page's promo-code box (backend docs/API_CONTRACT.md section 10: POST /coupons/validate/ previews the
// discount, POST /orders/ redeems coupon_code directly). services/couponService is mocked.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import checkoutReducer from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import publicApi from '../api/publicApi';
import {validateCoupon} from '../services/couponService';

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
  window.sessionStorage.clear(); // a guest's checkout draft lives in the tab: one test's typing must not come back in the next
  Element.prototype.scrollIntoView = vi.fn();
});

describe('The promo code box at checkout', () => {
  it('previews a valid code and shows the discount', async () => {
    validateCoupon.mockResolvedValue({data: {data: {discount_amount: 50, total: 450}}});
    await renderCheckout();

    fireEvent.change(screen.getByPlaceholderText('Promo code'), {target: {value: 'summer25'}});
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => expect(validateCoupon).toHaveBeenCalledWith(
      expect.objectContaining({code: 'summer25', subtotal: '500.00'})
    ));
    expect(await screen.findByText('SUMMER25')).toBeTruthy();
    expect(screen.getByText('Discount')).toBeTruthy();
    expect(screen.getByText('-৳50')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Promo code')).toBeNull(); // the input hides once applied
  });

  it('shows the backend sentence when the code is refused', async () => {
    validateCoupon.mockRejectedValue({response: {data: {success: false, errors: ['This coupon has expired.']}}});
    await renderCheckout();

    fireEvent.change(screen.getByPlaceholderText('Promo code'), {target: {value: 'OLD10'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(await screen.findByText('This coupon has expired.')).toBeTruthy();
    expect(screen.getByPlaceholderText('Promo code')).toBeTruthy(); // still editable: nothing was applied
  });

  it('can be removed, putting the full total back', async () => {
    validateCoupon.mockResolvedValue({data: {data: {discount_amount: 50, total: 450}}});
    await renderCheckout();
    fireEvent.change(screen.getByPlaceholderText('Promo code'), {target: {value: 'summer25'}});
    fireEvent.click(screen.getByText('Apply'));
    await screen.findByText('SUMMER25');

    fireEvent.click(screen.getByText('Remove'));

    expect(screen.queryByText('Discount')).toBeNull();
    expect(screen.getByPlaceholderText('Promo code')).toBeTruthy();
  });

  it('sends coupon_code on POST /orders/ once a coupon is applied', async () => {
    validateCoupon.mockResolvedValue({data: {data: {discount_amount: 50, total: 450}}});
    publicApi.post.mockResolvedValue({data: {success: true, data: {order_id: 'GC-1'}}});
    await renderCheckout();
    fireEvent.change(screen.getByPlaceholderText('Promo code'), {target: {value: 'summer25'}});
    fireEvent.click(screen.getByText('Apply'));
    await screen.findByText('SUMMER25');

    fireEvent.change(screen.getByLabelText('Full name'), {target: {value: 'Rahim Uddin'}});
    fireEvent.change(screen.getByLabelText('Phone number'), {target: {value: '1712345678'}});
    fireEvent.change(screen.getByLabelText('Delivery area'), {target: {value: 'inside_dhaka'}});
    fireEvent.change(screen.getByLabelText('Area in Dhaka'), {target: {value: 'Gulshan'}});
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'House 1'}});
    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => expect(publicApi.post).toHaveBeenCalled());
    const [, body] = publicApi.post.mock.calls[0];
    expect(body.coupon_code).toBe('SUMMER25');
  });
});

describe('The delivery estimate at checkout', () => {
  const renderWithEstimates = async (estimates) => {
    const {default: Checkout} = await import('../pages/Checkout');
    publicApi.get.mockResolvedValue({data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, delivery_estimates: estimates, shipping_addresses: [], user_info: null}}});
    render(<Provider store={makeStore()}><MemoryRouter><Checkout /></MemoryRouter></Provider>);
    await screen.findByText('Place Order');
  };

  it('says how long delivery takes under the delivery area once an area that has an estimate is chosen', async () => {
    await renderWithEstimates({inside_dhaka: {min_days: 2, max_days: 3}});
    expect(screen.queryByText(/Delivery in/)).toBeNull(); // no area chosen yet

    fireEvent.change(screen.getByLabelText('Delivery area'), {target: {value: 'inside_dhaka'}});

    expect(screen.getByText('Delivery in 2–3 days')).toBeTruthy();
  });

  it('says nothing for an area the shop made no promise for, and never invents one', async () => {
    await renderWithEstimates({inside_dhaka: {min_days: 2, max_days: 3}});

    fireEvent.change(screen.getByLabelText('Delivery area'), {target: {value: 'outside_dhaka'}});

    expect(screen.queryByText(/Delivery in/)).toBeNull();
  });

  it('says nothing at all from a shop that has not set any (or a backend that sends none)', async () => {
    await renderWithEstimates(undefined);

    fireEvent.change(screen.getByLabelText('Delivery area'), {target: {value: 'inside_dhaka'}});

    expect(screen.queryByText(/Delivery in/)).toBeNull();
  });

  it('says "in 2 days" for an estimate that is one number', async () => {
    await renderWithEstimates({inside_dhaka: {min_days: 2, max_days: 2}});

    fireEvent.change(screen.getByLabelText('Delivery area'), {target: {value: 'inside_dhaka'}});

    expect(screen.getByText('Delivery in 2 days')).toBeTruthy();
  });
});
