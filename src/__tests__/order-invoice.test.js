// The printable invoice of one of my orders (`/orders/:orderId/invoice`, drawn outside the storefront's layout) and the link to it from the
// order page. Real slices, mocked services.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import orderReducer from '../redux/slice/orderSlice';
import siteReducer from '../redux/slice/siteSlice';
import authReducer from '../redux/slice/authSlice';
import {getOrder} from '../services/orderService';
import {getSite} from '../services/siteService';
import OrderInvoice from '../pages/OrderInvoice';
import OrderDetail from '../pages/OrderDetail';

vi.setConfig({testTimeout: 15000});

vi.mock('../services/orderService', () => ({getOrders: vi.fn(), getOrder: vi.fn(), cancelOrder: vi.fn(), trackOrder: vi.fn()}));
vi.mock('../services/siteService', () => ({getSite: vi.fn(), getSitePage: vi.fn(), getFaqs: vi.fn(), sendContactMessage: vi.fn(), subscribeToNewsletter: vi.fn()}));

const NUMBER = 'GC-20260923-0001';
const SITE = {
  name: 'GoCart', tagline: 'Everyday things', logo: 'http://localhost:8000/media/logo.png',
  contact: {email: 'support@gocart.example', phone: '+880 1700-000000', address: 'House 12, Dhaka', opening_hours: '', map_url: ''},
};
const ORDER = (extra = {}) => ({
  order_id: NUMBER, status: 'delivered', status_display: 'Delivered', created_at: '2026-09-23T10:00:00+06:00', total: 960, items_count: 3,
  items: [
    {id: 1, product_id: 7, variant_id: 70, product_slug: 'red-mug', product_name: 'Red Mug', variant_label: 'Default', sku: 'MUG-1', unit_price: 500, base_price: 500, quantity: 2, line_total: 1000, image: null},
    {id: 2, product_id: 8, variant_id: 80, product_slug: 'shirt', product_name: 'Shirt', variant_label: 'Red / M', sku: 'SH-1', unit_price: 300, base_price: 300, quantity: 1, line_total: 300, image: null},
  ],
  name: 'Rahim Uddin', email: 'rahim@example.com', phone_number: '+8801712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan', shipping_division: '',
  shipping_district: '', shipping_thana: '', shipping_address: 'House 12, Road 5', subtotal: 1300, delivery_charge: 60, discount_amount: 400, coupon_code: 'SUMMER',
  can_cancel: false, expected_delivery: null, returns: null,
  payment: {method: 'cod', method_display: 'Cash on delivery', status: 'paid', status_display: 'Paid', amount: 960, paid_at: '2026-09-25T12:00:00+06:00', refunded_at: null},
  history: [{status: 'pending', status_display: 'Pending', created_at: '2026-09-23T10:00:00+06:00'}], ...extra,
});

const makeStore = (siteLoaded = false) => configureStore({
  reducer: {order: orderReducer, site: siteReducer, auth: authReducer},
  preloadedState: {
    auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: true},
    ...(siteLoaded ? {site: {...siteReducer(undefined, {type: '@@init'}), isLoaded: true, site: {...siteReducer(undefined, {type: '@@init'}).site, ...SITE}}} : {}),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderInvoice = ({siteLoaded = false} = {}) => {
  const store = makeStore(siteLoaded);
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/orders/${NUMBER}/invoice`]}>
        <Routes>
          <Route path="/orders/:orderId/invoice" element={<OrderInvoice />} />
          <Route path="/orders/:orderId" element={<p>the order page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.title = 'GoCart';
  getOrder.mockResolvedValue({data: {data: ORDER()}});
  getSite.mockResolvedValue({data: {data: {site: SITE}}});
  window.print = vi.fn();
});
afterEach(() => {
  document.title = 'GoCart';
});

describe('The invoice', () => {
  it('has the shop on one side and the order on the other', async () => {
    renderInvoice();

    expect(await screen.findByRole('heading', {name: 'Invoice'})).toBeTruthy();
    expect(screen.getByText(NUMBER)).toBeTruthy();
    expect(screen.getByText(/Date:/).textContent).toContain('2026');
    expect(screen.getByText('Status: Delivered')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('GoCart')).toBeTruthy());
    expect(screen.getByText('House 12, Dhaka')).toBeTruthy();
    expect(screen.getByText('+880 1700-000000')).toBeTruthy();
    expect(screen.getByText('support@gocart.example')).toBeTruthy();
    expect(document.querySelector('img[src$="logo.png"]')).toBeTruthy();
    expect(screen.getByText('Thank you for shopping with GoCart.')).toBeTruthy();
  });

  it('says who it is billed to, where it goes and how it was paid', async () => {
    renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});

    expect(screen.getByText('Rahim Uddin')).toBeTruthy();
    expect(screen.getByText('House 12, Road 5')).toBeTruthy();
    expect(screen.getByText('Gulshan, Dhaka')).toBeTruthy();
    expect(screen.getByText('+8801712345678')).toBeTruthy();
    expect(screen.getByText('rahim@example.com')).toBeTruthy();
    expect(screen.getByText('Cash on delivery')).toBeTruthy();
    expect(screen.getByText(/^Paid on /)).toBeTruthy();
  });

  it('lists each line with its variant, SKU, price, units and amount, and the sums add up', async () => {
    renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});

    const table = screen.getByRole('table', {name: `Items of order ${NUMBER}`});
    const [mug, shirt] = within(table).getAllByRole('row').slice(1);
    expect(mug.textContent).toContain('Red Mug');
    expect(mug.textContent).toContain('SKU MUG-1');
    expect(mug.textContent).not.toContain('Default'); // not a variant worth saying
    expect(mug.textContent).toContain('৳500');
    expect(mug.textContent).toContain('৳1,000');
    expect(shirt.textContent).toContain('Red / M');
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Item', 'Price', 'Qty', 'Amount']);

    const sums = screen.getByText('Subtotal').closest('dl');
    expect(sums.textContent).toContain('৳1,300');
    expect(sums.textContent).toContain('৳60');
    expect(sums.textContent).toContain('SUMMER');
    expect(sums.textContent).toContain('−৳400');
    expect(within(sums).getByText('Total').nextSibling.textContent).toBe('৳960');
  });

  it('says so when there is no payment record, and leaves out an e-mail the order does not have', async () => {
    getOrder.mockResolvedValue({data: {data: ORDER({payment: null, email: ''})}});
    renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});
    expect(screen.getByText('No payment record.')).toBeTruthy();
    expect(screen.queryByText('rahim@example.com')).toBeNull();
  });

  it('prints with the print button, and leaves the buttons off the paper', async () => {
    renderInvoice();
    const button = await screen.findByRole('button', {name: /Print or save as PDF/});

    fireEvent.click(button);

    expect(window.print).toHaveBeenCalledTimes(1);
    expect(button.parentElement.className).toContain('print:hidden');
    expect(screen.getByRole('link', {name: /Back to the order/}).parentElement.className).toContain('print:hidden');
  });

  it('goes back to the order', async () => {
    renderInvoice();
    fireEvent.click(await screen.findByRole('link', {name: /Back to the order/}));
    expect(await screen.findByText('the order page')).toBeTruthy();
  });

  it('names the saved file after the order, and puts the title back when it goes', async () => {
    const {unmount} = renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});
    expect(document.title).toBe(`Invoice ${NUMBER}`);

    unmount();

    expect(document.title).toBe('GoCart');
  });

  it('reads the shop itself (nothing around it did), but only once', async () => {
    renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});
    await waitFor(() => expect(screen.getByText('GoCart')).toBeTruthy());
    expect(getSite).toHaveBeenCalledTimes(1);
    cleanup();
    getSite.mockClear();

    renderInvoice({siteLoaded: true});
    await screen.findByRole('heading', {name: 'Invoice'});
    expect(getSite).not.toHaveBeenCalled();
    expect(screen.getByText('GoCart')).toBeTruthy();
  });

  it('is still an invoice when the shop could not be read: the order, without the shop\'s details', async () => {
    getSite.mockRejectedValue({response: {data: {error: 'No.'}}});
    renderInvoice();
    await screen.findByRole('heading', {name: 'Invoice'});
    expect(screen.getByText('Thank you for your order.')).toBeTruthy();
    expect(screen.getByText('Rahim Uddin')).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(getSite).toHaveBeenCalledTimes(1); // a failure is not asked again and again
  });
});

describe('Before the order arrives, or when it never does', () => {
  it('shows a skeleton, not "not found", while it loads', async () => {
    getOrder.mockReturnValue(new Promise(() => {}));
    renderInvoice();
    await act(async () => {});
    expect(screen.queryByText(/couldn.t find/)).toBeNull();
    expect(screen.queryByRole('heading', {name: 'Invoice'})).toBeNull();
  });

  it('says the order was not found (somebody else\'s or unknown) without offering to try again', async () => {
    getOrder.mockRejectedValue({response: {status: 404, data: {success: false, errors: ['Order not found.']}}});
    renderInvoice();
    expect(await screen.findByText("We couldn't find this order.")).toBeTruthy();
    expect(screen.queryByRole('button', {name: /Try again/})).toBeNull();
    expect(screen.getByRole('link', {name: 'Back to my orders'})).toBeTruthy();
  });

  it('offers Try again for any other failure, and asks again', async () => {
    getOrder.mockRejectedValueOnce({response: {status: 500, data: {success: false, errors: ['Server trouble.']}}});
    renderInvoice();
    fireEvent.click(await screen.findByRole('button', {name: /Try again/}));
    expect(await screen.findByRole('heading', {name: 'Invoice'})).toBeTruthy();
    expect(getOrder).toHaveBeenCalledTimes(2);
  });
});

describe('The link from the order page', () => {
  const renderDetail = (order) => {
    getOrder.mockResolvedValue({data: {data: order}});
    return render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={[`/orders/${NUMBER}`]}>
          <Routes>
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/orders/:orderId/invoice" element={<p>the invoice</p>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('opens the invoice of that order', async () => {
    renderDetail(ORDER());
    const link = await screen.findByRole('link', {name: /View invoice/});
    expect(link.getAttribute('href')).toBe(`/orders/${NUMBER}/invoice`);
    fireEvent.click(link);
    expect(await screen.findByText('the invoice')).toBeTruthy();
  });

  it('is not there for a cancelled order', async () => {
    renderDetail(ORDER({status: 'cancelled', status_display: 'Cancelled'}));
    await screen.findByRole('heading', {name: NUMBER});
    expect(screen.queryByRole('link', {name: /View invoice/})).toBeNull();
  });
});
