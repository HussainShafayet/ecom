// The order flow says why the shop said no: checkout shows the backend's sentences, the cart and the product cards know
// a product's minimum order and say why a change was refused (backend: POST /orders/ answers 400 with `errors`,
// product cards and cart lines carry `minimum_order_quantity`, POST /accounts/cart/ answers 400 when the stock is short).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import checkoutReducer, {clearResponseError, handleCheckout, resetForm} from '../redux/slice/checkoutSlice';
import cartReducer from '../redux/slice/cartSlice';
import productReducer from '../redux/slice/productSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import Cart from '../pages/Cart';
import {CheckoutErrors} from '../components/checkout';
import {ProductCard} from '../components/common';
import {belowMinimum, minimumOf, minimumOrderProblems} from '../utils/minimumOrder';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const KNIFE = {
  id: 9, name: 'Lite Chef Knife Set', slug: 'lite-chef-knife-set', sku: 'K-1', image: '', base_price: 500, discount_price: 500,
  has_discount: false, quantity: 1, minimum_order_quantity: 3, variant_id: 5, availability_status: true, has_variants: false,
  avg_rating: 4, total_reviews: 2, brand_name: 'Acme',
};
const failure = (errors) => ({response: {data: {success: false, errors}}});
const init = (reducer) => reducer(undefined, {type: '@@init'});

const makeStore = ({signedIn = false, cartItems = []} = {}) => configureStore({
  reducer: {cart: cartReducer, product: productReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, checkout: checkoutReducer},
  preloadedState: {
    auth: {...init(authReducer), isAuthenticated: signedIn},
    cart: {...init(cartReducer), cartItems},
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderWith = (ui, options) => {
  const store = makeStore(options);
  render(<Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>);
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  api.get.mockResolvedValue({data: {data: {results: [], count: 0, next: null, previous: null}}});
  Element.prototype.scrollIntoView = vi.fn();
});

describe('The minimum order helpers', () => {
  it('is 1 unless the product says more (also for a card that has no such field)', () => {
    expect(minimumOf({minimum_order_quantity: 3})).toBe(3);
    expect(minimumOf({minimum_order_quantity: '2'})).toBe(2);
    expect(minimumOf({})).toBe(1);
    expect(minimumOf(undefined)).toBe(1);
    expect(minimumOf({minimum_order_quantity: 0})).toBe(1);
  });

  it('finds the lines below their minimum and words them like the backend does', () => {
    const items = [{...KNIFE, quantity: 1}, {...KNIFE, id: 10, name: 'Mug', minimum_order_quantity: 1, quantity: 1}, {...KNIFE, id: 11, name: 'Pan', minimum_order_quantity: 2, quantity: 2}];
    expect(belowMinimum(items).map((item) => item.name)).toEqual(['Lite Chef Knife Set']);
    expect(minimumOrderProblems(items)).toEqual(['The minimum order for Lite Chef Knife Set is 3.']);
    expect(minimumOrderProblems([])).toEqual([]);
  });

  it('says a product once, however many of its variants are in the cart', () => {
    const items = [{...KNIFE, variant_id: 1}, {...KNIFE, variant_id: 2}];
    expect(minimumOrderProblems(items)).toHaveLength(1);
  });
});

describe('Checkout keeps the reason the order was refused', () => {
  const refused = (payload) => checkoutReducer(undefined, {type: handleCheckout.rejected.type, payload});

  it("keeps the backend's sentences, all of them", () => {
    const errors = ['The minimum order for Lite Chef Knife Set is 2.', 'Only 1 of Mug left in stock.'];
    expect(refused({success: false, message: 'Validation failed.', error: errors[0], errors}).responseError).toEqual(errors);
  });

  it('makes a list of a lone message, and of no answer at all (a server error, no network)', () => {
    expect(refused({error: 'Something went wrong on our side.'}).responseError).toEqual(['Something went wrong on our side.']);
    expect(refused(undefined).responseError).toEqual(['Something went wrong. Please try again.']);
  });

  it('forgets the last refusal when the customer tries again, and on demand', () => {
    const stuck = refused({errors: ['No.']});
    expect(checkoutReducer(stuck, {type: handleCheckout.pending.type}).responseError).toBeNull();
    expect(checkoutReducer(stuck, clearResponseError()).responseError).toBeNull();
    expect(checkoutReducer(stuck, resetForm()).responseError).toBeNull();
  });
});

describe('The checkout error box', () => {
  it('shows every sentence and a way back to the cart, and scrolls to itself', () => {
    render(<MemoryRouter><CheckoutErrors errors={['The minimum order for Lite Chef Knife Set is 2.', 'Only 1 of Mug left in stock.']} /></MemoryRouter>);

    expect(screen.getByText('The minimum order for Lite Chef Knife Set is 2.')).toBeTruthy();
    expect(screen.getByText('Only 1 of Mug left in stock.')).toBeTruthy();
    expect(screen.getByText('Go back to your cart').getAttribute('href')).toBe('/cart');
    expect(screen.getByText(/Nothing was ordered/)).toBeTruthy();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('is not there when nothing went wrong', () => {
    const {container} = render(<MemoryRouter><CheckoutErrors errors={null} /></MemoryRouter>);
    expect(container.textContent).toBe('');
  });

  it('also shows a plain string', () => {
    render(<MemoryRouter><CheckoutErrors errors="Something went wrong!" /></MemoryRouter>);
    expect(screen.getByText('Something went wrong!')).toBeTruthy();
  });
});

describe('The cart and the minimum order', () => {
  it('warns about a line below its minimum and does not offer checkout until it is fixed', async () => {
    renderWith(<Cart />, {cartItems: [{...KNIFE, quantity: 1}]});

    expect((await screen.findAllByText('Minimum order: 3'))[0].className).toContain('text-red-500');
    expect(screen.getByText('The minimum order for Lite Chef Knife Set is 3.')).toBeTruthy();
    expect(screen.getByText('Increase the quantity to continue.')).toBeTruthy();
    for (const button of screen.getAllByText(/Proceed to Checkout|^Checkout/)) {
      expect(button.closest('a')).toBeNull(); // greyed out, not a link
    }
  });

  it('offers checkout once the minimum is reached, and does not let the quantity go below it', async () => {
    renderWith(<Cart />, {cartItems: [{...KNIFE, quantity: 3}]});

    const link = (await screen.findByText('Proceed to Checkout')).closest('a');
    expect(link.getAttribute('href')).toBe('/checkout');
    expect(screen.queryByText('Increase the quantity to continue.')).toBeNull();
    expect(screen.getByText('-').disabled).toBe(true); // 3 is the minimum: no smaller
    expect(screen.getByText('Minimum order: 3').className).toContain('text-gray-500');
  });

  it('shows why the shop refused a bigger quantity and puts back the quantity it really holds', async () => {
    api.get.mockImplementation((url) =>
      url.includes('accounts/cart') ? Promise.resolve({data: {data: [{...KNIFE, quantity: 3}]}}) : Promise.resolve({data: {data: {results: [], count: 0}}})
    );
    api.post.mockRejectedValue(failure(['Only 3 of Lite Chef Knife Set left in stock.']));
    renderWith(<Cart />, {signedIn: true, cartItems: [{...KNIFE, quantity: 3}]});

    fireEvent.click(await screen.findByText('+'));
    expect(screen.getByDisplayValue('4')).toBeTruthy(); // the page answers at once ...

    expect(await screen.findByText('Only 3 of Lite Chef Knife Set left in stock.', {}, {timeout: 4000})).toBeTruthy();
    await waitFor(() => expect(screen.getByDisplayValue('3')).toBeTruthy()); // ... and then shows what the shop holds
    expect(api.post).toHaveBeenCalledTimes(1);
  }, 8000);
});

describe('Adding from a product card', () => {
  const card = {...KNIFE, quantity: undefined, minimum_order_quantity: 2};

  it('puts the minimum order in the cart, not one, and says so', () => {
    const store = renderWith(<ProductCard product={card} />);
    expect(screen.getByText('Minimum order: 2')).toBeTruthy();

    fireEvent.click(screen.getByText('Add to Cart'));

    return waitFor(() => {
      expect(store.getState().cart.cartItems[0]).toMatchObject({id: 9, quantity: 2, minimum_order_quantity: 2});
    });
  });

  it('sends the minimum to the server cart too', async () => {
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    renderWith(<ProductCard product={card} />, {signedIn: true});

    fireEvent.click(screen.getByText('Add to Cart'));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/accounts/cart/', {product_id: 9, quantity: 2, variant_id: 5, action: 'increase'}, {section: 'add-cart'}));
  });

  it('says why when the shop would not take it (not enough in stock)', async () => {
    api.post.mockRejectedValue(failure(['Only 1 of Lite Chef Knife Set left in stock.']));
    const store = renderWith(<ProductCard product={{...card, minimum_order_quantity: 1}} />, {signedIn: true});

    fireEvent.click(screen.getByText('Add to Cart'));

    expect((await screen.findByRole('alert')).textContent).toBe('Only 1 of Lite Chef Knife Set left in stock.');
    expect(store.getState().cart.cartItems).toEqual([]); // nothing was put in the local cart either
  });

  it('adds one, as before, when there is no minimum', async () => {
    const store = renderWith(<ProductCard product={{...card, minimum_order_quantity: undefined}} />);
    expect(screen.queryByText(/Minimum order/)).toBeNull();
    fireEvent.click(screen.getByText('Add to Cart'));
    await waitFor(() => expect(store.getState().cart.cartItems[0].quantity).toBe(1));
  });
});

describe('The checkout page', () => {
  it('shows why the order was refused right above the Place Order button', async () => {
    const {default: Checkout} = await import('../pages/Checkout');
    // a guest reads the checkout content through the public client
    publicApi.get.mockResolvedValue({data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, shipping_addresses: [], user_info: null}}});
    const store = makeStore({cartItems: [{...KNIFE, quantity: 1}]});
    store.dispatch({type: handleCheckout.rejected.type, payload: {errors: ['The minimum order for Lite Chef Knife Set is 3.']}});
    render(<Provider store={store}><MemoryRouter><Checkout /></MemoryRouter></Provider>);

    const button = await screen.findByText('Place Order', {}, {timeout: 4000});
    // a refusal left over from an earlier visit is not shown on arrival ...
    expect(screen.queryByText('The minimum order for Lite Chef Knife Set is 3.')).toBeNull();
    store.dispatch({type: handleCheckout.rejected.type, payload: {errors: ['The minimum order for Lite Chef Knife Set is 3.']}});
    const message = await screen.findByText('The minimum order for Lite Chef Knife Set is 3.'); // ... a new one is
    expect(message.closest('[role="alert"]')).toBeTruthy();
    expect(screen.getByText('Go back to your cart').getAttribute('href')).toBe('/cart');
    // it sits before the button in the page
    expect(message.compareDocumentPosition(button.closest('button')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }, 10000);
});
