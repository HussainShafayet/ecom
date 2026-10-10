// The product page, phone first: a swipe gallery whose thumbnails are pictures (a video only loads when played), honest
// stars, a price in taka, colour/size choices, a quantity you can type that respects the minimum order, buy buttons that
// really buy (Buy Now used to send a product with variants to its own page), a message where the customer is looking,
// sections that fold up, a share button, and related products without the product itself.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import productReducer, {MAX_QUANTITY, setQuantity} from '../redux/slice/productSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import recentlyViewedReducer from '../redux/slice/recentlyViewedSlice';
import api from '../api/axiosSetup';
import {getAllProducts, getProductById} from '../services/productService';
import {RatingStars} from '../components/common';
import ProductDetails from '../pages/ProductDetails';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getProductById: vi.fn(), getAllProducts: vi.fn()}));
vi.mock('../components/common/product/RatingAndReview', () => ({default: () => <p>the reviews</p>}));
vi.mock('swiper/react', () => ({
  Swiper: ({children}) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

const media = (n, type = 'image') => ({file_url: `/m${n}.${type === 'video' ? 'mp4' : 'jpg'}`, thumbnail_url: `/t${n}.jpg`, file_type: type});
const PLAIN = {
  id: 1, name: 'Blue Kettle', slug: 'kettle', category: 'home', has_variants: false, availability_status: true,
  base_price: 1200, discount_price: 900, has_discount: true, discount_value: 25, discount_type: 'percentage',
  avg_rating: 4.3, total_reviews: 12, total_orders: 34, minimum_order_quantity: 3,
  short_description: '<p>Boils fast</p>', long_description: '<p>A long text</p>',
  media_files: [media(1), media(2), media(3, 'video')], colors: null, sizes: [],
  categories: [{name: 'Home', slug: 'home'}], brand: {name: 'Acme'}, tags: [], model: 'K-1', weight: null, dimension: null,
  material: '', features: '', warranty_information: '', shipping_information: '', return_policy: '7 days', qrcode_image_url: '/qr.png',
};
const size = (name, variant_id, extra = {}) => ({name, variant_id, base_price: 1200, discount_price: 900, availability_status: true, ...extra});
const VARIANT = {
  ...PLAIN, id: 2, name: 'Cotton Shirt', slug: 'shirt', has_variants: true, minimum_order_quantity: 1,
  colors: [
    {name: 'Red', hex_code: '#ff0000', media_files: [media(5), media(6)], sizes: [size('S', 11), size('M', 12, {availability_status: false})]},
    {name: 'Blue', hex_code: '#0000ff', media_files: [media(7)], sizes: [size('L', 13)]},
  ],
};
const OTHER = (id) => ({id, name: `Other ${id}`, slug: `other-${id}`, image: '', base_price: 100, has_discount: false, availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0});

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({signedIn = false} = {}) => configureStore({
  reducer: {product: productReducer, cart: cartReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, recentlyViewed: recentlyViewedReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderPage = async (product = PLAIN, {signedIn = false, related = []} = {}) => {
  getProductById.mockResolvedValue({data: {data: product}});
  getAllProducts.mockResolvedValue({data: {data: {results: related, next: null}}});
  const store = makeStore({signedIn});
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/products/detail/${product.slug}`]}>
        <Routes>
          <Route path="/products/detail/:slug" element={<ProductDetails />} />
          <Route path="/checkout" element={<p>checkout page</p>} />
          <Route path="/cart" element={<p>cart page</p>} />
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
});

afterEach(() => {
  delete navigator.share;
});

describe('The stars', () => {
  it('are rounded to the nearest half (4.1 is four stars, not five) and read out as one sentence', () => {
    const {container} = render(<RatingStars rating={4.1} reviews={7} />);
    expect(screen.getByRole('img', {name: 'Rated 4.1 out of 5 from 7 reviews'})).toBeTruthy();
    expect(container.querySelectorAll('.text-yellow-500 svg')).toHaveLength(5);
  });
});

describe('The top of the page', () => {
  it('shows the name, honest stars that lead to the reviews, the price in taka with its discount, and no made-up rating breakdown', async () => {
    await renderPage();

    expect(screen.getByRole('img', {name: 'Rated 4.3 out of 5 from 12 reviews'})).toBeTruthy();
    expect(screen.getByText('34 orders')).toBeTruthy();
    expect(screen.getAllByText('৳900').length).toBeGreaterThan(0);
    expect(screen.getAllByText('৳1,200').length).toBeGreaterThan(0);
    expect(screen.getByText('25% OFF')).toBeTruthy();
    expect(screen.getByText('Boils fast')).toBeTruthy();
    expect(screen.queryByText('80%')).toBeNull(); // the fake "80% five star" that every product used to show
    expect(screen.getByText('the reviews')).toBeTruthy();
  });

  it('shows no stars for a product nobody rated', async () => {
    await renderPage({...PLAIN, avg_rating: 0, total_reviews: 0});
    expect(screen.queryByRole('img', {name: /Rated/})).toBeNull();
  });
});

describe('The gallery', () => {
  it('has a thumbnail for each picture and video, none of them a <video>, and a counter', async () => {
    const {container} = await renderPage();

    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByLabelText('Show picture 1').getAttribute('aria-current')).toBe('true');
    expect(screen.getByLabelText('Show video 3')).toBeTruthy();
    const strip = screen.getByLabelText('Show video 3').parentElement;
    expect(strip.querySelector('video')).toBeNull(); // a thumbnail is a picture
    // the video in the slider waits until it is played
    expect(container.querySelector('video').getAttribute('preload')).toBe('none');
    expect(container.querySelector('video').getAttribute('poster')).toBe('/t3.jpg');
  });

  it('shows the picture whose thumbnail was tapped', async () => {
    await renderPage();
    fireEvent.click(screen.getByLabelText('Show picture 2'));
    expect(screen.getByText('2/3')).toBeTruthy();
    expect(screen.getByLabelText('Show picture 2').getAttribute('aria-current')).toBe('true');
  });

  it('shows the pictures of the colour that was chosen', async () => {
    await renderPage(VARIANT);
    expect(screen.getByText('1/2')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Blue'));
    // Blue has one picture: no counter, no thumbnails
    expect(screen.queryByText(/\d\/\d/)).toBeNull();
    expect(screen.queryByLabelText('Show picture 1')).toBeNull();
  });
});

describe('The picture on every screen', () => {
  it('is never taller than the screen can show: capped by the screen\'s height, with room for the fixed bars on a phone and less on a phone held sideways', async () => {
    const {container} = await renderPage();
    const gallery = [...container.querySelectorAll('div')].find((element) => element.className.includes('max-w-[clamp('));
    expect(gallery.contains(container.querySelector('[data-testid="swiper"]'))).toBe(true);
    expect(gallery.className).toContain('mx-auto');
    expect(gallery.className).toContain('max-w-[clamp(16rem,calc(100vh_-_19rem),100%)]'); // a phone: the header, breadcrumb, fixed buy bar and bottom nav are around it
    expect(gallery.className).toContain('[@media(min-width:768px)_and_(min-height:501px)]:max-w-[clamp(16rem,calc(100vh_-_17rem),100%)]'); // a laptop: no fixed bars
    expect(gallery.className).toContain('short:max-w-[clamp(12rem,calc(100vh_-_17rem),100%)]'); // a phone held sideways: hardly any height
    // and from md the picture's COLUMN is that wide, so the picture fills it (no gap on both sides on a wide, short laptop screen); the details beside it, centred as a pair
    expect(container.querySelector('.grid').className).toContain('md:grid-cols-[minmax(0,min(50%,max(16rem,calc(100vh_-_17rem))))_minmax(0,48rem)]');
    expect(container.querySelector('.grid').className).toContain('md:justify-center');
  });

  it('puts the details beside the picture on a phone held sideways, and leaves the buy buttons in the page there instead of in a bar over the navigation', async () => {
    const {container} = await renderPage();
    expect(container.querySelector('.grid').className).toContain('short:grid-cols-2');
    const bar = screen.getByText('Add to Cart').closest('div.fixed');
    expect(bar.className).toContain('short:static');
    expect(bar.className).toContain('short:shadow-none');
  });
});

describe('Choosing', () => {
  it('names the chosen colour and size, and offers the sizes of that colour', async () => {
    await renderPage(VARIANT);

    expect(screen.getByText('Color:').textContent).toBe('Color: Red'); // written out: a phone has no hover tooltip
    expect(screen.getByText('Size:').textContent).toBe('Size: S');
    expect(screen.getByRole('button', {name: 'S'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('Red').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', {name: 'M'})).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Blue'));
    expect(screen.getByLabelText('Blue').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('button', {name: 'M'})).toBeNull(); // Blue has other sizes
    expect(screen.getByRole('button', {name: 'L'}).getAttribute('aria-pressed')).toBe('true');
  });

  it('says a size is out of stock and offers no way to buy it', async () => {
    await renderPage(VARIANT);
    fireEvent.click(screen.getByRole('button', {name: 'M'}));
    expect(screen.getByText('Out of Stock')).toBeTruthy();
    expect(screen.queryByText('Add to Cart')).toBeNull();
    expect(screen.queryByLabelText('Quantity')).toBeNull();
  });
});

describe('Only a few left', () => {
  it('says so under the choices for a plain product, and says nothing when the shop did not', async () => {
    await renderPage({...PLAIN, stock_left: 2});
    expect(screen.getByText('Only 2 left in stock - order soon')).toBeTruthy();
    cleanup();
    await renderPage({...PLAIN, stock_left: null});
    expect(screen.queryByText(/left in stock/)).toBeNull();
  });

  it('follows the size chosen, and the colour that offers other sizes', async () => {
    const shirt = {
      ...VARIANT,
      colors: [
        {...VARIANT.colors[0], sizes: [size('S', 11, {stock_left: 2}), size('M', 12), size('XL', 14, {stock_left: 1})]},
        {...VARIANT.colors[1], sizes: [size('L', 13)]},
      ],
    };
    await renderPage(shirt);
    expect(screen.getByText('Only 2 left in stock - order soon')).toBeTruthy(); // S, the first size, is chosen

    fireEvent.click(screen.getByRole('button', {name: 'M'}));
    expect(screen.queryByText(/left in stock/)).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'XL'}));
    expect(screen.getByText('Only 1 left in stock - order soon')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Blue')); // its one size, with plenty
    expect(screen.queryByText(/left in stock/)).toBeNull();
  });

  it('is not said for a size that is sold out', async () => {
    const shirt = {...VARIANT, colors: [{...VARIANT.colors[0], sizes: [size('S', 11, {availability_status: false, stock_left: null})]}]};
    await renderPage(shirt);
    expect(screen.getByText('Out of Stock')).toBeTruthy();
    expect(screen.queryByText(/left in stock/)).toBeNull();
  });
});

describe('A colour sold without sizes', () => {
  // The colour itself is the variant: it carries its own variant_id, price, availability and stock_left (sizes: [])
  const SCARF = {
    ...VARIANT, id: 3, name: 'Wool Scarf', slug: 'scarf', minimum_order_quantity: 1,
    colors: [
      {name: 'Red', hex_code: '#ff0000', media_files: [media(5)], sizes: [], variant_id: 21, base_price: 500, discount_price: 400, availability_status: true, stock_left: 3},
      {name: 'Blue', hex_code: '#0000ff', media_files: [media(6)], sizes: [], variant_id: 22, base_price: 520, discount_price: 420, availability_status: false, stock_left: null},
      {name: 'Green', hex_code: '#00ff00', media_files: [media(7)], sizes: [size('L', 23)]},
    ],
  };

  it('can be bought: not "Out of Stock", with its own price and how many are left', async () => {
    await renderPage(SCARF);
    expect(screen.queryByText('Out of Stock')).toBeNull();
    expect(screen.getByText('Add to Cart')).toBeTruthy();
    expect(screen.getByText('Buy Now')).toBeTruthy();
    expect(screen.getAllByText('৳400').length).toBeGreaterThan(0); // the colour's price, not the product's ৳900
    expect(screen.getByText('Only 3 left in stock - order soon')).toBeTruthy();
    expect(screen.queryByText('Size:')).toBeNull(); // nothing to choose
  });

  it('puts the colour\'s variant in the cart, at the colour\'s price', async () => {
    const {store} = await renderPage(SCARF);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(await screen.findByRole('dialog', {name: 'Added to your cart'})).toBeTruthy();
    expect(store.getState().cart.cartItems[0]).toMatchObject({id: 3, variant_id: 21, color_name: 'Red', discount_price: 400});
  });

  it('says so when that colour is sold out, and offers the next colour', async () => {
    await renderPage(SCARF);
    fireEvent.click(screen.getByLabelText('Blue'));
    expect(screen.getByText('Out of Stock')).toBeTruthy();
    expect(screen.queryByText('Add to Cart')).toBeNull();
    expect(screen.queryByText(/left in stock/)).toBeNull();

    fireEvent.click(screen.getByLabelText('Red'));
    expect(screen.getByText('Add to Cart')).toBeTruthy();
  });

  it('goes back to choosing a size when the next colour has sizes', async () => {
    await renderPage(SCARF);
    fireEvent.click(screen.getByLabelText('Green'));
    expect(screen.getByText('Size:').textContent).toBe('Size: L');
    expect(screen.getByText('Add to Cart')).toBeTruthy();
  });
});

describe('The quantity', () => {
  it('starts at the minimum order and says so, and − stops there', async () => {
    await renderPage();
    expect(screen.getByLabelText('Quantity').value).toBe('3');
    expect(screen.getByText('Minimum order: 3')).toBeTruthy();
    expect(screen.getByLabelText('Decrease quantity').disabled).toBe(true);

    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(screen.getByLabelText('Quantity').value).toBe('4');
    fireEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(screen.getByLabelText('Quantity').value).toBe('3');
  });

  it('can be typed (it could not before), and a number below the minimum goes back to it', async () => {
    const {store} = await renderPage();
    const box = screen.getByLabelText('Quantity');

    fireEvent.change(box, {target: {value: '12'}});
    expect(store.getState().product.quantity).toBe(12);
    expect(box.value).toBe('12');

    fireEvent.change(box, {target: {value: '1'}}); // below 3: not accepted...
    expect(store.getState().product.quantity).toBe(12);
    fireEvent.blur(box); // ...and the box shows what is kept again
    expect(box.value).toBe('12');

    fireEvent.change(box, {target: {value: 'ab'}}); // only digits
    expect(box.value).toBe('');
  });

  it('never goes above what one cart line can hold, and says no minimum for a product without one', () => {
    const store = makeStore();
    store.dispatch(setQuantity(99999999));
    expect(store.getState().product.quantity).toBe(MAX_QUANTITY);
  });

  it('shows no minimum-order line when the product has none', async () => {
    await renderPage({...PLAIN, minimum_order_quantity: 1});
    expect(screen.queryByText(/Minimum order/)).toBeNull();
    expect(screen.getByLabelText('Quantity').value).toBe('1');
  });
});

describe('The buy buttons', () => {
  it('put the quantity in the cart, and a sheet says so with where to go next (product-page-retention.test.js)', async () => {
    const {store} = await renderPage();
    fireEvent.click(screen.getByLabelText('Increase quantity'));

    fireEvent.click(screen.getByText('Add to Cart'));

    const sheet = await screen.findByRole('dialog', {name: 'Added to your cart'});
    expect(store.getState().cart.cartItems[0]).toMatchObject({id: 1, quantity: 4});
    expect(within(sheet).getByRole('link', {name: 'View cart'}).getAttribute('href')).toBe('/cart');
    expect(within(sheet).getByRole('link', {name: 'Checkout'}).getAttribute('href')).toBe('/checkout');
  });

  it('Buy Now buys and goes to checkout, also for a product with variants (it used to send it to its own page)', async () => {
    const {store} = await renderPage(VARIANT);
    fireEvent.click(screen.getByRole('button', {name: 'S'})); // the chosen size

    fireEvent.click(screen.getByText('Buy Now'));

    expect(await screen.findByText('checkout page')).toBeTruthy();
    expect(store.getState().cart.cartItems).toHaveLength(1);
    expect(store.getState().cart.cartItems[0]).toMatchObject({id: 2, quantity: 1});
  });

  it('say why the shop said no, right by the buttons', async () => {
    api.post.mockRejectedValue({response: {data: {success: false, errors: ['Only 1 of Blue Kettle left in stock.']}}});
    await renderPage(PLAIN, {signedIn: true});

    fireEvent.click(screen.getByText('Add to Cart'));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Only 1 of Blue Kettle left in stock.');
    expect(alert.parentElement.textContent).toContain('Add to Cart'); // in the buy bar, not at the top of the page
    expect(screen.queryByRole('dialog')).toBeNull(); // nothing was added: no "Added to your cart"
  });

  it('are a bar fixed above the bottom navigation on a phone and an ordinary row from md up', async () => {
    await renderPage();
    const bar = screen.getByText('Add to Cart').closest('div.fixed');
    expect(bar.className).toContain('bottom-14');
    expect(bar.className).toContain('md:static');
    expect(within(bar).getAllByText('৳900').length).toBe(1); // the price rides along on a phone (md:hidden)
  });
});

describe('The sections', () => {
  it('fold up under their title on a phone (the description open), and only show what has a value', async () => {
    await renderPage();

    // the title of a section is the button that folds it (the tab bar has a "Description" button too, which only scrolls)
    const folds = (name) => screen.getAllByText(name).map((element) => element.closest('button')).find((button) => button?.hasAttribute('aria-expanded'));
    const description = folds('Description');
    expect(description.getAttribute('aria-expanded')).toBe('true');
    const specs = folds('Specifications');
    expect(specs.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(specs);
    expect(specs.getAttribute('aria-expanded')).toBe('true');

    expect(screen.getByText('Model:')).toBeTruthy();
    expect(screen.getByText('Brand:')).toBeTruthy();
    expect(screen.queryByText('Weight:')).toBeNull(); // no "Weight: N/A"
    expect(screen.queryByText('Materials:')).toBeNull();
    expect(screen.queryByText('Warranty:')).toBeNull();
    expect(screen.getByText('Return policy:')).toBeTruthy();
  });

  it('slide open and shut, and while shut their content is inert (Tab and screen readers skip what is not shown)', async () => {
    await renderPage();
    const folds = (name) => screen.getAllByText(name).map((element) => element.closest('button')).find((button) => button?.hasAttribute('aria-expanded'));
    const contentOf = (name) => document.getElementById(folds(name).getAttribute('aria-controls'));

    expect(contentOf('Specifications').firstElementChild.hasAttribute('inert')).toBe(true);
    expect(contentOf('Specifications').className).toContain('grid-rows-[0fr]');
    expect(contentOf('Description').firstElementChild.hasAttribute('inert')).toBe(false);
    expect(contentOf('Description').className).toContain('grid-rows-[1fr]');

    fireEvent.click(folds('Specifications'));
    expect(contentOf('Specifications').firstElementChild.hasAttribute('inert')).toBe(false);
    expect(contentOf('Specifications').className).toContain('grid-rows-[1fr]');
  });

  it('are never folded or inert on a wide screen, where the title is only a title', async () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({matches: query.includes('min-width: 768px'), addEventListener() {}, removeEventListener() {}});
    try {
      await renderPage();
      const specs = screen.getAllByText('Specifications').map((element) => element.closest('button')).find((button) => button?.hasAttribute('aria-expanded'));
      const content = document.getElementById(specs.getAttribute('aria-controls'));
      expect(content.firstElementChild.hasAttribute('inert')).toBe(false);
      expect(content.className).toContain('grid-rows-[1fr]');
    } finally {
      window.matchMedia = original;
    }
  });

  it('link category and brand in this tab, and keep the QR code for a computer\'s screen', async () => {
    const {container} = await renderPage();
    const category = within(screen.getByRole('heading', {name: 'Specifications'}).closest('section')).getByText('Home', {selector: 'a'});
    expect(category.getAttribute('href')).toBe('/products/?category=home');
    expect(category.getAttribute('target')).toBeNull();
    const qr = container.querySelector('img[alt="QR code of this page"]').parentElement.className;
    expect(qr).toContain('hidden');
    expect(qr).toContain('md:block');
  });

  it('are left out when there is nothing to show', async () => {
    await renderPage({...PLAIN, long_description: '', model: '', return_policy: '', qrcode_image_url: '', categories: [], brand: null});
    expect(screen.queryByText('Description')).toBeNull();
    expect(screen.queryByText('Specifications')).toBeNull();
    expect(screen.queryByText('Return & Warranty')).toBeNull();
  });
});

describe('Sharing', () => {
  it('opens the phone\'s share sheet where there is one', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined);
    await renderPage();

    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => expect(navigator.share).toHaveBeenCalledWith({title: 'Blue Kettle', url: window.location.href}));
  });

  it('is a menu elsewhere, whose Copy link says "Link copied" instead of a blocking alert, and shares the product\'s name', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    await renderPage();

    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByText('WhatsApp').closest('a').getAttribute('href')).toContain(encodeURIComponent('Blue Kettle'));
    expect(screen.getByText('WhatsApp').closest('a').getAttribute('href')).not.toContain('undefined');
    fireEvent.click(screen.getByText('Copy link'));

    expect(await screen.findByText('Link copied')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(alertSpy).not.toHaveBeenCalled();
  });
});

describe('Related products', () => {
  it('leave out the product itself, show at most twelve, and are a swipe row', async () => {
    const related = [PLAIN, ...Array.from({length: 14}, (_, index) => OTHER(index + 10))];
    const {container} = await renderPage(PLAIN, {related});

    expect(await screen.findByText('Related Products')).toBeTruthy();
    expect(screen.getAllByText(/^Other \d+$/)).toHaveLength(12);
    expect(screen.getAllByRole('heading', {name: 'Blue Kettle'})).toHaveLength(1); // only the page's own heading, not a card of itself
    expect(container.querySelector('.snap-x')).toBeTruthy();
    expect(getAllProducts.mock.calls[0][0]).toBe(13); // asked for one more than it shows
  });
});
