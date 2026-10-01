// "My orders" narrowed by status, "Buy again", and the delivery estimate (backend docs/API_CONTRACT.md section 6: `GET /orders/?status=`,
// `variant_id` on every line, `delivery_estimates` at checkout, `expected_delivery` on an order). Real slices, mocked services.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

import orderReducer, {buyOrderAgain, fetchOrders} from '../redux/slice/orderSlice';
import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import checkoutReducer from '../redux/slice/checkoutSlice';
import api from '../api/axiosSetup';
import {getOrder, getOrders} from '../services/orderService';
import {deliveryEstimateText, expectedText} from '../utils/delivery';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import OrderConfirmation from '../pages/OrderConfirmation';
import {ExpectedDelivery} from '../components/orders';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../services/orderService', () => ({getOrders: vi.fn(), getOrder: vi.fn(), cancelOrder: vi.fn(), trackOrder: vi.fn()}));

const ITEM = (extra = {}) => ({
  product_id: 7, variant_id: 70, product_slug: 'red-mug', product_name: 'Red Mug', variant_label: 'Default', sku: 'MUG-1',
  unit_price: 500, base_price: 500, quantity: 2, line_total: 1000, image: null, ...extra,
});
const ORDER = (number, status = 'pending', extra = {}) => ({
  order_id: number, status, status_display: status[0].toUpperCase() + status.slice(1), created_at: '2026-09-23T10:00:00+06:00', total: 1060, items_count: 2, items: [ITEM()], ...extra,
});
const DETAIL = (extra = {}) => ({
  ...ORDER('GC-20260923-0001'), name: 'Rahim', email: '', phone_number: '+8801712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan',
  shipping_division: '', shipping_district: '', shipping_thana: '', shipping_address: 'House 1', subtotal: 1000, delivery_charge: 60, can_cancel: true,
  payment: null, history: [{status: 'pending', status_display: 'Pending', created_at: '2026-09-23T10:00:00+06:00'}], expected_delivery: null, ...extra,
});
const page = (orders, extra = {}) => ({data: {data: {count: orders.length, next: null, previous: null, results: orders, ...extra}}});
const EXPECTED = {earliest: '2026-10-05', latest: '2026-10-07'};
const plain = (text) => text.replace(/[\u2009\u202f\u00a0]/g, ' '); // a range is written with thin spaces around its dash

const makeStore = () => configureStore({
  reducer: {order: orderReducer, auth: authReducer, cart: cartReducer, checkout: checkoutReducer},
  preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: true}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const Where = () => <p data-testid="where">{useLocation().search}</p>;
const renderAt = (url, element, path = '/orders', state) => {
  const store = makeStore();
  const [pathname, search] = url.split('?');
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{pathname, search: search ? `?${search}` : '', state}]}>
        <Routes><Route path={path} element={<>{element}<Where /></>} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  getOrders.mockResolvedValue(page([ORDER('GC-1')]));
  api.get.mockResolvedValue({data: {data: []}});
});

describe('The delivery estimate in words', () => {
  it('says how long delivery takes, in days', () => {
    expect(deliveryEstimateText({min_days: 2, max_days: 3})).toBe('Delivery in 2–3 days');
    expect(deliveryEstimateText({min_days: 2, max_days: 2})).toBe('Delivery in 2 days');
    expect(deliveryEstimateText({min_days: 1, max_days: 1})).toBe('Delivery in 1 day');
  });

  it('says nothing when the shop made no promise', () => {
    expect(deliveryEstimateText(undefined)).toBe('');
    expect(deliveryEstimateText({})).toBe('');
    expect(deliveryEstimateText({min_days: null, max_days: null})).toBe('');
  });

  it('writes the dates an order is expected as a range, or one day, in the reader\'s own way', () => {
    expect(plain(expectedText(EXPECTED, 'en-US'))).toBe('Oct 5 – 7');
    expect(plain(expectedText(EXPECTED, 'en-GB'))).toBe('5–7 Oct');
    expect(plain(expectedText({earliest: '2026-10-30', latest: '2026-11-02'}, 'en-GB'))).toBe('30 Oct – 2 Nov');
    expect(expectedText({earliest: '2026-10-05', latest: '2026-10-05'}, 'en-US')).toBe('Oct 5');
    expect(expectedText(null)).toBe('');
  });

  it('keeps a calendar day on that day, whatever the device\'s timezone is', () => {
    // "2026-10-05" is a day, not a moment: read as UTC midnight it would be the 4th west of Greenwich
    expect(expectedText({earliest: '2026-10-01', latest: '2026-10-01'}, 'en-US')).toBe('Oct 1');
  });

  it('is a line under the placed date, and nothing without an estimate', () => {
    const {container} = render(<ExpectedDelivery expected={EXPECTED} />);
    expect(container.textContent.trim()).toMatch(/^Expected /);
    cleanup();
    expect(render(<ExpectedDelivery expected={null} />).container.innerHTML).toBe('');
  });
});

describe('My orders, narrowed', () => {
  it('shows every order, with "All" chosen, and asks for no status', async () => {
    renderAt('/orders', <Orders />);

    expect(await screen.findByText('GC-1')).toBeTruthy();
    expect(getOrders).toHaveBeenCalledWith(1, 10, '');
    expect(screen.getByRole('button', {name: 'All'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', {name: 'On the way'}).getAttribute('aria-pressed')).toBe('false');
  });

  it('asks for the statuses of the pill that was tapped, keeps the choice in the address, and shows only that list', async () => {
    getOrders.mockImplementation((_, __, status) => Promise.resolve(page(status ? [ORDER('GC-ONWAY', 'shipped')] : [ORDER('GC-1'), ORDER('GC-ONWAY', 'shipped')])));
    renderAt('/orders', <Orders />);
    await screen.findByText('GC-1');

    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'On the way'})); });

    await waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(1, 10, 'pending,confirmed,paid,shipped'));
    expect(await screen.findByText('GC-ONWAY')).toBeTruthy();
    expect(screen.queryByText('GC-1')).toBeNull();
    expect(screen.getByTestId('where').textContent).toBe('?show=active');
    expect(screen.getByRole('button', {name: 'On the way'}).getAttribute('aria-pressed')).toBe('true');

    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'All'})); });
    expect(await screen.findByText('GC-1')).toBeTruthy();
    expect(screen.getByTestId('where').textContent).toBe('');
  });

  it('opens on the filter the address names, and takes anything else as "All"', async () => {
    renderAt('/orders?show=delivered', <Orders />);
    await screen.findByText('GC-1');
    expect(getOrders).toHaveBeenCalledWith(1, 10, 'delivered');
    expect(screen.getByRole('button', {name: 'Delivered'}).getAttribute('aria-pressed')).toBe('true');
    cleanup();
    vi.clearAllMocks();
    getOrders.mockResolvedValue(page([ORDER('GC-1')]));

    renderAt('/orders?show=nonsense', <Orders />);
    await screen.findByText('GC-1');
    expect(getOrders).toHaveBeenCalledWith(1, 10, '');
    expect(screen.getByRole('button', {name: 'All'}).getAttribute('aria-pressed')).toBe('true');
  });

  it('never draws the list of another filter while the new one is on its way', async () => {
    renderAt('/orders', <Orders />);
    await screen.findByText('GC-1');
    getOrders.mockReturnValue(new Promise(() => {}));

    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'Delivered'})); });

    expect(screen.queryByText('GC-1')).toBeNull(); // not even for a moment
  });

  it('says what is missing for the filter, and "Show all orders" goes back', async () => {
    getOrders.mockImplementation((_, __, status) => Promise.resolve(page(status ? [] : [ORDER('GC-1')])));
    renderAt('/orders?show=closed', <Orders />);

    expect(await screen.findByText('No cancelled or returned orders.')).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'Show all orders'})); });
    expect(await screen.findByText('GC-1')).toBeTruthy();
  });

  it('says "no order yet" with a way to the shop only for the whole list', async () => {
    getOrders.mockResolvedValue(page([]));
    renderAt('/orders', <Orders />);
    expect(await screen.findByText('You have not placed any order yet.')).toBeTruthy();
    expect(screen.getByRole('link', {name: 'Start shopping'})).toBeTruthy();
  });

  it('starts the next filter at its first page, not at the page the old one had reached', async () => {
    getOrders.mockResolvedValueOnce(page([ORDER('GC-1')], {count: 12, next: 'http://x/?page=2'}));
    renderAt('/orders', <Orders />);
    await screen.findByText('GC-1');
    getOrders.mockResolvedValueOnce(page([ORDER('GC-2')], {count: 12}));
    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'Load more'})); });
    await waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(2, 10, ''));

    getOrders.mockResolvedValue(page([ORDER('GC-D', 'delivered')]));
    await act(async () => { fireEvent.click(screen.getByRole('button', {name: 'Delivered'})); });

    await waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(1, 10, 'delivered'));
  });
});

describe('fetchOrders', () => {
  it('drops an answer for a filter that is no longer the one chosen, and an older first page that arrives late', async () => {
    const store = makeStore();
    let answerOld;
    getOrders.mockReturnValueOnce(new Promise((resolve) => { answerOld = resolve; }));
    getOrders.mockResolvedValueOnce(page([ORDER('GC-NEW', 'delivered')]));
    const old = store.dispatch(fetchOrders({page: 1, page_size: 10, status: ''}));
    await store.dispatch(fetchOrders({page: 1, page_size: 10, status: 'delivered'}));
    answerOld(page([ORDER('GC-OLD')]));
    await old;

    const {orders, ordersStatus} = store.getState().order;
    expect(ordersStatus).toBe('delivered');
    expect(orders.map((order) => order.order_id)).toEqual(['GC-NEW']);
  });

  it('keeps the list while the same filter is asked for again', async () => {
    const store = makeStore();
    await store.dispatch(fetchOrders({page: 1, page_size: 10, status: 'delivered'}));
    getOrders.mockReturnValue(new Promise(() => {}));
    store.dispatch(fetchOrders({page: 1, page_size: 10, status: 'delivered'}));

    expect(store.getState().order.orders).toHaveLength(1);
  });
});

describe('Buy again', () => {
  const lines = [ITEM(), ITEM({product_id: 8, variant_id: 80, product_name: 'Blue Mug', quantity: 1})];

  it('puts every line back in the cart with the quantity it had, then reads the cart again', async () => {
    api.post.mockResolvedValue({data: {success: true}});
    const store = makeStore();

    await store.dispatch(buyOrderAgain(lines));

    expect(api.post.mock.calls.map(([url, body]) => [url, body])).toEqual([
      ['/accounts/cart/', {product_id: 7, variant_id: 70, quantity: 2, action: 'increase'}],
      ['/accounts/cart/', {product_id: 8, variant_id: 80, quantity: 1, action: 'increase'}],
    ]);
    expect(api.get).toHaveBeenCalledWith('/accounts/cart/', expect.anything());
    expect(store.getState().order.buyAgain).toEqual({loading: false, added: ['Red Mug', 'Blue Mug'], skipped: [], done: true});
  });

  it('says why a line was refused, and still adds the others', async () => {
    api.post.mockRejectedValueOnce({response: {data: {success: false, errors: ['Red Mug is out of stock.']}}});
    api.post.mockResolvedValueOnce({data: {success: true}});
    const store = makeStore();

    await store.dispatch(buyOrderAgain(lines));

    expect(store.getState().order.buyAgain).toMatchObject({added: ['Blue Mug'], skipped: ['Red Mug is out of stock.'], done: true});
  });

  it('cannot buy a line whose product or variant has been deleted, and does not ask the shop about it', async () => {
    api.post.mockResolvedValue({data: {success: true}});
    const store = makeStore();

    await store.dispatch(buyOrderAgain([ITEM({product_id: null, variant_id: null, product_name: 'Old Mug'}), ITEM({variant_id: null})]));

    expect(api.post).not.toHaveBeenCalled();
    expect(store.getState().order.buyAgain.skipped).toEqual(['Old Mug is not sold any more.', 'Red Mug is not sold any more.']);
  });

  it('is a button on the order that says what happened, with a way to the cart', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL({items: lines})}});
    api.post.mockResolvedValue({data: {success: true}});
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    await act(async () => { fireEvent.click(await screen.findByRole('button', {name: /Buy again/})); });

    const status = await screen.findByRole('status');
    expect(within(status).getByText('All 2 items are in your cart.')).toBeTruthy();
    expect(within(status).getByRole('link', {name: 'View cart'}).getAttribute('href')).toBe('/cart');
  });

  it('lists what could not be added in the shop\'s own sentences', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL({items: lines})}});
    api.post.mockRejectedValueOnce({response: {data: {success: false, errors: ['Only 1 of Red Mug left in stock.']}}});
    api.post.mockResolvedValueOnce({data: {success: true}});
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    await act(async () => { fireEvent.click(await screen.findByRole('button', {name: /Buy again/})); });

    const status = await screen.findByRole('status');
    expect(within(status).getByText('1 of 2 items added to your cart.')).toBeTruthy();
    expect(within(status).getByText('Not added:')).toBeTruthy();
    expect(within(status).getByText('Only 1 of Red Mug left in stock.')).toBeTruthy();
  });

  it('says "Nothing could be added" when every line was refused, without a link to a cart that has nothing new', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL()}});
    api.post.mockRejectedValue({response: {data: {success: false, errors: ['Red Mug is out of stock.']}}});
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    await act(async () => { fireEvent.click(await screen.findByRole('button', {name: /Buy again/})); });

    const status = await screen.findByRole('status');
    expect(within(status).getByText('Nothing could be added.')).toBeTruthy();
    expect(within(status).queryByRole('link', {name: 'View cart'})).toBeNull();
  });

  it('waits for the answers: one tap, one run', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL()}});
    let resolve;
    api.post.mockReturnValue(new Promise((done) => { resolve = done; }));
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    await act(async () => { fireEvent.click(await screen.findByRole('button', {name: /Buy again/})); });

    expect(screen.getByRole('button', {name: /Adding to your cart/}).disabled).toBe(true);
    await act(async () => { resolve({data: {success: true}}); });
    expect(await screen.findByText('All 1 item is in your cart.')).toBeTruthy();
  });
});

describe('When to expect an order', () => {
  it('is under the placed date on the order, while it is on its way', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL({expected_delivery: EXPECTED})}});
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    expect(await screen.findByText(/^Expected /)).toBeTruthy();
    expect(screen.getByText(/^Expected /).textContent).toContain(expectedText(EXPECTED));
  });

  it('is not there when the shop made no promise, or the order has arrived', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL()}});
    renderAt('/orders/GC-20260923-0001', <OrderDetail />, '/orders/:orderId');

    await screen.findByText('Progress');
    expect(screen.queryByText(/^Expected /)).toBeNull();
  });

  it('is on the confirmation page, from what checkout handed over', () => {
    renderAt('/order-confirmation/GC-1', <OrderConfirmation />, '/order-confirmation/:orderId', {
      order: {order_id: 'GC-1', status: 'pending', created_at: '2026-09-23T10:00:00+06:00', subtotal: 1000, delivery_charge: 60, discount_amount: 0, coupon_code: '', total: 1060, expected_delivery: EXPECTED},
    });

    expect(screen.getByText(/^Expected /)).toBeTruthy();
  });
});
