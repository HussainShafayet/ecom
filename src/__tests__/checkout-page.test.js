// The checkout page, phone first: the order folded above the form (read-only, changed in the cart), fields with labels the phone can
// fill in, a phone number that is what the backend wants (10 digits after +880), one sentence per problem with the customer taken
// to the first one, saved addresses as a radio group, and the total and Place Order in a bar fixed above the bottom navigation.
// (The promo code box is covered in coupon-checkout.test.js, the refusal box in checkout-errors.test.js.)
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import checkoutReducer, {handleCheckout} from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {normalizePhone, validateCheckout, validateField} from '../utils/checkoutValidation';

// The first test imports the whole checkout page on a cold start: more than the default 5 s on a busy machine
vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const MUG = {
  id: 1, name: 'Mug', slug: 'mug', image: '', base_price: 500, discount_price: 500, has_discount: false, quantity: 1,
  minimum_order_quantity: 1, variant_id: 1, availability_status: true, brand_name: 'Acme', color_name: 'Red', size_name: 'M',
};
const KETTLE = {
  id: 2, name: 'Kettle', slug: 'kettle', image: '', base_price: 1000, discount_price: 800, has_discount: true, discount_value: 20, discount_type: 'percentage',
  quantity: 2, minimum_order_quantity: 1, variant_id: 2, availability_status: true,
};
const HOME = {id: 7, title: 'Home', address: 'House 5, Road 3', shipping_type: 'inside_dhaka', area: 'Gulshan', division: '', district: '', thana: ''};

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({signedIn = false, cartItems = [MUG]} = {}) => configureStore({
  reducer: {cart: cartReducer, product: productReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, checkout: checkoutReducer},
  preloadedState: {
    auth: {...init(authReducer), isAuthenticated: signedIn},
    cart: {...init(cartReducer), cartItems},
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderCheckout = async ({signedIn = false, cartItems, delivery = {inside_dhaka: 60, outside_dhaka: 120}, addresses = []} = {}) => {
  const {default: Checkout} = await import('../pages/Checkout');
  const content = {data: {data: {delivery_charges: delivery, shipping_addresses: addresses, user_info: null}}};
  publicApi.get.mockResolvedValue(content);
  api.get.mockImplementation((url) => (String(url).includes('accounts/cart') ? Promise.resolve({data: {data: cartItems || [MUG]}}) : Promise.resolve(content)));
  const store = makeStore({signedIn, cartItems});
  const utils = render(<Provider store={store}><MemoryRouter><Checkout /></MemoryRouter></Provider>);
  await screen.findByText('Place Order');
  return {store, ...utils};
};

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});
const fillValidForm = () => {
  type('Full name', 'Rahim Uddin');
  type('Phone number', '1712345678');
  type('Delivery area', 'inside_dhaka');
  type('Area in Dhaka', 'Gulshan');
  type('Full address', 'House 1, Road 2');
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('The validation rules', () => {
  it('turns whatever was typed into the 10 digits after +880', () => {
    expect(normalizePhone('01712345678')).toBe('1712345678');
    expect(normalizePhone('8801712345678')).toBe('1712345678');
    expect(normalizePhone('+880 1712-345678')).toBe('1712345678');
    expect(normalizePhone('17a12b345678999')).toBe('1712345678'); // no letters, at most 10 digits
    expect(normalizePhone('')).toBe('');
  });

  it('say one clear sentence per problem, and only for what applies to the chosen delivery area', () => {
    expect(validateField('name', '  ')).toBe('Enter your full name');
    expect(validateField('phone_number', '')).toBe('Enter your phone number');
    expect(validateField('phone_number', '12345')).toBe('Enter 10 digits after +880, for example 1712345678');
    expect(validateField('phone_number', '1712345678')).toBe('');
    expect(validateField('division', '', {shipping_type: 'inside_dhaka'})).toBe(''); // not asked inside Dhaka
    expect(validateField('division', '', {shipping_type: 'outside_dhaka'})).toBe('Choose your division');
    expect(validateCheckout({shipping_type: 'inside_dhaka'})).toMatchObject({name: expect.any(String), phone_number: expect.any(String), shipping_area: 'Choose your area in Dhaka', address: expect.any(String)});
  });

  it('treat a delivery charge of 0 as free delivery, and only a missing charge as a problem', () => {
    const form = {name: 'A', phone_number: '1712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan', address: 'x'};
    expect(validateCheckout(form, {deliveryChargeKnown: true})).toEqual({});
    expect(validateCheckout(form, {deliveryChargeKnown: false}).delivery_charge).toContain('delivery charge');
  });
});

describe('The layout on a phone', () => {
  it('has the order folded above the form, and the form first on the page', async () => {
    await renderCheckout();
    const summary = screen.getByRole('button', {name: /Order summary/});
    expect(summary.getAttribute('aria-expanded')).toBe('false');
    expect(summary.textContent).toContain('1 item');
    expect(summary.textContent).toContain('৳500');
    // the summary comes before the form's first field in the page, and is only one line tall until opened
    expect(summary.compareDocumentPosition(screen.getByLabelText('Full name')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(summary);
    expect(summary.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the order read-only: it is changed in the cart', async () => {
    await renderCheckout({cartItems: [MUG, KETTLE]});
    const list = screen.getByRole('list');
    expect(within(list).getByText('Mug')).toBeTruthy();
    expect(within(list).getByText('2 × ৳800')).toBeTruthy(); // 2 x the discounted price
    expect(within(list).getByText('৳1,600')).toBeTruthy();
    expect(screen.queryByLabelText(/Increase quantity/)).toBeNull();
    expect(screen.queryByText('+')).toBeNull();
    expect(screen.queryByText(/Are you sure/)).toBeNull();
    expect(screen.getByText('Edit cart').closest('a').getAttribute('href')).toBe('/cart');
  });

  it('has no scroll box inside the page on a phone (only from lg)', async () => {
    const {container} = await renderCheckout();
    const phoneScroll = [...container.querySelectorAll('[class]')].filter((node) => /(^| )(max-h-|overflow-y-auto)/.test(node.getAttribute('class')));
    expect(phoneScroll).toEqual([]);
  });

  it('has the total and Place Order in a bar just above the bottom navigation, and room for it', async () => {
    const {container} = await renderCheckout();
    const bar = screen.getByText('Place Order').closest('div.fixed');

    expect(bar.className).toContain('bottom-14'); // the bottom navigation is 56 px
    expect(bar.className).toContain('md:bottom-0'); // none from md
    expect(bar.className).toContain('lg:static'); // an ordinary button under the form from lg
    expect(within(bar).getByText('Total + delivery')).toBeTruthy(); // no delivery area chosen yet
    expect(within(bar).getByText('৳500')).toBeTruthy();
    expect(container.firstChild.className).toContain('pb-44');
    expect(screen.getByText('Place Order').closest('button').type).toBe('submit');
  });

  it('adds the delivery charge to the total once an area is chosen', async () => {
    await renderCheckout();
    const bar = screen.getByText('Place Order').closest('div.fixed');
    expect(screen.getByText('Choose an area')).toBeTruthy(); // the summary's shipping line

    type('Delivery area', 'inside_dhaka');

    expect(within(bar).getByText('Total')).toBeTruthy();
    expect(within(bar).getByText('৳560')).toBeTruthy(); // 500 + 60
    expect(screen.getByText('৳60')).toBeTruthy();
    expect(screen.queryByText('Choose an area')).toBeNull();
  });
});

describe('The form', () => {
  it('has a visible label for every field and the attributes a phone fills in from', async () => {
    const {container} = await renderCheckout();

    expect(screen.getByLabelText('Full name').getAttribute('autocomplete')).toBe('name');
    const phone = screen.getByLabelText('Phone number');
    expect(phone.getAttribute('type')).toBe('tel');
    expect(phone.getAttribute('inputmode')).toBe('numeric');
    expect(phone.getAttribute('autocomplete')).toBe('tel-national');
    const email = screen.getByLabelText(/^Email/);
    expect(email.getAttribute('type')).toBe('email');
    expect(email.getAttribute('autocomplete')).toBe('email');
    const address = screen.getByLabelText('Full address');
    expect(address.tagName).toBe('TEXTAREA'); // an address is not one line
    expect(address.getAttribute('autocomplete')).toBe('street-address');
    expect(screen.getByText('+880')).toBeTruthy(); // a fixed prefix, not a one-option select
    expect(screen.getByText('(optional)')).toBeTruthy();
    // our own sentences, not the browser's bubbles
    expect(container.querySelector('form').noValidate).toBe(true);
    expect(container.querySelector('[required]')).toBeNull();
  });

  it('accepts the phone number the way people write it', async () => {
    await renderCheckout();
    const phone = screen.getByLabelText('Phone number');

    type('Phone number', '01712345678');
    expect(phone.value).toBe('1712345678');
    type('Phone number', '+880 1712-345678');
    expect(phone.value).toBe('1712345678');
    type('Phone number', '1712abc');
    expect(phone.value).toBe('1712');
  });

  it('says what is wrong with a field when it is left, under it', async () => {
    await renderCheckout();

    fireEvent.blur(screen.getByLabelText('Full name'));
    expect(screen.getByText('Enter your full name')).toBeTruthy();

    type('Phone number', '12345');
    fireEvent.blur(screen.getByLabelText('Phone number'));
    expect(screen.getByText('Enter 10 digits after +880, for example 1712345678')).toBeTruthy();
    expect(screen.getByLabelText('Phone number').getAttribute('aria-invalid')).toBe('true');

    type('Full name', 'Rahim'); // typing something clears the sentence
    expect(screen.queryByText('Enter your full name')).toBeNull();
  });

  it('shows every problem when Place Order is pressed, takes the customer to the first one, and sends nothing', async () => {
    await renderCheckout();

    fireEvent.click(screen.getByText('Place Order'));

    expect(screen.getByText('Enter your full name')).toBeTruthy();
    expect(screen.getByText('Enter your phone number')).toBeTruthy();
    expect(screen.getByText('Choose your delivery area')).toBeTruthy();
    expect(screen.getByText('Enter your full address (house, road, area)')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Full name'));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(publicApi.post).not.toHaveBeenCalled();
  });

  it('asks for the division, district and upazila only for a delivery outside Dhaka', async () => {
    await renderCheckout();
    expect(screen.queryByLabelText('Division')).toBeNull();

    type('Delivery area', 'outside_dhaka');
    expect(screen.getByLabelText('Division')).toBeTruthy();
    expect(screen.getByLabelText('District').disabled).toBe(true); // after the division
    expect(screen.getByLabelText(/Upazila/).disabled).toBe(true);
    expect(screen.queryByLabelText('Area in Dhaka')).toBeNull();
  });
});

describe('Placing the order', () => {
  it('sends +880 and the 10 digits, the delivery charge, and prints nothing about the customer to the console', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    publicApi.post.mockResolvedValue({data: {success: true, data: {order_id: 'GC-1'}}});
    await renderCheckout();
    fillValidForm();

    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => expect(publicApi.post).toHaveBeenCalled());
    const [url, body] = publicApi.post.mock.calls[0];
    expect(url).toBe('/orders/');
    expect(body).toMatchObject({name: 'Rahim Uddin', phone_number: '+8801712345678', shipping_type: 'inside_dhaka', shipping_area: 'Gulshan', shipping_address: 'House 1, Road 2', delivery_charge: 60, payment_type: 'cash'});
    expect(body.total_price).toBe('560.00');
    expect(log.mock.calls.some((call) => call.some((argument) => JSON.stringify(argument)?.includes('Rahim Uddin')))).toBe(false); // the body used to be logged
  });

  it('sends an order with free delivery (a charge of 0), which used to be refused as "Delivery Charge is required"', async () => {
    publicApi.post.mockResolvedValue({data: {success: true, data: {order_id: 'GC-2'}}});
    await renderCheckout({delivery: {inside_dhaka: 0, outside_dhaka: 120}});
    fillValidForm();

    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => expect(publicApi.post).toHaveBeenCalled());
    expect(publicApi.post.mock.calls[0][1]).toMatchObject({delivery_charge: 0, total_price: '500.00'});
  });

  it('does not send an order whose delivery cannot be priced, and says so at the delivery area', async () => {
    await renderCheckout({delivery: {}});
    fillValidForm();

    fireEvent.click(screen.getByText('Place Order'));

    expect(screen.getByText(/could not work out the delivery charge/)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Delivery area'));
    expect(publicApi.post).not.toHaveBeenCalled();
  });

  it('says it is placing the order, and cannot be pressed twice', async () => {
    const {store} = await renderCheckout();
    store.dispatch({type: handleCheckout.pending.type});

    const button = await screen.findByText('Placing order…');
    expect(button.closest('button').disabled).toBe(true);
    expect(screen.queryByText(/Progreccing/)).toBeNull();
  });

  it('is cash on delivery, drawn as the chosen one of a choice', async () => {
    await renderCheckout();
    const cash = screen.getByRole('radio', {name: /Cash on Delivery/});
    expect(cash.checked).toBe(true);
    expect(screen.getByText(/Pay when your order arrives/)).toBeTruthy();
  });
});

describe('Saved addresses', () => {
  it('are a radio group that fills the form, and typing the name does not un-choose one (typing the address does)', async () => {
    await renderCheckout({signedIn: true, addresses: [HOME]});

    const radio = await screen.findByRole('radio', {name: /Home/});
    expect(screen.getByRole('radiogroup', {name: 'Saved addresses'})).toBeTruthy();
    expect(radio.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(radio);
    expect(radio.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByLabelText('Full address').value).toBe('House 5, Road 3');
    expect(screen.getByLabelText('Delivery area').value).toBe('inside_dhaka');

    type('Full name', 'Rahim Uddin'); // ... nothing to do with the address
    expect(radio.getAttribute('aria-checked')).toBe('true');

    type('Full address', 'House 6, Road 3'); // ... this is a different address now
    expect(radio.getAttribute('aria-checked')).toBe('false');
  });

  it('draw nothing (no "No addresses found!") for a customer without any', async () => {
    await renderCheckout({signedIn: true, addresses: []});
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.queryByText(/No addresses found/)).toBeNull();
  });
});
