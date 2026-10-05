// Returns on a delivered order (backend docs/API_CONTRACT.md section 6, "Return requests"): the `returns` block of `GET /orders/{id}/`,
// `POST /orders/{id}/returns/` and `POST /orders/{id}/returns/{id}/cancel/`. Real slice, mocked service.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import orderReducer from '../redux/slice/orderSlice';
import authReducer, {logoutUser} from '../redux/slice/authSlice';
import {cancelReturn, getOrder, requestReturn} from '../services/orderService';
import OrderDetail from '../pages/OrderDetail';

vi.setConfig({testTimeout: 15000});

vi.mock('../services/orderService', () => ({getOrders: vi.fn(), getOrder: vi.fn(), cancelOrder: vi.fn(), trackOrder: vi.fn(), requestReturn: vi.fn(), cancelReturn: vi.fn()}));

const NUMBER = 'GC-20260923-0001';
const MUG = {id: 11, product_id: 7, variant_id: 70, product_slug: 'red-mug', product_name: 'Red Mug', variant_label: 'Default', sku: 'MUG-1', unit_price: 500, base_price: 500, quantity: 3, line_total: 1500, image: null};
const SHIRT = {id: 12, product_id: 8, variant_id: 80, product_slug: 'shirt', product_name: 'Shirt', variant_label: 'Red / M', sku: 'SH-1', unit_price: 300, base_price: 300, quantity: 1, line_total: 300, image: null};
const REASONS = [
  {value: 'damaged', label: 'It arrived damaged', free: true},
  {value: 'size_fit', label: 'The size or fit is wrong', free: false},
  {value: 'other', label: 'Something else', free: false},
];
const request = (extra = {}) => ({
  id: 5, status: 'requested', status_display: 'Requested', reason: 'size_fit', reason_display: 'The size or fit is wrong', details: '', response: '', goods_amount: 500, return_charge: 0, refund_amount: 500,
  created_at: '2026-09-30T10:00:00+06:00', updated_at: '2026-09-30T10:00:00+06:00',
  items: [{item_id: 11, product_name: 'Red Mug', variant_label: 'Default', unit_price: 500, quantity: 1}], ...extra,
});
const returnsBlock = (extra = {}) => ({
  can_request: true, message: null, until: '2026-10-07', return_charge: 60, reasons: REASONS, items: [{item_id: 11, quantity: 3}, {item_id: 12, quantity: 1}], requests: [], ...extra,
});
const DETAIL = (returns, extra = {}) => ({
  order_id: NUMBER, status: 'delivered', status_display: 'Delivered', created_at: '2026-09-23T10:00:00+06:00', total: 1860, items_count: 4, items: [MUG, SHIRT],
  name: 'Rahim', email: '', phone_number: '+8801712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan', shipping_division: '', shipping_district: '', shipping_thana: '',
  shipping_address: 'House 1', subtotal: 1800, delivery_charge: 60, discount_amount: 0, coupon_code: '', can_cancel: false, payment: null, expected_delivery: null,
  history: [{status: 'pending', status_display: 'Pending', created_at: '2026-09-23T10:00:00+06:00'}, {status: 'delivered', status_display: 'Delivered', created_at: '2026-09-30T10:00:00+06:00'}],
  returns, ...extra,
});
const failure = (errors) => ({response: {data: {success: false, errors}}});

const makeStore = () => configureStore({
  reducer: {order: orderReducer, auth: authReducer},
  preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: true}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderDetail = () => {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/orders/${NUMBER}`]}>
        <Routes><Route path="/orders/:orderId" element={<OrderDetail />} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};
const open = async (returns, extra) => {
  getOrder.mockResolvedValue({data: {data: DETAIL(returns, extra)}});
  const utils = renderDetail();
  await screen.findByRole('heading', {name: NUMBER});
  return utils;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The Returns card', () => {
  it('offers Return items on a delivered order, with the last day to ask', async () => {
    await open(returnsBlock());

    expect(screen.getByRole('heading', {name: 'Returns'})).toBeTruthy();
    expect(screen.getByText(/You can ask to return it until Oct 7\./)).toBeTruthy();
    expect(screen.getByRole('button', {name: /Return items/})).toBeTruthy();
    expect(screen.queryByRole('form')).toBeNull(); // nothing to fill in until it is asked for
  });

  it('draws nothing for an order that is not delivered and has no request', async () => {
    await open(returnsBlock({can_request: false, until: null, items: [], reasons: REASONS}), {status: 'shipped'});
    expect(screen.queryByRole('heading', {name: 'Returns'})).toBeNull();
  });

  it('draws nothing when the shop sends no returns block, or has returns switched off and none was asked', async () => {
    await open(null);
    expect(screen.queryByRole('heading', {name: 'Returns'})).toBeNull();
    cleanup();
    await open(returnsBlock({can_request: false, message: 'The shop is not taking return requests right now.', until: null, items: []}));
    expect(screen.queryByRole('heading', {name: 'Returns'})).toBeNull();
  });

  it("says why a delivered order can not be returned any more (the shop's own sentence)", async () => {
    await open(returnsBlock({can_request: false, message: 'The time to return this order ended on 07 Oct 2026.', items: []}));

    expect(screen.getByText('The time to return this order ended on 07 Oct 2026.')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /Return items/})).toBeNull();
  });
});

describe('Asking to return items', () => {
  const openForm = async (returns = returnsBlock()) => {
    await open(returns);
    fireEvent.click(screen.getByRole('button', {name: /Return items/}));
    return screen.getByRole('button', {name: 'Send return request'}).closest('form');
  };

  it('lists the lines that are free to return with how many, and the reasons the shop gave', async () => {
    const form = await openForm();

    expect(within(form).getByRole('checkbox', {name: /Red Mug/})).toBeTruthy();
    expect(within(form).getByText('Up to 3 can be returned')).toBeTruthy();
    expect(within(form).getByRole('checkbox', {name: /Shirt \(Red \/ M\)/})).toBeTruthy();
    expect(within(form).getByText('1 can be returned')).toBeTruthy();
    expect(within(form).getAllByRole('option').map((option) => option.textContent)).toEqual(['Choose a reason', 'It arrived damaged', 'The size or fit is wrong', 'Something else']);
  });

  it('lists only the lines the shop says are still free', async () => {
    const form = await openForm(returnsBlock({items: [{item_id: 12, quantity: 1}]}));
    expect(within(form).queryByRole('checkbox', {name: /Red Mug/})).toBeNull();
    expect(within(form).getByRole('checkbox', {name: /Shirt/})).toBeTruthy();
  });

  it('sends the chosen lines and units with the reason and note, and then shows the request and the answer', async () => {
    const asked = request({details: 'Too big', items: [{item_id: 11, product_name: 'Red Mug', variant_label: 'Default', unit_price: 500, quantity: 2}], goods_amount: 1000, refund_amount: 1000});
    requestReturn.mockResolvedValue({data: {data: DETAIL(returnsBlock({items: [{item_id: 11, quantity: 1}, {item_id: 12, quantity: 1}], requests: [asked]}))}});
    const form = await openForm();

    fireEvent.click(within(form).getByRole('checkbox', {name: /Red Mug/}));
    fireEvent.click(within(form).getByRole('button', {name: 'More Red Mug'}));
    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'size_fit'}});
    fireEvent.change(within(form).getByLabelText(/Tell us more/), {target: {value: ' Too big '}});
    fireEvent.click(within(form).getByRole('button', {name: 'Send return request'}));

    await waitFor(() => expect(requestReturn).toHaveBeenCalledWith(NUMBER, {reason: 'size_fit', details: 'Too big', items: [{item_id: 11, quantity: 2}]}));
    expect(await screen.findByText('Return #5')).toBeTruthy();
    expect(screen.getByText('Your return request was sent. The shop will answer it here.')).toBeTruthy();
    expect(screen.getByText('2 × Red Mug')).toBeTruthy();
    expect(screen.getByText('Your note: Too big')).toBeTruthy();
    expect(screen.getByText('Estimated refund').closest('p').textContent).toContain('৳1,000');
    expect(screen.queryByRole('button', {name: 'Send return request'})).toBeNull(); // the form is closed
    expect(screen.getByRole('button', {name: /Return items/})).toBeTruthy(); // some units are still free
  });

  it('holds the units between 1 and what is free', async () => {
    const form = await openForm();
    fireEvent.click(within(form).getByRole('checkbox', {name: /Red Mug/}));
    const more = within(form).getByRole('button', {name: 'More Red Mug'});
    const fewer = within(form).getByRole('button', {name: 'Fewer Red Mug'});

    expect(fewer.disabled).toBe(true);
    fireEvent.click(more);
    fireEvent.click(more);
    expect(more.disabled).toBe(true);
    expect(within(form).getByRole('group', {name: 'Units of Red Mug to return'}).textContent).toContain('3');
    fireEvent.click(within(form).getByRole('checkbox', {name: /Red Mug/}));
    expect(within(form).queryByRole('group', {name: /Units of/})).toBeNull(); // un-ticked: the stepper goes
  });

  it('has no stepper for a line with one unit free', async () => {
    const form = await openForm();
    fireEvent.click(within(form).getByRole('checkbox', {name: /Shirt/}));
    expect(within(form).queryByRole('group', {name: /Units of Shirt/})).toBeNull();
  });

  it('asks for what is missing before calling the backend, one sentence each', async () => {
    const form = await openForm();

    fireEvent.click(within(form).getByRole('button', {name: 'Send return request'}));

    const alert = within(form).getByRole('alert');
    expect(within(alert).getByText('Choose what you want to return.')).toBeTruthy();
    expect(within(alert).getByText('Choose a reason.')).toBeTruthy();
    expect(requestReturn).not.toHaveBeenCalled();
  });

  it('needs a few words for "Something else"', async () => {
    const form = await openForm();
    fireEvent.click(within(form).getByRole('checkbox', {name: /Shirt/}));
    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'other'}});
    expect(within(form).getByText('(required)')).toBeTruthy();

    fireEvent.click(within(form).getByRole('button', {name: 'Send return request'}));

    expect(within(form).getByText('Please tell us what is wrong.')).toBeTruthy();
    expect(requestReturn).not.toHaveBeenCalled();
  });

  it("shows the shop's sentence when it refuses, keeps what was typed, and does not close", async () => {
    requestReturn.mockRejectedValue(failure(['Only 1 of Red Mug can still be returned.']));
    const form = await openForm();
    fireEvent.click(within(form).getByRole('checkbox', {name: /Shirt/}));
    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'damaged'}});
    fireEvent.change(within(form).getByLabelText(/Tell us more/), {target: {value: 'Torn'}});

    fireEvent.click(within(form).getByRole('button', {name: 'Send return request'}));

    expect(await screen.findByText('Only 1 of Red Mug can still be returned.')).toBeTruthy();
    expect(screen.getByLabelText(/Tell us more/).value).toBe('Torn');
    expect(screen.getByRole('checkbox', {name: /Shirt/}).checked).toBe(true);
    expect(screen.getByRole('button', {name: 'Send return request'}).disabled).toBe(false);
  });

  it('says Sending… and can not be pressed twice while it waits', async () => {
    let finish;
    requestReturn.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const form = await openForm();
    fireEvent.click(within(form).getByRole('checkbox', {name: /Shirt/}));
    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'damaged'}});

    fireEvent.click(within(form).getByRole('button', {name: 'Send return request'}));

    const busy = await screen.findByRole('button', {name: 'Sending…'});
    expect(busy.disabled).toBe(true);
    fireEvent.click(busy);
    expect(requestReturn).toHaveBeenCalledTimes(1);
    finish({data: {data: DETAIL(returnsBlock({items: [], can_request: false, message: 'Everything in this order is already in a return request.', requests: [request()]}))}});
    expect(await screen.findByText('Return #5')).toBeTruthy();
  });

  it('says nothing about cost until a reason is chosen, then whether sending it back is free or what it costs', async () => {
    const form = await openForm();
    expect(within(form).queryByRole('status')).toBeNull();

    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'size_fit'}});
    expect(within(form).getByRole('status').textContent).toBe('Return charge ৳60: the delivery charge of sending it back is taken off your refund.');

    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'damaged'}});
    expect(within(form).getByRole('status').textContent).toBe('Free return: the shop pays for sending it back.');

    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'other'}});
    expect(within(form).getByRole('status').textContent).toContain('Return charge ৳60');
  });

  it('says every return is free when the shop charges nothing for them', async () => {
    const form = await openForm(returnsBlock({return_charge: 0}));
    fireEvent.change(within(form).getByLabelText('Why are you returning it?'), {target: {value: 'size_fit'}});
    expect(within(form).getByRole('status').textContent).toBe('Free return: the shop pays for sending it back.');
  });

  it('closes without sending anything', async () => {
    const form = await openForm();
    fireEvent.click(within(form).getByRole('button', {name: 'Close'}));
    expect(screen.queryByRole('button', {name: 'Send return request'})).toBeNull();
    expect(requestReturn).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: /Return items/})).toBeTruthy();
  });
});

describe('The requests already made', () => {
  const ASKED = request();
  const ANSWERED = request({id: 4, status: 'approved', status_display: 'Approved', response: 'Send it to House 5, Road 2.', refund_amount: 450});
  const PAID = request({id: 3, status: 'completed', status_display: 'Completed', refund_amount: 450});
  const REFUSED = request({id: 2, status: 'rejected', status_display: 'Rejected', response: 'It was used.', refund_amount: 500});

  it('shows each with its status, lines, and the refund as an estimate until it is paid', async () => {
    await open(returnsBlock({can_request: false, items: [], message: 'Everything in this order is already in a return request.', requests: [ASKED, PAID]}));
    const list = screen.getByRole('list', {name: 'Return requests'});

    const [first, second] = within(list).getAllByRole('listitem').filter((row) => row.textContent.includes('Return #'));
    expect(first.textContent).toContain('Return #5');
    expect(first.textContent).toContain('Requested');
    expect(first.textContent).toContain('Estimated refund৳500');
    expect(first.textContent).toContain('The shop pays it back once it has the goods.');
    expect(second.textContent).toContain('Return #3');
    expect(second.textContent).toContain('Refunded৳450');
    expect(second.textContent).not.toContain('Estimated');
    expect(screen.getByText('Everything in this order is already in a return request.')).toBeTruthy();
  });

  it('adds up the money of a request: the goods, the return charge taken off, and the refund', async () => {
    await open(returnsBlock({can_request: false, items: [], message: null, requests: [request({goods_amount: 1000, return_charge: 60, refund_amount: 940})]}));
    const row = screen.getByText('Return #5').closest('li');

    expect(within(row).getByText('Goods').nextSibling.textContent).toBe('৳1,000');
    expect(within(row).getByText('Return charge').nextSibling.textContent).toBe('−৳60');
    expect(within(row).getByText('Estimated refund').nextSibling.textContent).toBe('৳940');
  });

  it('says a return was free when there was no charge', async () => {
    await open(returnsBlock({can_request: false, items: [], message: null, requests: [request({goods_amount: 500, return_charge: 0, refund_amount: 500})]}));
    const row = screen.getByText('Return #5').closest('li');
    expect(within(row).getByText('Return charge').nextSibling.textContent).toBe('Free');
  });

  it('draws only the refund for a shop that sends no breakdown (an older backend)', async () => {
    const {goods_amount, return_charge, ...older} = request();
    await open(returnsBlock({can_request: false, items: [], message: null, requests: [older]}));
    const row = screen.getByText('Return #5').closest('li');
    expect(within(row).queryByText('Goods')).toBeNull();
    expect(within(row).getByText('Estimated refund').nextSibling.textContent).toBe('৳500');
  });

  it('says the goods arrived while the refund is being prepared, with no Cancel request any more', async () => {
    await open(returnsBlock({can_request: false, items: [], message: null, requests: [request({status: 'received', status_display: 'Received'})]}));
    const row = screen.getByText('Return #5').closest('li');

    expect(within(row).getByText('Received').className).toContain('bg-indigo-100');
    expect(within(row).getByText('We have your goods. Your refund is being prepared.')).toBeTruthy();
    expect(within(row).getByText('Estimated refund')).toBeTruthy();
    expect(within(row).queryByText('The shop pays it back once it has the goods.')).toBeNull();
    expect(within(row).queryByRole('button', {name: 'Cancel request'})).toBeNull();
  });

  it("quotes the shop's answer, and gives no refund for a rejected request", async () => {
    await open(returnsBlock({can_request: false, items: [], message: null, until: '2026-10-07', requests: [ANSWERED, REFUSED]}));

    expect(screen.getByText('Send it to House 5, Road 2.')).toBeTruthy();
    const rejected = screen.getByText('Return #2').closest('li');
    expect(within(rejected).getByText('It was used.')).toBeTruthy();
    expect(within(rejected).getByText('Rejected')).toBeTruthy();
    expect(rejected.textContent).not.toContain('refund');
  });

  it('offers Cancel request only on a request nobody has answered', async () => {
    await open(returnsBlock({can_request: false, items: [], message: null, requests: [ASKED, ANSWERED, PAID]}));
    expect(screen.getAllByRole('button', {name: 'Cancel request'})).toHaveLength(1);
    expect(within(screen.getByText('Return #5').closest('li')).getByRole('button', {name: 'Cancel request'})).toBeTruthy();
  });

  it('asks in the page before cancelling, then shows the request as cancelled', async () => {
    cancelReturn.mockResolvedValue({data: {data: DETAIL(returnsBlock({requests: [request({status: 'cancelled', status_display: 'Cancelled'})]}))}});
    await open(returnsBlock({requests: [ASKED]}));

    fireEvent.click(screen.getByRole('button', {name: 'Cancel request'}));
    expect(screen.getByText('Cancel this return request?')).toBeTruthy();
    expect(cancelReturn).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Yes, cancel request'}));

    await waitFor(() => expect(cancelReturn).toHaveBeenCalledWith(NUMBER, 5));
    expect(await screen.findByText('Cancelled')).toBeTruthy();
    expect(screen.queryByText('Cancel this return request?')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Cancel request'})).toBeNull();
  });

  it('does nothing when the customer keeps the request', async () => {
    await open(returnsBlock({requests: [ASKED]}));
    fireEvent.click(screen.getByRole('button', {name: 'Cancel request'}));

    fireEvent.click(screen.getByRole('button', {name: 'Keep request'}));

    expect(cancelReturn).not.toHaveBeenCalled();
    expect(screen.queryByText('Cancel this return request?')).toBeNull();
    expect(screen.getByRole('button', {name: 'Cancel request'})).toBeTruthy();
  });

  it("shows the shop's sentence under that request when it was answered a moment before", async () => {
    cancelReturn.mockRejectedValue(failure(['Only a request the shop has not answered yet can be cancelled. Please contact us.']));
    await open(returnsBlock({requests: [ASKED]}));
    fireEvent.click(screen.getByRole('button', {name: 'Cancel request'}));
    fireEvent.click(screen.getByRole('button', {name: 'Yes, cancel request'}));

    expect(await screen.findByText(/Only a request the shop has not answered yet can be cancelled/)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('Cancel this return request?')).toBeNull()); // the question closes, the sentence stays
  });
});

describe('The order state', () => {
  it('forgets a half-sent return when the next person signs in on this browser', async () => {
    requestReturn.mockRejectedValue(failure(['Something is wrong.']));
    const {store} = await open(returnsBlock());
    fireEvent.click(screen.getByRole('button', {name: /Return items/}));
    fireEvent.click(screen.getByRole('checkbox', {name: /Shirt/}));
    fireEvent.change(screen.getByLabelText('Why are you returning it?'), {target: {value: 'damaged'}});
    fireEvent.click(screen.getByRole('button', {name: 'Send return request'}));
    await screen.findByText('Something is wrong.');
    expect(store.getState().order.returnError).toEqual(['Something is wrong.']);

    await act(async () => { await store.dispatch(logoutUser.fulfilled()); });

    expect(store.getState().order.returnError).toBeNull();
    expect(store.getState().order.order).toBeNull();
  });

  it('drops an answer for an order that is no longer on the page', async () => {
    let finish;
    requestReturn.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const {store} = await open(returnsBlock());
    fireEvent.click(screen.getByRole('button', {name: /Return items/}));
    fireEvent.click(screen.getByRole('checkbox', {name: /Shirt/}));
    fireEvent.change(screen.getByLabelText('Why are you returning it?'), {target: {value: 'damaged'}});
    fireEvent.click(screen.getByRole('button', {name: 'Send return request'}));
    await screen.findByRole('button', {name: 'Sending…'});

    await act(async () => {
      store.dispatch({type: 'order/clearOrder'});
      finish({data: {data: DETAIL(returnsBlock({requests: [request()]}))}});
    });

    await waitFor(() => expect(store.getState().order.returnLoading).toBe(false));
    expect(store.getState().order.order).toBeNull();
  });
});
