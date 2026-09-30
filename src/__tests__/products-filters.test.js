// The filters, phone first: a sheet from the bottom with a DRAFT (nothing moves behind it until Show results), groups that open and
// close, 48 px rows, chips and sizes that say whether they are on, a price range that is checked, a chip for everything chosen
// that takes just that one off, and the same panel beside the list on a computer where a choice goes straight into the address.
// Real slices, a mocked client.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

import productReducer from '../redux/slice/productSlice';
import contentReducer from '../redux/slice/contentSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {categoryAncestors, discountText, emptyFilters, filterChips, filtersToParams, findCategory, priceProblem} from '../utils/productFilters';
import Products from '../pages/Products';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, sku: `P-${id}`, image: '', base_price: 100, discount_price: 100,
  has_discount: false, brand_name: 'Acme', variant_id: id, availability_status: true, has_variants: false,
  avg_rating: 0, total_reviews: 0, total_views: 1, total_orders: 1,
});
const page = (ids) => ({data: {data: {results: ids.map(PRODUCT), count: ids.length, next: null, previous: null}}});
const BRANDS = ['Acme', 'Marks & Spencer', ...Array.from({length: 10}, (_, index) => `Brand ${index + 1}`)]; // 12: more than shown at first
const SHOP = {
  categories: [{name: 'Men', slug: 'men', children: [{name: 'Shirts', slug: 'men-shirts', children: []}]}, {name: 'Shoes', slug: 'shoes', children: []}],
  brands: BRANDS,
  tags: ['Summer'],
  colors: [{name: 'Red', hex_code: '#ff0000'}, {name: 'Sky Blue', hex_code: '#0099ff'}],
  sizes: ['M', 'L'],
  price_range: {min_range: 100, max_range: 9500},
  discounts: [{discount_type: 'percentage', value: 20}, {discount_type: 'fixed', value: 100}],
};

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = () => configureStore({
  reducer: {product: productReducer, content: contentReducer, cart: cartReducer, auth: authReducer, globalError: globalErrorReducer, wishList: wishListReducer, toast: toastReducer},
  preloadedState: {product: init(productReducer)},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const Where = () => <p data-testid="where">{useLocation().search}</p>;
const where = () => screen.getByTestId('where').textContent;
const requested = () => api.get.mock.calls.map(([url]) => url).filter((url) => url.startsWith('/products'));

let shop;
let scroller;
const renderPage = async (url = '/products') => {
  scroller = document.createElement('div');
  const utils = render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[url]}>
        <Routes><Route path="/products" element={<><Products scrollContainerRef={{current: scroller}} /><Where /></>} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  await screen.findByText('Product 1');
  await act(async () => {});
  return utils;
};
const click = async (target) => { await act(async () => { fireEvent.click(target instanceof Element ? target : screen.getByRole('button', {name: target})); }); };
const openSheet = async () => {
  screen.getByRole('button', {name: /^Filters/}).focus(); // (with something chosen its name carries the number: "Filters 2 chosen")
  await click(/^Filters/);
  const dialog = screen.getByRole('dialog', {name: 'Filters'});
  await within(dialog).findByRole('button', {name: /^Category/}); // the shop's lists have arrived
  return dialog;
};
const openGroup = async (dialog, name) => {
  const header = within(dialog).getByRole('button', {name: new RegExp(`^${name}`)});
  if (header.getAttribute('aria-expanded') === 'false') await click(header);
};
const setDesktop = (on) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({matches: on, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn()}));
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  shop = () => Promise.resolve({data: {data: SHOP}});
  api.get.mockImplementation((url) => (url.startsWith('/products') ? Promise.resolve(page([1, 2])) : Promise.reject(new Error(`unexpected ${url}`))));
  publicApi.get.mockImplementation(() => shop());
});
afterEach(() => {
  delete window.matchMedia;
});

describe('The filter sheet (a phone)', () => {
  it('opens as a dialog with focus inside, and asks the shop for nothing while things are chosen in it', async () => {
    await renderPage();
    const before = requested().length;
    const dialog = await openSheet();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    await openGroup(dialog, 'Brand');
    await click(within(dialog).getByRole('checkbox', {name: 'Acme'}));
    await openGroup(dialog, 'Size');
    await click(within(dialog).getByRole('button', {name: 'M'}));
    expect(requested().length).toBe(before); // the list behind it waits
    expect(where()).toBe('');
  });

  it('applies everything chosen at once with Show results, as the first page of a new list, and closes', async () => {
    await renderPage();
    const dialog = await openSheet();
    await openGroup(dialog, 'Brand');
    await click(within(dialog).getByRole('checkbox', {name: 'Acme'}));
    await click(within(dialog).getByRole('checkbox', {name: 'Marks & Spencer'}));
    await openGroup(dialog, 'Size');
    await click(within(dialog).getByRole('button', {name: 'L'}));
    const before = requested().length;
    await click('Show results');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(where()).toBe('?brands=Acme%2CMarks+%26+Spencer&sizes=L');
    expect(requested().length).toBe(before + 1); // one request for all three choices
    expect(requested().at(-1)).toContain('brands=Acme,Marks%20%26%20Spencer');
    expect(requested().at(-1)).toContain('sizes=L');
    expect(requested().at(-1)).toContain('page=1');
    expect(document.activeElement).toBe(screen.getByRole('button', {name: /^Filters/})); // focus came back to the button
  });

  it.each([
    ['the X', async () => click('Close filters')],
    ['Esc', async () => { await act(async () => { fireEvent.keyDown(document, {key: 'Escape'}); }); }],
    ['a tap outside', async () => click(screen.getByRole('dialog').parentElement)],
  ])('drops what was chosen when it is closed with %s', async (_, close) => {
    await renderPage();
    const dialog = await openSheet();
    await openGroup(dialog, 'Size');
    await click(within(dialog).getByRole('button', {name: 'M'}));
    const before = requested().length;
    await close();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(where()).toBe('');
    expect(requested().length).toBe(before);

    const again = await openSheet(); // a draft is not remembered
    expect(within(again).queryByRole('button', {name: 'M', pressed: true})).toBeNull();
  });

  it('stops the page behind it from scrolling while it is open', async () => {
    await renderPage();
    scroller.style.overflow = 'auto';
    await openSheet();
    expect(scroller.style.overflow).toBe('hidden');
    await click('Close filters');
    expect(scroller.style.overflow).toBe('auto');
  });

  it('keeps Tab inside it', async () => {
    await renderPage();
    const dialog = await openSheet();
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    const first = focusable[0];
    const last = focusable.at(-1);

    last.focus();
    await act(async () => { fireEvent.keyDown(document, {key: 'Tab'}); });
    expect(document.activeElement).toBe(first);

    await act(async () => { fireEvent.keyDown(document, {key: 'Tab', shiftKey: true}); });
    expect(document.activeElement).toBe(last);
  });

  it('opens the groups that have something chosen, and the first two, closed ones say so', async () => {
    await renderPage('/products?brands=Acme&sizes=M');
    const dialog = await openSheet();
    const state = (name) => within(dialog).getByRole('button', {name: new RegExp(`^${name}`)}).getAttribute('aria-expanded');
    expect(state('Category')).toBe('true');
    expect(state('Price')).toBe('true');
    expect(state('Brand')).toBe('true'); // chosen
    expect(state('Size')).toBe('true'); // chosen
    expect(state('Color')).toBe('false');
    expect(state('Tag')).toBe('false');
  });

  it('draws only the groups the shop has something for', async () => {
    shop = () => Promise.resolve({data: {data: {...SHOP, tags: [], discounts: [], colors: []}}});
    await renderPage();
    const dialog = await openSheet();
    expect(within(dialog).queryByRole('button', {name: /^Tag/})).toBeNull();
    expect(within(dialog).queryByRole('button', {name: /^Discount/})).toBeNull();
    expect(within(dialog).queryByRole('button', {name: /^Color/})).toBeNull();
    expect(within(dialog).getByRole('button', {name: /^Brand/})).toBeTruthy();
  });

  it('has Clear all, which empties the draft and is off when nothing is chosen', async () => {
    await renderPage('/products?brands=Acme&min_price=500');
    const dialog = await openSheet();
    expect(within(dialog).getByRole('checkbox', {name: 'Acme'}).checked).toBe(true);
    await click(within(dialog).getByRole('button', {name: 'Clear all'}));
    expect(within(dialog).getByRole('checkbox', {name: 'Acme'}).checked).toBe(false);
    expect(within(dialog).getByLabelText('From').value).toBe('');
    expect(within(dialog).getByRole('button', {name: 'Clear all'}).disabled).toBe(true);
    expect(where()).toBe('?brands=Acme&min_price=500'); // still only a draft

    await click('Show results');
    expect(where()).toBe('');
  });

  it('says why the lists are missing, with Try again', async () => {
    let failing = true;
    shop = () => (failing ? Promise.reject({response: {status: 503, headers: {}, data: {}}}) : Promise.resolve({data: {data: SHOP}}));
    await renderPage();
    await click(/^Filters/);
    const dialog = screen.getByRole('dialog', {name: 'Filters'});
    expect(await within(dialog).findByText('Something went wrong on our side. Please try again in a moment.')).toBeTruthy();

    failing = false;
    await click(within(dialog).getByRole('button', {name: 'Try again'}));
    expect(await within(dialog).findByRole('button', {name: /^Category/})).toBeTruthy();
  });
});

describe('The groups', () => {
  it('lists the brands as 48 px rows, the first few and "Show all", keeping what is chosen in view', async () => {
    await renderPage('/products?brands=Brand%2010');
    const dialog = await openSheet();
    expect(within(dialog).getAllByRole('checkbox').filter((box) => BRANDS.includes(box.closest('label').textContent))).toHaveLength(9); // 8 + the chosen one past them
    expect(within(dialog).getByRole('checkbox', {name: 'Acme'}).closest('label').className).toContain('min-h-12');
    expect(within(dialog).queryByRole('checkbox', {name: 'Brand 9'})).toBeNull();

    await click('Show all 12');
    expect(within(dialog).getByRole('checkbox', {name: 'Brand 9'})).toBeTruthy();
    await click('Show fewer');
    expect(within(dialog).queryByRole('checkbox', {name: 'Brand 9'})).toBeNull();
  });

  it('chooses a category, opens its children with their own button, and takes it off when it is chosen again', async () => {
    await renderPage();
    const dialog = await openSheet();
    expect(within(dialog).queryByRole('button', {name: 'Shirts'})).toBeNull(); // closed

    await click(within(dialog).getByRole('button', {name: 'Show Men subcategories'}));
    await click(within(dialog).getByRole('button', {name: 'Shirts'}));
    expect(within(dialog).getByRole('button', {name: 'Shirts'}).getAttribute('aria-pressed')).toBe('true');
    await click('Show results');
    expect(where()).toBe('?category=men-shirts');

    const again = await openSheet(); // the way down to the chosen one is open
    expect(within(again).getByRole('button', {name: 'Shirts'}).getAttribute('aria-pressed')).toBe('true');
    await click(within(again).getByRole('button', {name: 'Shirts'}));
    expect(within(again).getByRole('button', {name: 'Shirts'}).getAttribute('aria-pressed')).toBe('false');
  });

  it('turns colours and sizes on and off, and says which are on', async () => {
    await renderPage();
    const dialog = await openSheet();
    await openGroup(dialog, 'Color');
    await openGroup(dialog, 'Size');
    const blue = within(dialog).getByRole('button', {name: 'Sky Blue'});
    expect(blue.getAttribute('aria-pressed')).toBe('false');
    expect(blue.className).toContain('h-11');
    await click(blue);
    expect(within(dialog).getByRole('button', {name: 'Sky Blue'}).getAttribute('aria-pressed')).toBe('true');
    await click(within(dialog).getByRole('button', {name: 'M'}));
    await click('Show results');
    expect(where()).toBe('?colors=Sky+Blue&sizes=M');
  });

  it('chooses a discount, or Any', async () => {
    await renderPage('/products?discount_type=percentage&discount_value=20');
    const dialog = await openSheet();
    expect(within(dialog).getByRole('radio', {name: '20% off'}).checked).toBe(true);
    expect(within(dialog).getByRole('radio', {name: '৳100 off'}).checked).toBe(false);
    await click(within(dialog).getByRole('radio', {name: '৳100 off'}));
    await click('Show results');
    expect(where()).toBe('?discount_type=fixed&discount_value=100');

    const again = await openSheet();
    await click(within(again).getByRole('radio', {name: 'Any'}));
    await click('Show results');
    expect(where()).toBe('');
  });

  it('keeps the search and the sort when the filters are applied', async () => {
    await renderPage('/products?search=shirt&ordering=-rating');
    const dialog = await openSheet();
    await openGroup(dialog, 'Size');
    await click(within(dialog).getByRole('button', {name: 'M'}));
    await click('Show results');
    expect(where()).toBe('?search=shirt&ordering=-rating&sizes=M');
  });
});

describe('The price range', () => {
  it('takes digits only, in a box with a number keyboard, and says what the shop\'s prices run from and to', async () => {
    await renderPage();
    const dialog = await openSheet();
    const from = within(dialog).getByLabelText('From');
    expect(from.getAttribute('inputmode')).toBe('numeric');
    expect(from.className).toContain('h-12');
    fireEvent.change(from, {target: {value: '5a0,0'}});
    expect(from.value).toBe('500');
    expect(within(dialog).getByText('Prices here run from ৳100 to ৳9,500.')).toBeTruthy();
  });

  it('says a range the wrong way round, focuses the box to fix and does not apply it', async () => {
    await renderPage();
    const dialog = await openSheet();
    fireEvent.change(within(dialog).getByLabelText('From'), {target: {value: '2000'}});
    fireEvent.change(within(dialog).getByLabelText('To'), {target: {value: '500'}});
    expect(within(dialog).getByRole('alert').textContent).toBe('The lowest price cannot be more than the highest');

    const before = requested().length;
    await click('Show results');
    expect(screen.getByRole('dialog', {name: 'Filters'})).toBeTruthy(); // still open
    expect(document.activeElement).toBe(within(dialog).getByLabelText('From'));
    expect(requested().length).toBe(before);

    fireEvent.change(within(dialog).getByLabelText('From'), {target: {value: '500'}});
    fireEvent.change(within(dialog).getByLabelText('To'), {target: {value: '2000'}});
    await click('Show results');
    expect(where()).toBe('?min_price=500&max_price=2000'); // both ends: the old one lost the lowest
  });

  it('can be emptied again', async () => {
    await renderPage('/products?min_price=500&max_price=2000');
    const dialog = await openSheet();
    fireEvent.change(within(dialog).getByLabelText('From'), {target: {value: ''}});
    fireEvent.change(within(dialog).getByLabelText('To'), {target: {value: ''}});
    await click('Show results');
    expect(where()).toBe('');
  });
});

describe('The chips', () => {
  const URL = '/products?category=men-shirts&brands=Acme&sizes=M&min_price=500&discount_type=percentage&discount_value=20&search=shirt&ordering=-rating';

  it('say everything that is chosen, the category by its name, and nothing when nothing is', async () => {
    await renderPage();
    expect(screen.queryByRole('group', {name: 'Chosen filters'})).toBeNull();
    cleanup();
    await renderPage(URL);
    const chips = await screen.findByRole('group', {name: 'Chosen filters'});
    await within(chips).findByRole('button', {name: 'Remove Shirts'});
    expect(within(chips).getAllByRole('button').map((chip) => chip.textContent)).toEqual(['Shirts', 'Acme', 'M', 'From ৳500', '20% off', 'Clear all']);
  });

  it('take off just the one that was tapped, as a new list', async () => {
    await renderPage(URL);
    const before = requested().length;
    await click(await screen.findByRole('button', {name: 'Remove Acme'}));

    expect(where()).toBe('?category=men-shirts&sizes=M&min_price=500&discount_type=percentage&discount_value=20&search=shirt&ordering=-rating');
    expect(requested().length).toBe(before + 1);
    expect(requested().at(-1)).not.toContain('brands');
    expect(requested().at(-1)).toContain('sizes=M');
    expect(screen.queryByRole('button', {name: 'Remove Acme'})).toBeNull();
  });

  it('take off the price and the discount each as one', async () => {
    await renderPage(URL);
    await click(await screen.findByRole('button', {name: 'Remove From ৳500'}));
    expect(where()).not.toContain('min_price');
    await click(screen.getByRole('button', {name: 'Remove 20% off'}));
    expect(where()).not.toContain('discount');
  });

  it('Clear all takes off every filter and keeps the search and the sort', async () => {
    await renderPage(URL);
    const chips = await screen.findByRole('group', {name: 'Chosen filters'});
    await click(within(chips).getByRole('button', {name: 'Clear all'}));
    expect(where()).toBe('?search=shirt&ordering=-rating');
    expect(screen.queryByRole('group', {name: 'Chosen filters'})).toBeNull();
  });
});

describe('The filters on a computer', () => {
  it('sit beside the list, and a choice goes straight into the address and asks for a new list', async () => {
    setDesktop(true);
    await renderPage();
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByRole('heading', {name: 'Filters', level: 2})).toBeTruthy();
    await openGroup(sidebar, 'Brand');

    const before = requested().length;
    await click(within(sidebar).getByRole('checkbox', {name: 'Acme'}));
    expect(where()).toBe('?brands=Acme');
    expect(requested().length).toBe(before + 1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(sidebar).getByRole('button', {name: 'Clear all'})).toBeTruthy();
  });

  it('does not open the sheet, even from the Filters button a narrow window would have', async () => {
    setDesktop(true);
    await renderPage();
    await click(/^Filters/);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('applies the price when its box is left (not at every key), and only when the range is right', async () => {
    setDesktop(true);
    await renderPage();
    const sidebar = screen.getByRole('complementary');
    const before = requested().length;

    fireEvent.change(within(sidebar).getByLabelText('From'), {target: {value: '500'}});
    expect(requested().length).toBe(before);
    fireEvent.change(within(sidebar).getByLabelText('To'), {target: {value: '100'}});
    await act(async () => { fireEvent.blur(within(sidebar).getByLabelText('To')); });
    expect(requested().length).toBe(before);
    expect(where()).toBe('');

    fireEvent.change(within(sidebar).getByLabelText('To'), {target: {value: '900'}});
    await act(async () => { fireEvent.keyDown(within(sidebar).getByLabelText('To'), {key: 'Enter'}); });
    expect(where()).toBe('?min_price=500&max_price=900');
  });

  it('follows the address when a chip takes a filter off', async () => {
    setDesktop(true);
    await renderPage('/products?brands=Acme');
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByRole('checkbox', {name: 'Acme'}).checked).toBe(true);
    await click(screen.getByRole('button', {name: 'Remove Acme'}));
    expect(within(sidebar).getByRole('checkbox', {name: 'Acme'}).checked).toBe(false);
  });
});

describe('The filter helpers', () => {
  it('write the filters into an address and keep the rest', () => {
    const filters = {...emptyFilters(), category: 'shoes', brands: ['A', 'B'], min_price: '10', discount_type: 'fixed', discount_value: '100'};
    const next = filtersToParams(new URLSearchParams('search=x&ordering=price&page=3&colors=Red&brands=Z'), filters);
    expect(next.toString()).toBe('search=x&ordering=price&brands=A%2CB&category=shoes&min_price=10&discount_type=fixed&discount_value=100');
    expect(filtersToParams(next, emptyFilters()).toString()).toBe('search=x&ordering=price');
  });

  it('say a range the wrong way round, and nothing for a half range', () => {
    expect(priceProblem({min_price: '500', max_price: '100'})).toBe('The lowest price cannot be more than the highest');
    expect(priceProblem({min_price: '100', max_price: '500'})).toBe('');
    expect(priceProblem({min_price: '100', max_price: null})).toBe('');
  });

  it('find a category anywhere in the tree, and the way down to it', () => {
    expect(findCategory(SHOP.categories, 'men-shirts').name).toBe('Shirts');
    expect(findCategory(SHOP.categories, 'nope')).toBeNull();
    expect(findCategory(undefined, 'x')).toBeNull();
    expect(categoryAncestors(SHOP.categories, 'men-shirts')).toEqual(['men']);
    expect(categoryAncestors(SHOP.categories, 'men')).toEqual([]);
    expect(categoryAncestors(SHOP.categories, 'nope')).toBeNull();
  });

  it('name a chip for each choice, with a half range in words', () => {
    const filters = {...emptyFilters(), tags: ['Summer'], colors: ['Red'], max_price: '900', discount_type: 'fixed', discount_value: '100'};
    expect(filterChips(filters, SHOP.categories).map((chip) => chip.label)).toEqual(['Summer', 'Red', 'Up to ৳900', '৳100 off']);
    expect(filterChips({...emptyFilters(), category: 'unknown-one'}, []).map((chip) => chip.label)).toEqual(['unknown one']);
    expect(discountText(20, 'percentage')).toBe('20% off');
  });
});
