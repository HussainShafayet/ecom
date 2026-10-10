// What keeps a shopper on the shop after the product page: a sheet when they add to the cart (what was added, what the cart holds, where to
// go, other products), the brand's other products, what they looked at before, and the small things that make the page feel finished (the
// picture fading in, the tab underline).
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import productReducer from '../redux/slice/productSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import recentlyViewedReducer from '../redux/slice/recentlyViewedSlice';
import api from '../api/axiosSetup';
import {getAllProducts, getProductById} from '../services/productService';
import {forgetDeliveryInfo} from '../hooks/useDeliveryInfo';
import {forgetProductOffers} from '../hooks/useProductOffers';
import {forgetBrandProducts} from '../hooks/useBrandProducts';
import ProductDetails from '../pages/ProductDetails';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getProductById: vi.fn(), getAllProducts: vi.fn()}));
vi.mock('../components/common/product/RatingAndReview', () => ({default: () => <p>the reviews</p>}));
vi.mock('swiper/react', () => ({
  Swiper: ({children}) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

const media = (n) => ({file_url: `/m${n}.jpg`, thumbnail_url: `/t${n}.jpg`, file_type: 'image'});
const size = (name, variant_id) => ({name, variant_id, base_price: 1200, discount_price: 900, availability_status: true});
const PRODUCT = {
  id: 1, name: 'Blue Kettle', slug: 'kettle', sku: 'K-1', category: 'home', has_variants: false, availability_status: true, stock_left: null,
  base_price: 1200, discount_price: 900, has_discount: true, discount_value: 25, discount_type: 'percentage',
  avg_rating: 4.3, total_reviews: 12, total_orders: 34, minimum_order_quantity: 1, is_favourite: false,
  short_description: '<p>Boils fast</p>', long_description: '<p>A long text</p>',
  media_files: [media(1)], colors: null, sizes: [],
  categories: [{name: 'Home', slug: 'home'}], brand: {name: 'Acme'}, tags: [], model: 'K-1', weight: null, dimension: null,
  material: '', features: '', warranty_information: '', shipping_information: '', return_policy: '7 days', qrcode_image_url: '',
};
const SHIRT = {
  ...PRODUCT, id: 2, name: 'Cotton Shirt', slug: 'shirt', has_variants: true, brand: null,
  colors: [{name: 'Red', hex_code: '#f00', media_files: [media(5)], sizes: [size('S', 11), size('M', 12)]}],
};
const other = (id, extra = {}) => ({id, name: `Other ${id}`, slug: `other-${id}`, image: `/o${id}.jpg`, base_price: 100, discount_price: 100, has_discount: false, availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0, ...extra});

// What the shop answers to the brand request ("More from Acme"); 'fail' makes it fail
const brandAnswers = (products) => api.get.mockImplementation(async (url) => {
  if (!String(url).startsWith('/products?brands=')) return undefined;
  if (products === 'fail') throw new Error('the shop is not answering');
  return {data: {data: {results: products}}};
});

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({signedIn = false, viewed = []} = {}) => configureStore({
  reducer: {product: productReducer, cart: cartReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, recentlyViewed: recentlyViewedReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}, recentlyViewed: {items: viewed, ids: {}}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderPage = async (product = PRODUCT, {signedIn = false, related = [], viewed = []} = {}) => {
  getProductById.mockResolvedValue({data: {data: product}});
  getAllProducts.mockResolvedValue({data: {data: {results: related, next: null}}});
  const store = makeStore({signedIn, viewed});
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/products/detail/${product.slug}`]}>
        <Routes>
          <Route path="/products/detail/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  await screen.findByRole('heading', {level: 1, name: product.name});
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  forgetDeliveryInfo();
  forgetProductOffers();
  forgetBrandProducts();
  brandAnswers([]);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  delete navigator.clipboard;
});

// The page's own Add to Cart: the one in the buy bar (the related products' cards have buttons of the same name)
const buyButton = () => within(document.querySelector('div.fixed.bottom-14')).getByText('Add to Cart');

describe('Loading', () => {
  const skeleton = () => screen.queryByRole('status', {name: 'Loading the product'});

  it('does not bring the skeleton back over the page while the related products load (it blinked twice)', async () => {
    let answer;
    const {store} = await renderPage(PRODUCT, {related: []});
    getAllProducts.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
    getProductById.mockResolvedValue({data: {data: {...PRODUCT, id: 9, slug: 'kettle'}}});
    cleanup();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/products/detail/kettle']}>
          <Routes><Route path="/products/detail/:slug" element={<ProductDetails />} /></Routes>
        </MemoryRouter>
      </Provider>
    );
    await screen.findByRole('heading', {level: 1, name: 'Blue Kettle'});
    await waitFor(() => expect(store.getState().product.relatedProductsLoading).toBe(true)); // the page asked for the related ones
    expect(store.getState().product.isLoading).toBe(true); // ...which is what turned the shared flag on

    expect(screen.getByRole('heading', {level: 1, name: 'Blue Kettle'})).toBeTruthy(); // the page stays
    expect(skeleton()).toBeNull();

    answer({data: {data: {results: [other(40)], next: null}}});
    expect(await screen.findByText('Other 40')).toBeTruthy();
    expect(skeleton()).toBeNull();
  });

  it('keeps the product on screen when the related products could not be loaded (their error is not the product\'s)', async () => {
    getAllProducts.mockRejectedValue({response: {data: {message: 'down'}}});
    getProductById.mockResolvedValue({data: {data: PRODUCT}});
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/products/detail/kettle']}>
          <Routes><Route path="/products/detail/:slug" element={<ProductDetails />} /></Routes>
        </MemoryRouter>
      </Provider>
    );
    await screen.findByRole('heading', {level: 1, name: 'Blue Kettle'});
    await waitFor(() => expect(store.getState().product.error).toBeTruthy()); // the list failed
    expect(screen.getByRole('heading', {level: 1, name: 'Blue Kettle'})).toBeTruthy();
    expect(screen.queryByText(/couldn't load/i)).toBeNull();
  });

  it('shows the skeleton, not an old error or nothing, until the product has been asked for and answered', async () => {
    getProductById.mockReturnValue(new Promise(() => {}));
    getAllProducts.mockResolvedValue({data: {data: {results: [], next: null}}});
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/products/detail/kettle']}>
          <Routes><Route path="/products/detail/:slug" element={<ProductDetails />} /></Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole('status', {name: 'Loading the product'})).toBeTruthy(); // the very first render
    await waitFor(() => expect(store.getState().product.isLoading).toBe(true));
    expect(screen.getByRole('status', {name: 'Loading the product'})).toBeTruthy(); // waiting for the answer
  });
});

describe('After Add to Cart', () => {
  const addToCart = async (...args) => {
    const page = await renderPage(...args);
    fireEvent.click(buyButton());
    page.sheet = await screen.findByRole('dialog', {name: 'Added to your cart'});
    return page;
  };

  it('a sheet says what went in, how many and for how much, and what the cart holds now', async () => {
    await addToCart();
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    fireEvent.click(screen.getByLabelText('Increase quantity')); // (behind the sheet: only to prove the numbers are the ones that were added)
    const sheet = screen.getByRole('dialog', {name: 'Added to your cart'});
    expect(within(sheet).getByText('Blue Kettle')).toBeTruthy();
    expect(within(sheet).getByText(/1 × ৳900 =/)).toBeTruthy();
    expect(within(sheet).getByText('Your cart:').parentElement.textContent).toContain('1 item');
    expect(within(sheet).getByText('৳900', {selector: 'span.font-bold'})).toBeTruthy();
    expect(within(sheet).getByRole('link', {name: 'View cart'}).getAttribute('href')).toBe('/cart');
    expect(within(sheet).getByRole('link', {name: 'Checkout'}).getAttribute('href')).toBe('/checkout');
  });

  it('says the colour and the size of a product with choices', async () => {
    await renderPage(SHIRT);
    fireEvent.click(buyButton());
    const sheet = await screen.findByRole('dialog', {name: 'Added to your cart'});
    expect(within(sheet).getByText('Color: Red · Size: S')).toBeTruthy();
  });

  it('works the same for a signed-in customer, asking the shop first', async () => {
    api.post.mockResolvedValue({data: {success: true, message: 'ok', data: null}});
    await addToCart(PRODUCT, {signedIn: true});
    expect(api.post).toHaveBeenCalledWith('/accounts/cart/', expect.objectContaining({product_id: 1, quantity: 1, action: 'increase'}), expect.anything());
  });

  it('closes with Continue shopping, the X or Esc, and leaves the page and the cart as they were', async () => {
    const {store} = await addToCart();
    fireEvent.click(screen.getByRole('button', {name: 'Continue shopping'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(store.getState().cart.cartItems).toHaveLength(1);
    expect(buyButton()).toBeTruthy(); // the button is the button again

    fireEvent.click(buyButton());
    fireEvent.click(await screen.findByRole('button', {name: 'Close'}));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(buyButton());
    await screen.findByRole('dialog', {name: 'Added to your cart'});
    fireEvent.keyDown(document, {key: 'Escape'});
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('offers other products to look at (the related ones, six at most, never the product itself)', async () => {
    await renderPage(PRODUCT, {related: [PRODUCT, ...Array.from({length: 9}, (_, index) => other(index + 10))]});
    fireEvent.click(buyButton());
    const sheet = await screen.findByRole('dialog', {name: 'Added to your cart'});
    const links = within(sheet).getAllByRole('link').filter((link) => link.getAttribute('href').startsWith('/products/detail/'));
    expect(links).toHaveLength(6);
    expect(links.map((link) => link.getAttribute('href'))).not.toContain('/products/detail/kettle');
    expect(within(sheet).getByText('You may also like')).toBeTruthy();
  });

  it('is not drawn when the shop says no', async () => {
    api.post.mockRejectedValue({response: {data: {success: false, errors: ['Only 1 of Blue Kettle left in stock.']}}});
    await renderPage(PRODUCT, {signedIn: true});
    fireEvent.click(buyButton());
    expect((await screen.findByRole('alert')).textContent).toContain('left in stock');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('More from the brand', () => {
  it('shows the brand\'s other products under the related ones, the product itself left out', async () => {
    brandAnswers([PRODUCT, other(20), other(21)]);
    await renderPage();
    const section = await screen.findByRole('region', {name: 'More from Acme'});
    expect(within(section).getAllByText(/^Other \d+$/).map((element) => element.textContent)).toEqual(['Other 20', 'Other 21']);
    expect(within(section).queryByText('Blue Kettle')).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/products?brands=Acme&page_size=13', {section: 'brand-products', optionalAuth: true});
  });

  it('is asked once per brand however many of its products are opened', async () => {
    brandAnswers([other(20)]);
    await renderPage();
    await screen.findByRole('region', {name: 'More from Acme'});
    cleanup();
    await renderPage({...PRODUCT, id: 3, slug: 'mug', name: 'Red Mug'});
    await screen.findByRole('region', {name: 'More from Acme'});
    expect(api.get.mock.calls.filter(([url]) => String(url).startsWith('/products?brands='))).toHaveLength(1);
  }, 20000);

  it('draws nothing when the brand has no other product, the shop does not answer, or the product has no brand', async () => {
    brandAnswers([PRODUCT]);
    await renderPage();
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.queryByRole('region', {name: /More from/})).toBeNull();

    cleanup();
    forgetBrandProducts();
    brandAnswers('fail');
    await renderPage();
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('region', {name: /More from/})).toBeNull();

    cleanup();
    api.get.mockClear();
    await renderPage(SHIRT); // no brand
    expect(api.get.mock.calls.filter(([url]) => String(url).startsWith('/products?brands='))).toHaveLength(0);
  });
});

describe('Recently viewed', () => {
  it('shows what the shopper looked at before, and not the product they are on', async () => {
    await renderPage(PRODUCT, {viewed: [other(30), other(31)]});
    const section = await screen.findByRole('region', {name: 'Recently Viewed'});
    expect(within(section).getAllByText(/^Other \d+$/).map((element) => element.textContent).sort()).toEqual(['Other 30', 'Other 31']);
    expect(within(section).queryByText('Blue Kettle')).toBeNull(); // the page records it as seen: it must not be offered back
  });

  it('draws nothing when the product is the only one they have looked at', async () => {
    await renderPage();
    expect(screen.queryByRole('region', {name: 'Recently Viewed'})).toBeNull();
  });
});

describe('The finishing touches', () => {
  it('the picture fades in when it has arrived (invisible until then, so it does not appear in one piece)', async () => {
    const {container} = await renderPage();
    const picture = container.querySelector('[data-testid="swiper"] img');
    expect(picture.className).toContain('opacity-0');
    expect(picture.className).toContain('transition-opacity');

    fireEvent.load(picture);

    expect(picture.className).toContain('opacity-100');
    expect(picture.className).not.toContain('opacity-0');
  });

  it('the tab bar has one underline that slides to the tab being read, not a border on each tab', async () => {
    await renderPage();
    const bar = screen.getByRole('navigation', {name: 'Sections of this page'});
    const underline = bar.querySelector('li[aria-hidden="true"]');
    expect(underline.className).toContain('transition-[left,width]');
    expect(underline.className).toContain('motion-reduce:transition-none');
    expect(within(bar).getAllByRole('button').every((tab) => !tab.className.includes('border-b-2'))).toBe(true);
  });
});
