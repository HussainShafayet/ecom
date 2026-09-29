// The product card every list draws: what a shopper reads on it (name, price, discount, honest rating), what it lets them
// do (add to cart, buy now, choose options, wishlist) and that one card working never locks the others. The minimum-order
// behaviour of the same card is covered in checkout-errors.test.js.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import api from '../api/axiosSetup';
import {ProductCard} from '../components/common';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const KETTLE = {
  id: 1, name: 'Blue Kettle', slug: 'blue-kettle', sku: 'K-1', image: '', base_price: 1200, discount_price: 900,
  has_discount: true, discount_value: 25, discount_type: 'percentage', brand_name: 'Acme', variant_id: 3,
  availability_status: true, has_variants: false, avg_rating: 0, total_reviews: 0, total_views: 999, total_orders: 77,
};
const MUG = {...KETTLE, id: 2, name: 'Red Mug', slug: 'red-mug', has_discount: false, variant_id: 4};

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({signedIn = false} = {}) => configureStore({
  reducer: {cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

// The card sits at "/"; a product page and the checkout are stand-ins so a click's destination can be read
const renderCards = (ui, options) => {
  const store = makeStore(options);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/products/detail/:slug" element={<p>product page</p>} />
          <Route path="/checkout" element={<p>checkout page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('What the product card shows', () => {
  it('names the product and its brand, both prices and the discount, and links to its page', () => {
    renderCards(<ProductCard product={KETTLE} />);
    expect(screen.getByText('Blue Kettle')).toBeTruthy();
    expect(screen.getByText('Acme')).toBeTruthy();
    expect(screen.getByText('৳900')).toBeTruthy();
    expect(screen.getByText('৳1,200')).toBeTruthy();
    expect(screen.getByText('25% OFF')).toBeTruthy();
    expect(screen.getByAltText('Blue Kettle').closest('a').getAttribute('href')).toBe('/products/detail/blue-kettle');
  });

  it('does not show the discount or the old price for a product that has none', () => {
    renderCards(<ProductCard product={MUG} />);
    expect(screen.queryByText(/OFF/)).toBeNull();
    expect(screen.getByText('৳1,200')).toBeTruthy();
    expect(screen.queryByText('৳900')).toBeNull();
  });

  it('leaves out the view and order counters', () => {
    renderCards(<ProductCard product={KETTLE} />);
    expect(screen.queryByText(/views/)).toBeNull();
    expect(screen.queryByText(/orders/)).toBeNull();
  });

  it('says the exact average and the review count, and rounds the stars to the nearest half', () => {
    const {container} = render(
      <Provider store={makeStore()}>
        <MemoryRouter><ProductCard product={{...KETTLE, avg_rating: 4.3, total_reviews: 12}} /></MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole('img', {name: 'Rated 4.3 out of 5 from 12 reviews'})).toBeTruthy();
    // 4.3 -> 4.5 stars: four full, one half, none empty (react-icons draw each star as one svg)
    expect(container.querySelectorAll('.text-yellow-500 svg')).toHaveLength(5);
  });

  it('draws no rating for a product nobody has rated', () => {
    renderCards(<ProductCard product={KETTLE} />);
    expect(screen.queryByRole('img', {name: /Rated/})).toBeNull();
  });

  it('greys out a product that is out of stock and offers no way to buy it', () => {
    renderCards(<ProductCard product={{...KETTLE, availability_status: false}} />);
    expect(screen.getByText('Out of Stock')).toBeTruthy();
    expect(screen.queryByText('Add to Cart')).toBeNull();
    expect(screen.queryByText('Buy Now')).toBeNull();
    expect(screen.getByAltText('Blue Kettle').className).toContain('grayscale');
  });
});

describe('A product with a minimum order', () => {
  it('says so on the image, so the buttons under it line up with the other cards', () => {
    renderCards(<ProductCard product={{...KETTLE, minimum_order_quantity: 3}} />);
    const note = screen.getByText('Minimum order: 3');
    expect(note.closest('a')).toBeTruthy(); // inside the clickable image area...
    const buttons = screen.getByText('Add to Cart').closest('button').parentElement;
    expect(buttons.contains(note)).toBe(false); // ...not in the block with the buttons
    expect(buttons.parentElement.textContent).not.toContain('Minimum order');
  });

  it('shows no note for a product without one, and none for a product that cannot be bought', () => {
    const {unmount} = render(
      <Provider store={makeStore()}><MemoryRouter><ProductCard product={KETTLE} /></MemoryRouter></Provider>
    );
    expect(screen.queryByText(/Minimum order/)).toBeNull();
    unmount();
    renderCards(<ProductCard product={{...KETTLE, minimum_order_quantity: 3, availability_status: false}} />);
    expect(screen.queryByText(/Minimum order/)).toBeNull();
  });
});

describe('The action area of the card', () => {
  it('is one row of the same height whether the product can be added, needs options or is sold out', () => {
    const controls = [];
    for (const [product, label] of [[KETTLE, 'Add to Cart'], [{...KETTLE, has_variants: true}, 'Choose Options'], [{...KETTLE, availability_status: false}, 'Out of Stock']]) {
      const {unmount} = render(<Provider store={makeStore()}><MemoryRouter><ProductCard product={product} /></MemoryRouter></Provider>);
      controls.push(screen.getByText(label).closest('button, div'));
      unmount();
    }
    controls.forEach((control) => expect(control.className).toContain('h-9'));
  });

  it('puts Add to Cart and Buy Now side by side, not one above the other', () => {
    renderCards(<ProductCard product={KETTLE} />);
    const add = screen.getByText('Add to Cart').closest('button');
    const buy = screen.getByText('Buy Now').closest('button');
    expect(add.parentElement).toBe(buy.parentElement);
    expect(buy.className).toContain('h-9');
  });

  it('keeps Buy Now as an icon with its name in the tooltip, so Add to Cart always has room for its label', () => {
    renderCards(<ProductCard product={KETTLE} />);
    const buy = screen.getByText('Buy Now').closest('button');
    expect(buy.getAttribute('title')).toBe('Buy Now');
    expect(buy.querySelector('svg')).toBeTruthy();
    expect(screen.getByText('Add to Cart').closest('button').className).toContain('whitespace-nowrap');
  });
});

describe('What the product card does', () => {
  it('adds the product to the cart', async () => {
    const store = renderCards(<ProductCard product={KETTLE} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    await waitFor(() => expect(store.getState().cart.cartItems[0]).toMatchObject({id: 1, quantity: 1}));
  });

  it('adds the product and goes straight to checkout on Buy Now', async () => {
    const store = renderCards(<ProductCard product={KETTLE} />);
    fireEvent.click(screen.getByText('Buy Now'));
    expect(await screen.findByText('checkout page')).toBeTruthy();
    expect(store.getState().cart.cartItems).toHaveLength(1);
  });

  it('sends a product with variants to its page to choose one, instead of adding it blind', () => {
    const store = renderCards(<ProductCard product={{...KETTLE, has_variants: true}} />);
    expect(screen.queryByText('Add to Cart')).toBeNull();
    fireEvent.click(screen.getByText('Choose Options'));
    expect(screen.getByText('product page')).toBeTruthy();
    expect(store.getState().cart.cartItems).toEqual([]);
  });

  it('shows only its own button as busy while the server answers, and the other cards stay usable', async () => {
    let answer;
    api.post.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
    renderCards(<><ProductCard product={KETTLE} /><ProductCard product={MUG} /></>, {signedIn: true});

    fireEvent.click(screen.getAllByText('Add to Cart')[0]);

    const busy = await screen.findByText('Adding...');
    expect(busy.closest('button').disabled).toBe(true);
    const other = screen.getByText('Add to Cart'); // the second card is still "Add to Cart"...
    expect(other.closest('button').disabled).toBe(false); // ...and clickable

    answer({data: {success: true, message: 'ok', data: null}});
    await waitFor(() => expect(screen.queryByText('Adding...')).toBeNull());
  });

  it('adds to and removes from the wishlist with a labelled button', () => {
    renderCards(<ProductCard product={KETTLE} />);
    const add = screen.getByLabelText('Add to wishlist');
    expect(add.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(add);
    const remove = screen.getByLabelText('Remove from wishlist');
    expect(remove.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(remove);
    expect(screen.getByLabelText('Add to wishlist')).toBeTruthy();
  });
});
