// The homepage strip that says "your cart is waiting": nothing for an empty cart; otherwise the first pictures, the items and what they come to,
// a tap opens the cart and Checkout goes straight on.
import React from 'react';
import {beforeEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import cartReducer from '../redux/slice/cartSlice';
import CartReminder from '../components/sections/CartReminder';

const line = (id, quantity, price = 500) => ({id, name: `Item ${id}`, slug: `item-${id}`, image: '', base_price: price, has_discount: false, quantity, variant_id: id});
const init = (reducer) => reducer(undefined, {type: '@@init'});

const renderStrip = (cartItems) => {
  const store = configureStore({
    reducer: {cart: cartReducer},
    preloadedState: {cart: {...init(cartReducer), cartItems}},
  });
  return render(<Provider store={store}><MemoryRouter><CartReminder /></MemoryRouter></Provider>);
};

beforeEach(() => cleanup());

describe('The cart reminder on the homepage', () => {
  it('draws nothing for an empty cart', () => {
    const {container} = renderStrip([]);
    expect(container.textContent).toBe('');
  });

  it('says how many items are waiting and what they come to (pieces, like the number on the cart icon)', () => {
    renderStrip([line(1, 2), line(2, 1, 400)]); // 2 x 500 + 1 x 400
    expect(screen.getByText('Your cart is waiting')).toBeTruthy();
    expect(screen.getByText('3 items · ৳1,400')).toBeTruthy();
  });

  it('says "1 item" for one piece', () => {
    renderStrip([line(1, 1)]);
    expect(screen.getByText('1 item · ৳500')).toBeTruthy();
  });

  it('opens the cart on a tap and goes to checkout with its button', () => {
    renderStrip([line(1, 1)]);
    expect(screen.getByRole('link', {name: /Your cart is waiting/}).getAttribute('href')).toBe('/cart');
    expect(screen.getByRole('link', {name: 'Checkout'}).getAttribute('href')).toBe('/checkout');
  });

  it('shows the first three pictures and "+N" for the rest', () => {
    const {container} = renderStrip([line(1, 1), line(2, 1), line(3, 1), line(4, 1), line(5, 1)]);
    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('draws nothing in a store without a cart (a page that never had one)', () => {
    const store = configureStore({reducer: {other: (state = {}) => state}});
    const {container} = render(<Provider store={store}><MemoryRouter><CartReminder /></MemoryRouter></Provider>);
    expect(container.textContent).toBe('');
  });
});
