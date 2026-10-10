// What the product page tells a shopper before they decide: where they are (breadcrumb), the brand and whether it is in stock, the price card,
// Save to the wishlist, what delivery costs and how long it takes, the shop's suggested coupons, and the table of contents that keeps the
// long page reachable. The delivery charges and the coupons are the shop's answers (`/content/checkout/`, `/coupons/available/`): nothing
// about them is written in the page.
import React from 'react';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
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
import publicApi from '../api/publicApi';
import {getAllProducts, getProductById} from '../services/productService';
import {forgetDeliveryInfo} from '../hooks/useDeliveryInfo';
import {forgetProductOffers} from '../hooks/useProductOffers';
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
const PRODUCT = {
  id: 1, name: 'Blue Kettle', slug: 'kettle', sku: 'K-1', category: 'home', has_variants: false, availability_status: true, stock_left: null,
  base_price: 1200, discount_price: 900, has_discount: true, discount_value: 25, discount_type: 'percentage',
  avg_rating: 4.3, total_reviews: 12, total_orders: 34, minimum_order_quantity: 3, is_favourite: false,
  short_description: '<p>Boils fast</p>', long_description: '<p>A long text</p>',
  media_files: [media(1)], colors: null, sizes: [],
  categories: [{name: 'Home', slug: 'home'}, {name: 'Kitchen', slug: 'kitchen'}], brand: {name: 'Acme'}, tags: [], model: 'K-1', weight: null, dimension: null,
  material: '', features: '', warranty_information: '', shipping_information: '', return_policy: '7 days', qrcode_image_url: '',
};
const OTHER = (id) => ({id, name: `Other ${id}`, slug: `other-${id}`, image: '', base_price: 100, has_discount: false, availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0});

const CHECKOUT = {data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, delivery_estimates: {inside_dhaka: {min_days: 1, max_days: 2}}, shipping_addresses: [], user_info: null}}};
const OFFERS = {data: {data: {offers: [
  {code: 'WELCOME', public_title: '10% off your first order', min_order_amount: null, max_discount_amount: 200, eligible: true, amount_short: 0},
  {code: 'BIG3000', public_title: '৳100 off a big order', min_order_amount: 3000, max_discount_amount: null, eligible: false, amount_short: 3000},
]}}};

// What the shop answers to the page's two hints; 'fail' makes the request fail
const shopAnswers = ({checkout = CHECKOUT, offers = OFFERS} = {}) => publicApi.get.mockImplementation(async (url) => {
  const answer = url === '/content/checkout/' ? checkout : url === '/coupons/available/' ? offers : undefined;
  if (answer === 'fail') throw new Error('the shop is not answering');
  return answer;
});

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({signedIn = false} = {}) => configureStore({
  reducer: {product: productReducer, cart: cartReducer, auth: authReducer, wishList: wishListReducer, globalError: globalErrorReducer, recentlyViewed: recentlyViewedReducer},
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderPage = async (product = PRODUCT, {signedIn = false, related = []} = {}) => {
  getProductById.mockResolvedValue({data: {data: product}});
  getAllProducts.mockResolvedValue({data: {data: {results: related, next: null}}});
  const store = makeStore({signedIn});
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

// the title of a section is the button that folds it (the tab bar has a button of the same name, which only scrolls)
const folds = (name) => screen.getAllByText(name).map((element) => element.closest('button')).find((button) => button?.hasAttribute('aria-expanded'));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  forgetDeliveryInfo();
  forgetProductOffers();
  shopAnswers();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  delete navigator.clipboard;
});

describe('Where the shopper is', () => {
  it('has a breadcrumb: Home, the product\'s main category, and the product itself as the current page', async () => {
    await renderPage();
    const trail = within(screen.getByRole('navigation', {name: 'Breadcrumb'}));
    // the shop's root, then the product's main category (here also named "Home"; the product has a second category that is not the main one)
    expect(trail.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([['Home', '/'], ['Home', '/products?category=home']]);
    expect(trail.getByText('Blue Kettle').getAttribute('aria-current')).toBe('page');
  });

  it('shows the brand as a link to its products, and whether the product is in stock', async () => {
    await renderPage();
    expect(screen.getAllByRole('link', {name: 'Acme'})[0].getAttribute('href')).toBe('/products?brands=Acme'); // the one above the name (Specifications has another)
    expect(screen.getByText('In stock')).toBeTruthy();
    expect(screen.queryByText('Out of stock')).toBeNull();
    cleanup();
    await renderPage({...PRODUCT, availability_status: false});
    expect(screen.getByText('Out of stock')).toBeTruthy();
    expect(screen.queryByText('In stock')).toBeNull();
  });

  it('puts the price, the old price, the discount and what is saved on one card, with the product\'s code beside the rating', async () => {
    await renderPage();
    const card = screen.getAllByText('৳900').map((element) => element.closest('.rounded-2xl')).find(Boolean);
    expect(within(card).getByText('৳1,200').className).toContain('line-through');
    expect(within(card).getByText('25% OFF')).toBeTruthy();
    expect(within(card).getByText('You save ৳300')).toBeTruthy();
    expect(screen.getByText('SKU: K-1')).toBeTruthy();
  });

  it('draws no discount or saving for a product that has none', async () => {
    await renderPage({...PRODUCT, has_discount: false});
    expect(screen.queryByText(/OFF/)).toBeNull();
    expect(screen.queryByText(/You save/)).toBeNull();
  });
});

describe('Save to the wishlist', () => {
  it('fills for a guest at once and empties on the second tap', async () => {
    const {store} = await renderPage();
    const save = screen.getByRole('button', {name: 'Save to wishlist'});
    expect(save.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(save);
    expect(screen.getByRole('button', {name: 'Remove from wishlist'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(store.getState().wishList.favouriteIds[1]).toBe(1);

    fireEvent.click(screen.getByRole('button', {name: 'Remove from wishlist'}));
    expect(screen.getByRole('button', {name: 'Save to wishlist'}).getAttribute('aria-pressed')).toBe('false');
    expect(store.getState().wishList.favouriteIds[1]).toBeUndefined();
  });

  it('asks the shop for a signed-in customer, and starts filled when the product is already a favourite', async () => {
    api.post.mockResolvedValue({data: {success: true}});
    await renderPage({...PRODUCT, is_favourite: false}, {signedIn: true});
    fireEvent.click(screen.getByRole('button', {name: 'Save to wishlist'}));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Remove from wishlist'})).toBeTruthy());
    expect(api.post).toHaveBeenCalledWith('/accounts/favourite/', {product_id: 1}, expect.anything());

    cleanup();
    await renderPage({...PRODUCT, is_favourite: true}, {signedIn: true});
    expect(screen.getByRole('button', {name: 'Remove from wishlist'})).toBeTruthy();
  });
});

describe('Delivery and returns', () => {
  it('tells what delivery costs inside and outside Dhaka, and how long where the shop made a promise', async () => {
    await renderPage();
    const card = within(await screen.findByRole('region', {name: 'Delivery and returns'}));
    expect(card.getByText('Inside Dhaka: ৳60')).toBeTruthy();
    expect(card.getByText('Delivery in 1–2 days')).toBeTruthy();
    expect(card.getByText('Outside Dhaka: ৳120')).toBeTruthy();
    expect(card.getAllByText(/Delivery in/)).toHaveLength(1); // no promise for outside Dhaka, so none is made
  });

  it('is asked without the customer\'s token, and once per visit however many products they open', async () => {
    await renderPage({...PRODUCT}, {signedIn: true});
    await screen.findByRole('region', {name: 'Delivery and returns'});
    cleanup();
    await renderPage({...PRODUCT, id: 2, slug: 'mug', name: 'Red Mug'});
    await screen.findByRole('region', {name: 'Delivery and returns'}); // from what it already knows

    expect(publicApi.get.mock.calls.filter(([url]) => url === '/content/checkout/')).toHaveLength(1);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('says "Free" for a delivery that costs nothing', async () => {
    shopAnswers({checkout: {data: {data: {delivery_charges: {inside_dhaka: 0, outside_dhaka: 120}}}}});
    await renderPage();
    expect(await screen.findByText('Inside Dhaka: Free')).toBeTruthy();
  });

  it('keeps only the return policy when the shop does not answer, and draws nothing when there is no policy either', async () => {
    shopAnswers({checkout: 'fail'});
    await renderPage();
    const card = within(await screen.findByRole('region', {name: 'Delivery and returns'}));
    expect(card.queryByText(/Inside Dhaka/)).toBeNull();
    expect(card.getByText('Returns')).toBeTruthy();

    cleanup();
    forgetDeliveryInfo();
    await renderPage({...PRODUCT, return_policy: ''});
    await waitFor(() => expect(screen.queryByLabelText('Delivery and returns')).toBeNull());
  });

  it('opens the return policy and scrolls to it from the card', async () => {
    await renderPage();
    expect(folds('Return & Warranty').getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(await screen.findByRole('button', {name: 'Read the return policy'}));

    expect(folds('Return & Warranty').getAttribute('aria-expanded')).toBe('true');
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
    expect(Element.prototype.scrollIntoView.mock.contexts.some((element) => element.id === 'section-policy')).toBe(true);
  });
});

describe('Offers', () => {
  it('lists the coupons the shop suggests with their code and conditions', async () => {
    await renderPage();
    const offers = within(await screen.findByRole('region', {name: 'Offers'}));
    expect(offers.getByText('10% off your first order')).toBeTruthy();
    expect(offers.getByText('WELCOME')).toBeTruthy();
    expect(offers.getByText('Up to ৳200 off')).toBeTruthy();
    expect(offers.getByText('Min order ৳3,000')).toBeTruthy();
  });

  it('says how much more a minimum order needs for what is on the page, and stops when the quantity reaches it', async () => {
    await renderPage(); // ৳900 each, at least 3: ৳2,700
    expect(await screen.findByText('Add ৳300 more to use BIG3000')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Increase quantity')); // 4 pieces: ৳3,600
    expect(screen.queryByText(/more to use BIG3000/)).toBeNull();
  });

  it('copies a code, and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
    await renderPage();

    fireEvent.click(await screen.findByRole('button', {name: 'Copy code WELCOME'}));

    await waitFor(() => expect(screen.getByRole('button', {name: 'WELCOME copied'})).toBeTruthy());
    expect(writeText).toHaveBeenCalledWith('WELCOME');
  });

  it('has no Copy button where the browser cannot copy, but the code is still there to read', async () => {
    await renderPage();
    const offers = within(await screen.findByRole('region', {name: 'Offers'}));
    expect(offers.queryByRole('button')).toBeNull();
    expect(offers.getByText('WELCOME')).toBeTruthy();
  });

  it('shows at most three, and nothing when the shop suggests none or does not answer', async () => {
    const many = Array.from({length: 5}, (_, index) => ({code: `C${index}`, public_title: `Offer ${index}`, min_order_amount: null, max_discount_amount: null}));
    shopAnswers({offers: {data: {data: {offers: many}}}});
    await renderPage();
    const offers = within(await screen.findByRole('region', {name: 'Offers'}));
    expect(offers.getAllByRole('listitem')).toHaveLength(3);

    cleanup();
    forgetProductOffers();
    shopAnswers({offers: {data: {data: {offers: []}}}});
    await renderPage();
    await screen.findByRole('region', {name: 'Delivery and returns'});
    expect(screen.queryByRole('region', {name: 'Offers'})).toBeNull();

    cleanup();
    forgetProductOffers();
    shopAnswers({offers: 'fail'});
    await renderPage();
    await screen.findByRole('region', {name: 'Delivery and returns'});
    expect(screen.queryByRole('region', {name: 'Offers'})).toBeNull();
  });
});

describe('The tab bar', () => {
  const bar = () => within(screen.getByRole('navigation', {name: 'Sections of this page'}));

  it('lists the parts this product has, with the number of reviews', async () => {
    await renderPage(PRODUCT, {related: [OTHER(10)]});
    await screen.findByText('Related Products');
    expect(bar().getAllByRole('button').map((button) => button.textContent)).toEqual(['Description', 'Specifications', 'Returns', 'Reviews (12)', 'Related']);

    cleanup();
    await renderPage({...PRODUCT, long_description: '', model: '', categories: [], brand: null, return_policy: '', total_reviews: 0});
    expect(screen.queryByRole('navigation', {name: 'Sections of this page'})).toBeNull(); // only Reviews is left: nothing to choose between
  });

  it('opens a folded section and scrolls to it', async () => {
    await renderPage();
    expect(folds('Specifications').getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(bar().getByRole('button', {name: 'Specifications'}));

    expect(folds('Specifications').getAttribute('aria-expanded')).toBe('true');
    await waitFor(() => expect(Element.prototype.scrollIntoView.mock.contexts.some((element) => element.id === 'section-specs')).toBe(true));
    expect(bar().getByRole('button', {name: 'Specifications'}).getAttribute('aria-current')).toBe('true');
  });

  it('sticks under the header (56 px on a phone, 72 px from md) and its targets clear it when scrolled to', async () => {
    const {container} = await renderPage();
    const nav = screen.getByRole('navigation', {name: 'Sections of this page'});
    expect(nav.className).toContain('sticky');
    expect(nav.className).toContain('top-14');
    expect(nav.className).toContain('md:top-[72px]');
    ['section-description', 'section-specs', 'section-policy', 'section-reviews', 'section-related'].forEach((id) => {
      expect(container.querySelector(`#${id}`).className).toContain('scroll-mt-32');
    });
  });

  it('keeps the gallery in view beside the details on a tall screen from md up', async () => {
    const {container} = await renderPage();
    const gallery = container.querySelector('[data-testid="swiper"]').closest('.md\\:self-start');
    expect(gallery.className).toContain('[@media(min-height:860px)]:md:sticky');
  });
});
