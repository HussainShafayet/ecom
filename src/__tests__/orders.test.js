// The order pages, rendered with the real slice and a mocked orderService (the backend's answers are the shapes in
// backend docs/API_CONTRACT.md section 6).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import orderReducer, {fetchOrder, trackOrder} from '../redux/slice/orderSlice';
import authReducer, {logoutUser} from '../redux/slice/authSlice';
import checkoutReducer, {handleCheckout, resetForm} from '../redux/slice/checkoutSlice';
import {cancelOrder, getOrder, getOrders, trackOrder as trackOrderRequest} from '../services/orderService';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import OrderConfirmation from '../pages/OrderConfirmation';
import OrderTracking from '../pages/others/OrderTracking';
import {OrderStatusBadge, OrderTimeline} from '../components/orders';

vi.mock('../services/orderService', () => ({
  getOrders: vi.fn(),
  getOrder: vi.fn(),
  cancelOrder: vi.fn(),
  trackOrder: vi.fn(),
}));

const NUMBER = 'GC-20260923-0001';
const ITEM = {
  product_id: 7, product_slug: 'red-mug', product_name: 'Red Mug', variant_label: 'Default', sku: 'MUG-1',
  unit_price: 500, base_price: 500, quantity: 2, line_total: 1000, image: 'http://localhost:8000/media/products/a.png',
};
const step = (status, status_display, day) => ({status, status_display, created_at: `2026-09-${day}T10:00:00+06:00`});
const SUMMARY = {
  order_id: NUMBER, status: 'pending', status_display: 'Pending', created_at: '2026-09-23T10:00:00+06:00',
  total: 1060, items_count: 2, items: [ITEM],
};
const DETAIL = {
  ...SUMMARY, name: 'Rahim Uddin', email: '', phone_number: '+8801712345678', shipping_type: 'inside_dhaka',
  shipping_area: 'Gulshan', shipping_division: '', shipping_district: '', shipping_thana: '', shipping_address: 'House 12, Road 5',
  subtotal: 1000, delivery_charge: 60, can_cancel: true,
  payment: {method: 'cod', method_display: 'Cash on delivery', status: 'pending', status_display: 'Pending', amount: 1060, paid_at: null, refunded_at: null},
  history: [step('pending', 'Pending', 23)],
};
const TRACKING = {
  order_id: NUMBER, status: 'shipped', status_display: 'Shipped', created_at: '2026-09-23T10:00:00+06:00', total: 1060, items_count: 2,
  items: [ITEM], subtotal: 1000, delivery_charge: 60, payment: DETAIL.payment, history: [step('pending', 'Pending', 23), step('shipped', 'Shipped', 24)],
};
const failure = (errors) => ({response: {data: {success: false, errors}}});

const makeStore = (signedIn = true) => configureStore({
  reducer: {order: orderReducer, auth: authReducer, checkout: checkoutReducer},
  preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderAt = (url, routes, {signedIn = true, state} = {}) => {
  const store = makeStore(signedIn);
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{pathname: url.split('?')[0], search: url.includes('?') ? `?${url.split('?')[1]}` : '', state}]}>
        <Routes>{routes}</Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('My orders', () => {
  it('lists the orders with status, total, units and links to each one', async () => {
    getOrders.mockResolvedValue({data: {data: {count: 1, next: null, previous: null, results: [SUMMARY]}}});
    renderAt('/orders', <Route path="/orders" element={<Orders />} />);

    expect(await screen.findByText(NUMBER)).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('৳1060.00')).toBeTruthy();
    expect(screen.getByText(/2 items/)).toBeTruthy();
    expect(screen.getByText('View details').getAttribute('href')).toBe(`/orders/${NUMBER}`);
    expect(getOrders).toHaveBeenCalledWith(1, 10);
  });

  it('says so when there are no orders', async () => {
    getOrders.mockResolvedValue({data: {data: {count: 0, next: null, previous: null, results: []}}});
    renderAt('/orders', <Route path="/orders" element={<Orders />} />);
    expect(await screen.findByText('You have not placed any order yet.')).toBeTruthy();
  });

  it('pages through older orders', async () => {
    getOrders.mockResolvedValue({data: {data: {count: 12, next: 'http://x/?page=2', previous: null, results: [SUMMARY]}}});
    renderAt('/orders', <Route path="/orders" element={<Orders />} />);
    fireEvent.click(await screen.findByText('Older'));
    await waitFor(() => expect(getOrders).toHaveBeenLastCalledWith(2, 10));
    expect(screen.getByText('Page 2 of 2')).toBeTruthy();
  });

  it('shows the error the backend sent', async () => {
    getOrders.mockRejectedValue(failure(['Something is wrong.']));
    renderAt('/orders', <Route path="/orders" element={<Orders />} />);
    expect(await screen.findByText('Something is wrong.')).toBeTruthy();
  });
});

describe('One order', () => {
  const routes = <Route path="/orders/:orderId" element={<OrderDetail />} />;

  it('shows the items, totals, address, payment and progress', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    renderAt(`/orders/${NUMBER}`, routes);

    expect(await screen.findByText('Red Mug')).toBeTruthy();
    expect(screen.getByText('House 12, Road 5')).toBeTruthy();
    expect(screen.getByText('Gulshan, Dhaka')).toBeTruthy();
    expect(screen.getByText('Cash on delivery')).toBeTruthy();
    expect(screen.getByText('Order Placed')).toBeTruthy();
    expect(screen.getAllByText('৳1060.00').length).toBeGreaterThan(0);
    expect(getOrder).toHaveBeenCalledWith(NUMBER);
  });

  it('cancels a pending order after confirming, and then the button is gone', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    cancelOrder.mockResolvedValue({data: {data: {...DETAIL, status: 'cancelled', status_display: 'Cancelled', can_cancel: false,
      history: [step('pending', 'Pending', 23), step('cancelled', 'Cancelled', 24)]}}});
    renderAt(`/orders/${NUMBER}`, routes);

    fireEvent.click(await screen.findByText('Cancel order'));

    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith(NUMBER));
    await waitFor(() => expect(screen.queryByText('Cancel order')).toBeNull());
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0);
  });

  it('does nothing when the customer changes their mind', async () => {
    window.confirm.mockReturnValue(false);
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    renderAt(`/orders/${NUMBER}`, routes);
    fireEvent.click(await screen.findByText('Cancel order'));
    expect(cancelOrder).not.toHaveBeenCalled();
  });

  it("shows the backend's sentence when the order can no longer be cancelled", async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    cancelOrder.mockRejectedValue(failure(['Only a pending order can be cancelled. To change an order that is already being handled, please contact us.']));
    renderAt(`/orders/${NUMBER}`, routes);
    fireEvent.click(await screen.findByText('Cancel order'));
    expect(await screen.findByText(/Only a pending order can be cancelled/)).toBeTruthy();
  });

  it.each([['shipped', 'Shipped'], ['confirmed', 'Confirmed'], ['returned', 'Returned']])('has no cancel button once the order is %s', async (status, label) => {
    getOrder.mockResolvedValue({data: {data: {...DETAIL, status, status_display: label, can_cancel: false}}});
    renderAt(`/orders/${NUMBER}`, routes);
    await screen.findByText('Red Mug');
    expect(screen.queryByText('Cancel order')).toBeNull();
  });

  it('says the order was not found (somebody else\'s, or unknown)', async () => {
    getOrder.mockRejectedValue(failure(['Order not found.']));
    renderAt('/orders/GC-19990101-0001', routes);
    expect(await screen.findByText('Order not found.')).toBeTruthy();
    expect(screen.getByText('Back to my orders')).toBeTruthy();
  });
});

describe('Tracking an order as a guest', () => {
  const routes = <Route path="/order-tracking" element={<OrderTracking />} />;
  const fill = (orderId, phone) => {
    fireEvent.change(screen.getByLabelText('Order ID'), {target: {value: orderId}});
    fireEvent.change(screen.getByLabelText('Phone number'), {target: {value: phone}});
    fireEvent.click(screen.getByText('Track order'));
  };

  it('looks the order up with +880 and ten digits, however the phone is typed', async () => {
    trackOrderRequest.mockResolvedValue({data: {data: TRACKING}});
    renderAt('/order-tracking', routes, {signedIn: false});

    fill(NUMBER, '01712345678');

    await waitFor(() => expect(trackOrderRequest).toHaveBeenCalledWith(NUMBER, '+8801712345678'));
    expect(await screen.findByText('Shipped', {selector: 'span'})).toBeTruthy();
    expect(screen.getByText('Red Mug')).toBeTruthy();
    expect(screen.queryByText('Rahim Uddin')).toBeNull(); // nothing about who it is for
  });

  it('asks for a proper phone number before calling the backend', () => {
    renderAt('/order-tracking', routes, {signedIn: false});
    fill(NUMBER, '123');
    expect(screen.getByText('Enter the 10 digit phone number you ordered with.')).toBeTruthy();
    expect(trackOrderRequest).not.toHaveBeenCalled();
  });

  it('asks for the order id too', () => {
    renderAt('/order-tracking', routes, {signedIn: false});
    fill('  ', '1712345678');
    expect(screen.getByText('Enter your order ID.')).toBeTruthy();
    expect(trackOrderRequest).not.toHaveBeenCalled();
  });

  it('shows the same message for a wrong number and a wrong phone', async () => {
    trackOrderRequest.mockRejectedValue(failure(['No order matches these details.']));
    renderAt('/order-tracking', routes, {signedIn: false});
    fill(NUMBER, '1712345678');
    expect(await screen.findByText('No order matches these details.')).toBeTruthy();
  });

  it('is prefilled from the order id in the link (the confirmation page links here)', () => {
    renderAt(`/order-tracking?order_id=${NUMBER}`, routes, {signedIn: false});
    expect(screen.getByLabelText('Order ID').value).toBe(NUMBER);
  });
});

describe('The confirmation page', () => {
  const routes = <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />;
  const placed = {order_id: NUMBER, status: 'pending', created_at: '2026-09-23T10:00:00+06:00', subtotal: 1000, delivery_charge: 60, total: 1060};

  it("shows a guest what checkout handed over, and links to tracking with the order id", () => {
    renderAt(`/order-confirmation/${NUMBER}`, routes, {signedIn: false, state: {order: placed}});

    expect(screen.getByText(NUMBER)).toBeTruthy();
    expect(screen.getByText('৳1060.00')).toBeTruthy();
    expect(screen.getByText('Track Order').getAttribute('href')).toBe(`/order-tracking?order_id=${NUMBER}`);
    expect(getOrder).not.toHaveBeenCalled(); // a guest has no account to read it from
  });

  it('reads a signed-in customer\'s order back, address and items included', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    renderAt(`/order-confirmation/${NUMBER}`, routes, {state: {order: placed}});

    expect(await screen.findByText('House 12, Road 5')).toBeTruthy();
    expect(screen.getByText('Red Mug')).toBeTruthy();
    expect(screen.getByText('View Order').getAttribute('href')).toBe(`/orders/${NUMBER}`);
  });

  it('still shows the order id after a refresh (no state), for a guest', () => {
    renderAt(`/order-confirmation/${NUMBER}`, routes, {signedIn: false});
    expect(screen.getByText(NUMBER)).toBeTruthy();
    expect(screen.queryByText(/Total Amount/)).toBeNull();
  });
});

describe('The status timeline', () => {
  it('greys out what has not happened yet', () => {
    render(<OrderTimeline history={[step('pending', 'Pending', 23)]} />);
    expect(screen.getByText('Order Placed')).toBeTruthy();
    expect(screen.getByText('Shipped')).toBeTruthy();
    expect(screen.getByText('Delivered')).toBeTruthy();
    expect(screen.getAllByText('Not yet').length).toBe(2);
  });

  it('shows a cancelled order ending in Cancelled, without the steps that never happened', () => {
    render(<OrderTimeline history={[step('pending', 'Pending', 23), step('cancelled', 'Cancelled', 24)]} />);
    expect(screen.getByText('Cancelled')).toBeTruthy();
    expect(screen.queryByText('Shipped')).toBeNull();
    expect(screen.queryByText('Delivered')).toBeNull();
  });

  it('shows the confirmed step only when staff confirmed the order, between placed and shipped', () => {
    const {container} = render(<OrderTimeline history={[step('pending', 'Pending', 23), step('confirmed', 'Confirmed', 24)]} />);
    expect(screen.getByText('Confirmed')).toBeTruthy();
    const labels = Array.from(container.querySelectorAll('p.font-semibold')).map((node) => node.textContent);
    expect(labels).toEqual(['Order Placed', 'Confirmed', 'Shipped', 'Delivered']);
    cleanup();
    const plain = render(<OrderTimeline history={[step('pending', 'Pending', 23)]} />);
    expect(plain.container.textContent).not.toContain('Confirmed');
  });

  it('puts confirmed before paid when both happened', () => {
    const {container} = render(
      <OrderTimeline history={[step('pending', 'Pending', 23), step('confirmed', 'Confirmed', 24), step('paid', 'Paid', 25), step('shipped', 'Shipped', 26)]} />
    );
    const labels = Array.from(container.querySelectorAll('p.font-semibold')).map((node) => node.textContent);
    expect(labels).toEqual(['Order Placed', 'Confirmed', 'Paid', 'Shipped', 'Delivered']);
  });

  it('ends a parcel that came back in Returned, without Delivered', () => {
    const {container} = render(
      <OrderTimeline history={[step('pending', 'Pending', 23), step('confirmed', 'Confirmed', 24), step('shipped', 'Shipped', 25), step('returned', 'Returned', 27)]} />
    );
    const labels = Array.from(container.querySelectorAll('p.font-semibold')).map((node) => node.textContent);
    expect(labels).toEqual(['Order Placed', 'Confirmed', 'Shipped', 'Returned']);
    expect(container.textContent).not.toContain('Delivered');
    expect(container.querySelector('.bg-red-50')).toBeTruthy(); // the ending is the red step
  });

  it('shows a refund after a delivery as the last step, with Delivered still in place', () => {
    const {container} = render(
      <OrderTimeline history={[step('pending', 'Pending', 23), step('shipped', 'Shipped', 24), step('delivered', 'Delivered', 25), step('refunded', 'Refunded', 26)]} />
    );
    const labels = Array.from(container.querySelectorAll('p.font-semibold')).map((node) => node.textContent);
    expect(labels).toEqual(['Order Placed', 'Shipped', 'Delivered', 'Refunded']);
  });

  it('shows the paid step only when it happened', () => {
    render(<OrderTimeline history={[step('pending', 'Pending', 23), step('paid', 'Paid', 24), step('shipped', 'Shipped', 25)]} />);
    expect(screen.getByText('Paid')).toBeTruthy();
    const {container} = render(<OrderTimeline history={[step('pending', 'Pending', 23)]} />);
    expect(container.textContent).not.toContain('Paid');
  });
});

describe('The status badge', () => {
  it.each([['confirmed', 'Confirmed', 'bg-cyan-100'], ['returned', 'Returned', 'bg-orange-100'], ['pending', 'Pending', 'bg-yellow-100'], ['cancelled', 'Cancelled', 'bg-red-100']])(
    'shows %s with its own colour', (status, label, colour) => {
      render(<OrderStatusBadge status={status} label={label} />);
      expect(screen.getByText(label).className).toContain(colour);
    }
  );

  it('still shows a status it has never heard of, in grey, instead of nothing', () => {
    render(<OrderStatusBadge status="on_hold" label="On hold" />);
    expect(screen.getByText('On hold').className).toContain('bg-gray-100');
  });
});

describe('The order state', () => {
  it('is emptied when the customer logs out, so the next person on this browser sees nothing of it', async () => {
    getOrder.mockResolvedValue({data: {data: DETAIL}});
    const store = makeStore();
    await store.dispatch(fetchOrder(NUMBER));
    expect(store.getState().order.order.order_id).toBe(NUMBER);

    store.dispatch({type: logoutUser.fulfilled.type});

    expect(store.getState().order.order).toBeNull();
  });

  it('keeps the message of a failed lookup for the page', async () => {
    trackOrderRequest.mockRejectedValue(failure(['No order matches these details.']));
    const store = makeStore(false);
    await store.dispatch(trackOrder({order_id: NUMBER, phone_number: '+8801712345678'}));
    expect(store.getState().order.trackingError).toEqual(['No order matches these details.']);
    expect(store.getState().order.tracking).toBeNull();
  });
});

describe('Checkout hands the placed order over to the confirmation page', () => {
  const placed = {order_id: NUMBER, status: 'pending', created_at: '2026-09-23T10:00:00+06:00', subtotal: 1000, delivery_charge: 60, total: 1060};

  it('keeps what POST /orders/ answered, next to the order id the page already used', () => {
    const state = checkoutReducer(undefined, {type: handleCheckout.fulfilled.type, payload: placed});
    expect(state.order_id).toBe(NUMBER);
    expect(state.order).toEqual(placed);
  });

  it('forgets it with the rest of the form', () => {
    const filled = checkoutReducer(undefined, {type: handleCheckout.fulfilled.type, payload: placed});
    expect(checkoutReducer(filled, resetForm()).order).toBeNull();
  });
});
