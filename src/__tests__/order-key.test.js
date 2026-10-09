// An order may be sent twice (a double tap, a retry after a lost answer): the checkout gives the shop an `Idempotency-Key`, the same one for the same
// order and a new one for another, so the shop answers a repeat with the order it already placed instead of placing a second one.
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';

import checkoutReducer, {handleCheckout} from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {forgetOrderKey, orderKeyFor} from '../utils/orderKey';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const SHOP_RULE = /^[A-Za-z0-9_.:-]{8,64}$/; // what the shop accepts (docs/API_CONTRACT.md section 6)
const BODY = {
  name: 'Rahim', email: '', phone_number: '+8801712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan', shipping: null,
  shipping_division: '', shipping_district: '', shipping_thana: '', shipping_address: 'House 1', payment_type: 'cash', coupon_code: '',
  items: [{product_id: 1, variant_id: 3, quantity: 2, price: 500}], sub_total_price: '1000.00', delivery_charge: 60, total_price: '1060.00',
};
const init = (reducer) => reducer(undefined, {type: '@@init'});

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  forgetOrderKey();
});

describe('The key of an order', () => {
  it('is a token the shop accepts, and the same for the same order', () => {
    const key = orderKeyFor(BODY);
    expect(key).toMatch(SHOP_RULE);
    expect(orderKeyFor({...BODY})).toBe(key);
  });

  it('is another for another order: other lines, address, phone, coupon', () => {
    const key = orderKeyFor(BODY);
    expect(orderKeyFor({...BODY, items: [{product_id: 1, variant_id: 3, quantity: 3}]})).not.toBe(key);
    forgetOrderKey();
    const again = orderKeyFor(BODY);
    expect(orderKeyFor({...BODY, shipping_address: 'House 2'})).not.toBe(again);
    expect(orderKeyFor({...BODY, coupon_code: 'WELCOME10'})).not.toBe(again);
  });

  it('is not changed by what the shop ignores: prices and totals the page also sends', () => {
    const key = orderKeyFor(BODY);
    const same = {...BODY, sub_total_price: '999.00', total_price: '1.00', delivery_charge: 120, items: [{product_id: 1, variant_id: 3, quantity: 2, price: 1}]};
    expect(orderKeyFor(same)).toBe(key);
  });

  it('is a new one once the order is placed', () => {
    const key = orderKeyFor(BODY);
    forgetOrderKey();
    expect(orderKeyFor(BODY)).not.toBe(key);
  });

  it('survives a refresh (the order was on its way when the page was reloaded)', async () => {
    const key = orderKeyFor(BODY);
    vi.resetModules();
    const fresh = await import('../utils/orderKey');
    expect(fresh.orderKeyFor(BODY)).toBe(key);
  });

  it('still serves a retry on the page where the browser refuses storage', () => {
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => { throw new Error('denied'); });
    const key = orderKeyFor(BODY);
    expect(key).toMatch(SHOP_RULE);
    expect(orderKeyFor(BODY)).toBe(key);
    expect(() => forgetOrderKey()).not.toThrow();
    vi.restoreAllMocks();
  });

  it('is made even on a page without crypto.randomUUID (plain http): getRandomValues, or at worst Math.random', () => {
    const real = window.crypto;
    Object.defineProperty(window, 'crypto', {value: {getRandomValues: (bytes) => bytes.fill(171)}, configurable: true});
    expect(orderKeyFor(BODY)).toMatch(SHOP_RULE);
    forgetOrderKey();
    Object.defineProperty(window, 'crypto', {value: undefined, configurable: true});
    expect(orderKeyFor(BODY)).toMatch(SHOP_RULE);
    Object.defineProperty(window, 'crypto', {value: real, configurable: true});
  });
});

describe('Place Order sends it', () => {
  const makeStore = (signedIn = false) => configureStore({
    reducer: {checkout: checkoutReducer, cart: cartReducer, auth: authReducer},
    preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });
  const keyOf = (client, call) => client.post.mock.calls[call][2].headers['Idempotency-Key'];
  const placed = {data: {success: true, data: {order_id: 'GC-1'}}};

  it('as a header of the order request, with the checkout section as before', async () => {
    publicApi.post.mockResolvedValue(placed);
    await makeStore().dispatch(handleCheckout(BODY));
    expect(publicApi.post).toHaveBeenCalledWith('/orders/', BODY, {section: 'checkout', headers: {'Idempotency-Key': expect.stringMatching(SHOP_RULE)}});
  });

  it('also for a signed-in customer (the authenticated client)', async () => {
    api.post.mockResolvedValue(placed);
    await makeStore(true).dispatch(handleCheckout(BODY));
    expect(api.post).toHaveBeenCalledWith('/orders/', BODY, {section: 'checkout', headers: {'Idempotency-Key': expect.stringMatching(SHOP_RULE)}});
  });

  it('the same for a retry after the answer was lost, and a new one for the next order', async () => {
    publicApi.post.mockRejectedValueOnce(new Error('Network Error'));
    publicApi.post.mockResolvedValueOnce(placed);
    publicApi.post.mockResolvedValueOnce(placed);
    const store = makeStore();

    await store.dispatch(handleCheckout(BODY)); // the answer never came
    await store.dispatch(handleCheckout(BODY)); // the customer tries again: the same order, the same key
    await store.dispatch(handleCheckout(BODY)); // an order the customer places later is another one

    expect(keyOf(publicApi, 1)).toBe(keyOf(publicApi, 0));
    expect(keyOf(publicApi, 2)).not.toBe(keyOf(publicApi, 1));
  });

  it('the same key after a refusal for the same order (nothing was placed, so nothing is used up)', async () => {
    publicApi.post.mockRejectedValueOnce({response: {data: {success: false, errors: ['Only 1 of Mug left in stock.']}}});
    publicApi.post.mockResolvedValueOnce(placed);
    const store = makeStore();

    await store.dispatch(handleCheckout(BODY));
    await store.dispatch(handleCheckout(BODY));

    expect(keyOf(publicApi, 1)).toBe(keyOf(publicApi, 0));
  });

  it('another key when the customer changed the order after a refusal', async () => {
    publicApi.post.mockRejectedValueOnce({response: {data: {success: false, errors: ['Only 1 of Mug left in stock.']}}});
    publicApi.post.mockResolvedValueOnce(placed);
    const store = makeStore();

    await store.dispatch(handleCheckout(BODY));
    await store.dispatch(handleCheckout({...BODY, items: [{product_id: 1, variant_id: 3, quantity: 1, price: 500}]}));

    expect(keyOf(publicApi, 1)).not.toBe(keyOf(publicApi, 0));
  });
});
