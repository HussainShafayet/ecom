// The cart, phone first: a checkout bar that is not hidden behind the bottom navigation, no scroll box inside the page, lines you
// can read and change with your thumb (what a line comes to, a typed quantity, what the shop said about THAT line under it),
// a removal you undo instead of confirming, "Clear cart" without covering the list, an empty cart that points on, and more
// to add as a swipe row. (The minimum order and the stock message of the cart are also covered in checkout-errors.test.js.)
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer, {setSectionError} from '../redux/slice/globalErrorSlice';
import recentlyViewedReducer, {recordViewed} from '../redux/slice/recentlyViewedSlice';
import api from '../api/axiosSetup';
import {getAllProducts} from '../services/productService';
import Cart from '../pages/Cart';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getAllProducts: vi.fn()}));
// the quantity update is debounced by a second; here it goes out at once
vi.mock('lodash.debounce', () => ({default: (fn) => fn}));

const KNIFE = {
  id: 9, name: 'Lite Chef Knife Set', slug: 'lite-chef-knife-set', image: '', base_price: 500, discount_price: 500, has_discount: false,
  quantity: 2, minimum_order_quantity: 1, variant_id: 5, brand_name: 'Acme', color_name: 'Red', size_name: 'M', avg_rating: 4.5, availability_status: true,
};
const MUG = {
  id: 10, name: 'Blue Mug', slug: 'blue-mug', image: '', base_price: 500, discount_price: 400, has_discount: true, discount_value: 20, discount_type: 'percentage',
  quantity: 1, minimum_order_quantity: 1, variant_id: 6, availability_status: true,
};
const OTHER = (id) => ({id, name: `Other ${id}`, slug: `other-${id}`, image: '', base_price: 100, has_discount: false, availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0});
const failure = (errors) => ({response: {data: {success: false, errors}}});

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({cartItems = [KNIFE, MUG], signedIn = false, sectionErrors = {}} = {}) => configureStore({
  reducer: {cart: cartReducer, product: productReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, recentlyViewed: recentlyViewedReducer},
  preloadedState: {
    auth: {...init(authReducer), isAuthenticated: signedIn},
    cart: {...init(cartReducer), cartItems},
    globalError: {sectionErrors},
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderCart = (options = {}) => {
  const store = makeStore(options);
  const utils = render(<Provider store={store}><MemoryRouter><Cart /></MemoryRouter></Provider>);
  return {store, ...utils};
};
const line = (name) => screen.getByRole('heading', {level: 2, name}).closest('li');

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  getAllProducts.mockResolvedValue({data: {data: {results: [], next: null}}});
  api.get.mockResolvedValue({data: {data: {results: [], count: 0}}});
});

afterEach(() => {
  vi.useRealTimers();
});

describe('The layout on a phone', () => {
  it('has the checkout bar just above the bottom navigation (it used to be under it), and room for it', () => {
    const {container} = renderCart();
    const bar = screen.getByText('Checkout').closest('div.fixed');

    expect(bar.className).toContain('bottom-14'); // the bottom navigation is 56 px
    expect(bar.className).toContain('md:bottom-0'); // there is no bottom navigation from md
    expect(bar.className).toContain('lg:hidden'); // the order summary has the button from lg
    expect(within(bar).getByText('৳1,400')).toBeTruthy(); // 2 x 500 + 400
    expect(container.firstChild.className).toContain('pb-44'); // the last line is not hidden behind the two bars
  });

  it('has no scroll box inside the page', () => {
    const {container} = renderCart();
    expect(container.querySelector('[class*="max-h-"]')).toBeNull();
    expect(container.querySelector('.overflow-y-auto')).toBeNull();
  });

  it('leaves the Proceed to Checkout button to the order summary from lg, and says delivery comes at checkout', () => {
    renderCart();
    const summaryButton = screen.getByText('Proceed to Checkout');
    expect(summaryButton.parentElement.className).toContain('hidden lg:block');
    expect(summaryButton.closest('a').getAttribute('href')).toBe('/checkout');
    expect(screen.getByText('The delivery charge is added at checkout.')).toBeTruthy();
  });

  it('says why checkout is greyed out, in the bar itself', () => {
    renderCart({cartItems: [{...KNIFE, minimum_order_quantity: 3, quantity: 1}]});
    expect(screen.getByText('Some items are below their minimum order.')).toBeTruthy();
    expect(screen.getByText('Checkout').closest('a')).toBeNull();
  });
});

describe('A line', () => {
  it('shows what it is, its price and what the line comes to, and no average rating', () => {
    renderCart();
    const knife = line('Lite Chef Knife Set');

    expect(within(knife).getByText('Acme · Color: Red · Size: M')).toBeTruthy();
    expect(within(knife).getByText('৳500')).toBeTruthy();
    expect(within(knife).getByLabelText('Line total ৳1,000')).toBeTruthy(); // 2 x 500
    expect(screen.queryByText(/Avg Rating/)).toBeNull();
    // the picture and the name both lead to the product
    within(knife).getAllByRole('link', {name: 'Lite Chef Knife Set'}).forEach((link) => expect(link.getAttribute('href')).toBe('/products/detail/lite-chef-knife-set'));
  });

  it('shows the discounted price with the old one struck through', () => {
    renderCart();
    const mug = line('Blue Mug');
    expect(within(mug).getAllByText('৳400')).toHaveLength(2); // the price and, for one of it, the line total
    expect(within(mug).getByText('৳500').className).toContain('line-through');
    expect(within(mug).getByText('20% OFF')).toBeTruthy();
    expect(within(mug).getByLabelText('Line total ৳400')).toBeTruthy();
  });

  it('is a separate line for another colour or size of the same product', () => {
    renderCart({cartItems: [KNIFE, {...KNIFE, variant_id: 7, size_name: 'L'}]});
    expect(screen.getAllByRole('heading', {level: 2, name: 'Lite Chef Knife Set'})).toHaveLength(2);
  });
});

describe('The quantity of a line', () => {
  it('changes with − and + (and the line total follows), and can be typed', () => {
    renderCart({cartItems: [KNIFE]});
    const knife = line('Lite Chef Knife Set');

    fireEvent.click(within(knife).getByLabelText(/^Increase quantity/));
    expect(within(knife).getByLabelText('Line total ৳1,500')).toBeTruthy();

    fireEvent.change(within(knife).getByLabelText(/^Quantity of/), {target: {value: '7'}});
    expect(within(knife).getByLabelText('Line total ৳3,500')).toBeTruthy();
  });

  it('never goes below the minimum order, whatever is typed', () => {
    renderCart({cartItems: [{...KNIFE, minimum_order_quantity: 3, quantity: 5}]});
    const knife = line('Lite Chef Knife Set');
    const box = within(knife).getByLabelText(/^Quantity of/);

    fireEvent.change(box, {target: {value: '1'}}); // not accepted...
    fireEvent.blur(box); // ...and the box shows what is kept
    expect(box.value).toBe('5');
  });

  it('is told to the server for a signed-in customer, and the cart is not fetched again for it', async () => {
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    api.get.mockResolvedValue({data: {data: [KNIFE]}});
    renderCart({cartItems: [KNIFE], signedIn: true});
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1)); // once, when the page opens

    fireEvent.click(screen.getByLabelText(/^Increase quantity/));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/accounts/cart/', {product_id: 9, quantity: 1, variant_id: 5, action: 'increase'}, {section: 'add-cart'}));
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('says why the shop refused, under that line and not under the others', async () => {
    api.post.mockRejectedValue(failure(['Only 2 of Lite Chef Knife Set left in stock.']));
    api.get.mockResolvedValue({data: {data: [KNIFE, MUG]}});
    renderCart({signedIn: true});
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.click(within(line('Lite Chef Knife Set')).getByLabelText(/^Increase quantity/));

    const alert = await within(line('Lite Chef Knife Set')).findByRole('alert');
    expect(alert.textContent).toBe('Only 2 of Lite Chef Knife Set left in stock.');
    expect(within(line('Blue Mug')).queryByRole('alert')).toBeNull();
  });
});

describe('Removing', () => {
  it('is done at once, with "Removed ... Undo" instead of asking first, and Undo puts it back as it was', () => {
    renderCart();

    fireEvent.click(screen.getByLabelText('Remove Lite Chef Knife Set from the cart'));

    expect(screen.queryByText(/Are you sure/)).toBeNull();
    expect(screen.queryByRole('heading', {level: 2, name: 'Lite Chef Knife Set'})).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Removed “Lite Chef Knife Set”');

    fireEvent.click(screen.getByText('Undo'));

    expect(within(line('Lite Chef Knife Set')).getByLabelText('Line total ৳1,000')).toBeTruthy(); // its 2 came back
    expect(screen.queryByText('Undo')).toBeNull();
  });

  it('offers Undo for 6 seconds', () => {
    vi.useFakeTimers();
    renderCart();
    fireEvent.click(screen.getByLabelText('Remove Blue Mug from the cart'));
    expect(screen.getByText('Undo')).toBeTruthy();

    act(() => { vi.advanceTimersByTime(5900); });
    expect(screen.getByText('Undo')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('Undo')).toBeNull();
  });

  it('is done on the server too for a signed-in customer, and Undo adds it there again', async () => {
    api.put.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    api.get.mockResolvedValue({data: {data: [KNIFE, MUG]}});
    renderCart({signedIn: true});
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText('Remove Lite Chef Knife Set from the cart'));
    await waitFor(() => expect(api.put).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('Undo'));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/accounts/cart/', {product_id: 9, quantity: 2, variant_id: 5, action: 'increase'}, {section: 'add-cart'}));
  });
});

describe('Clear cart', () => {
  it('asks in a row above the lines, which stay in view, and Keep leaves the cart alone', () => {
    renderCart();
    fireEvent.click(screen.getByText('Clear cart'));

    const question = screen.getByRole('group', {name: 'Clear the cart'});
    expect(question.textContent).toContain('Remove all 2 items?');
    expect(screen.getByRole('heading', {level: 2, name: 'Blue Mug'})).toBeTruthy(); // not covered up

    fireEvent.click(screen.getByText('Keep'));
    expect(screen.queryByRole('group', {name: 'Clear the cart'})).toBeNull();
    expect(screen.getAllByRole('heading', {level: 2}).length).toBeGreaterThanOrEqual(2);
  });

  it('empties the cart, and Undo brings every line back', () => {
    renderCart();
    fireEvent.click(screen.getByText('Clear cart'));
    fireEvent.click(screen.getByText('Remove all'));

    expect(screen.getByText('Your cart is empty')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Cart cleared');

    fireEvent.click(screen.getByText('Undo'));
    expect(screen.getByRole('heading', {level: 2, name: 'Lite Chef Knife Set'})).toBeTruthy();
    expect(screen.getByRole('heading', {level: 2, name: 'Blue Mug'})).toBeTruthy();
  });
});

describe('An empty cart', () => {
  it('points on with a button, and shows what the customer looked at recently', () => {
    const {store} = renderCart({cartItems: []});
    expect(screen.getByText('Start shopping').closest('a').getAttribute('href')).toBe('/products');
    expect(screen.queryByText('Recently Viewed')).toBeNull(); // nothing looked at yet

    act(() => { store.dispatch(recordViewed(OTHER(30))); });
    expect(screen.getByRole('heading', {name: 'Recently Viewed'})).toBeTruthy();
    expect(screen.getByText('Other 30')).toBeTruthy();
  });
});

describe('More to add', () => {
  it('is a swipe row of at most 12 products that are not in the cart yet', async () => {
    getAllProducts.mockResolvedValue({data: {data: {results: [{...OTHER(9)}, ...Array.from({length: 20}, (_, index) => OTHER(index + 100))], next: null}}});
    const {container} = renderCart();

    expect(await screen.findByRole('heading', {name: 'You may also like'})).toBeTruthy();
    expect(screen.getAllByText(/^Other \d+$/)).toHaveLength(12);
    expect(screen.queryByText('Other 9')).toBeNull(); // id 9 is the knife set, already in the cart
    expect(container.querySelector('.snap-x')).toBeTruthy();
    expect(getAllProducts.mock.calls[0][0]).toBe(24); // asked for more than it shows
  });

  it('is not asked for while the cart is empty', () => {
    renderCart({cartItems: []});
    expect(getAllProducts).not.toHaveBeenCalled();
  });
});

describe('When the cart could not be fetched', () => {
  it('says so with Try again, which asks for the cart again', async () => {
    api.get.mockResolvedValue({data: {data: [KNIFE]}});
    const {store} = renderCart({signedIn: true, sectionErrors: {'fetch-cart': 'Something went wrong on our side. Please try again in a moment.'}});

    expect(screen.getByText('Something went wrong on our side. Please try again in a moment.')).toBeTruthy();
    const before = api.get.mock.calls.length;

    fireEvent.click(screen.getByText('Try again'));

    await waitFor(() => expect(api.get.mock.calls.length).toBeGreaterThan(before));
    expect(store.getState().globalError.sectionErrors['fetch-cart']).toBeUndefined();
    store.dispatch(setSectionError({section: 'other', error: 'x'})); // (the slice still works)
  });
});
