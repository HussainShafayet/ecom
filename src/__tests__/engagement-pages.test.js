// Keeping a customer on the page: the page-not-found page is the shop's own and gives a lost customer somewhere to go, the order page
// invites a guest to make an account and shows what else sells, the product page says what the discount saves and repeats the shop's trust
// points where the customer decides, the wishlist can put what is ready in the cart in one tap, and a guest's checkout form survives a refresh.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

import siteReducer, {EMPTY_SITE} from '../redux/slice/siteSlice';
import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import wishListReducer, {addToWishlist} from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import toastReducer from '../redux/slice/toastSlice';
import pageTitleReducer, {selectPageTitle} from '../redux/slice/pageTitleSlice';
import categoryReducer from '../redux/slice/categorySlice';
import bestSellingReducer from '../redux/slice/product/bestSellingSlice';
import checkoutReducer from '../redux/slice/checkoutSlice';
import orderReducer from '../redux/slice/orderSlice';
import productReducer from '../redux/slice/productSlice';
import recentlyViewedReducer from '../redux/slice/recentlyViewedSlice';
import api from '../api/axiosSetup';
import publicApi from '../api/publicApi';
import {getAllCategories} from '../services/categoryService';
import {getAllProducts, getBestSellingProducts, getProductById} from '../services/productService';
import {getOrder} from '../services/orderService';
import {divisionsData, districtsData} from '../data/location';
import {addAllSummary, sortForAddAll} from '../utils/addProductToCart';
import {clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft} from '../utils/checkoutDraft';
import NotFound from '../pages/NotFound';
import OrderConfirmation from '../pages/OrderConfirmation';
import ProductDetails from '../pages/ProductDetails';
import WishList from '../pages/user/WishList';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));
vi.mock('../services/categoryService', () => ({getAllCategories: vi.fn()}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getBestSellingProducts: vi.fn(), getProductById: vi.fn(), getAllProducts: vi.fn()}));
vi.mock('../services/orderService', () => ({getOrders: vi.fn(), getOrder: vi.fn(), cancelOrder: vi.fn(), trackOrder: vi.fn()}));
vi.mock('../components/common/product/RatingAndReview', () => ({default: () => <p>the reviews</p>}));
vi.mock('swiper/react', () => ({Swiper: ({children}) => <div>{children}</div>, SwiperSlide: ({children}) => <div>{children}</div>}));

const init = (reducer) => reducer(undefined, {type: '@@init'});
const SITE = {...EMPTY_SITE, name: 'Rahim Store', tagline: 'Everyday things', trust_badges: [
  {icon: 'cash_on_delivery', title: 'Cash on delivery', subtitle: 'Pay when it arrives'},
  {icon: 'returns', title: 'Easy returns', subtitle: ''},
]};
const BEST = (id) => ({id, name: `Seller ${id}`, slug: `seller-${id}`, image: '', base_price: 100, has_discount: false, availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0});
const product = (id, extra = {}) => ({...BEST(id), name: `Item ${id}`, ...extra});

const makeStore = ({signedIn = false, site = SITE} = {}) => configureStore({
  reducer: {
    site: siteReducer, auth: authReducer, cart: cartReducer, wishList: wishListReducer, globalError: globalErrorReducer, toast: toastReducer,
    pageTitle: pageTitleReducer, category: categoryReducer, best_selling: bestSellingReducer, checkout: checkoutReducer, order: orderReducer,
    product: productReducer, recentlyViewed: recentlyViewedReducer,
  },
  preloadedState: {auth: {...init(authReducer), isAuthenticated: signedIn}, site: {...init(siteReducer), site}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const toasts = (store) => store.getState().toast.items.map((item) => item.message);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.sessionStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  getAllCategories.mockResolvedValue({data: {data: {results: [{id: 1, name: 'Kitchen', slug: 'kitchen', image: '', has_discount: false}]}}});
  getBestSellingProducts.mockResolvedValue({data: {data: {results: [BEST(1), BEST(2)], next: null}}});
});
afterEach(() => {
  vi.restoreAllMocks();
});

// --- the page that was not found ------------------------------------------------------------------------------------
const Where = () => {
  const location = useLocation();
  return <p data-testid="where">{location.pathname}{location.search}</p>;
};
const renderNotFound = (store = makeStore()) => render(
  <Provider store={store}>
    <MemoryRouter initialEntries={['/nope']}>
      <Routes>
        <Route path="/products" element={<Where />} />
        <Route path="/" element={<p>the home page</p>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('The page-not-found page', () => {
  it('wears the shop, not a stock white box, and names itself in the tab', () => {
    const store = makeStore();
    renderNotFound(store);
    expect(screen.getByRole('heading', {level: 1, name: 'Page not found'})).toBeTruthy();
    expect(screen.getByText('Rahim Store')).toBeTruthy();
    expect(screen.getByAltText('Rahim Store logo')).toBeTruthy();
    expect(selectPageTitle(store.getState())).toBe('Page not found');
  });

  it('lets a lost customer say what they wanted: the search goes to the products, with the words', () => {
    renderNotFound();
    fireEvent.change(screen.getByLabelText('Search products'), {target: {value: 'blue mug'}});
    fireEvent.click(screen.getByRole('button', {name: /Search/}));
    expect(screen.getByTestId('where').textContent).toBe('/products?search=blue%20mug');
  });

  it('shows all the products when nothing was typed, and offers Home', () => {
    renderNotFound();
    fireEvent.click(screen.getByRole('button', {name: /Search/}));
    expect(screen.getByTestId('where').textContent).toBe('/products');
    cleanup();
    renderNotFound();
    fireEvent.click(screen.getByRole('link', {name: 'Go to Home'}));
    expect(screen.getByText('the home page')).toBeTruthy();
  });

  it('offers the categories and the best sellers, and keeps its own title once they have loaded', async () => {
    const store = makeStore();
    renderNotFound(store);
    expect(await screen.findByRole('link', {name: 'Kitchen'})).toBeTruthy();
    expect(screen.getByText('Browse by category')).toBeTruthy();
    expect(await screen.findByText('Popular right now')).toBeTruthy();
    expect(await screen.findByText('Seller 1')).toBeTruthy();
    expect(selectPageTitle(store.getState())).toBe('Page not found'); // the suggestions must not take the page's name away
  });

  it('still works when the suggestions cannot be loaded: nothing is drawn for them', async () => {
    getAllCategories.mockRejectedValue(new Error('Network Error'));
    getBestSellingProducts.mockRejectedValue(new Error('Network Error'));
    renderNotFound();
    await waitFor(() => expect(getBestSellingProducts).toHaveBeenCalled());
    expect(screen.queryByText('Popular right now')).toBeNull();
    expect(screen.getByRole('heading', {level: 1, name: 'Page not found'})).toBeTruthy();
  });
});

// --- after the order is placed --------------------------------------------------------------------------------------
const PLACED = {order_id: 'GC-20261006-0001', status: 'pending', created_at: '2026-10-06T10:00:00Z', subtotal: 500, delivery_charge: 60, total: 560};
const renderConfirmation = (store) => render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[{pathname: `/order-confirmation/${PLACED.order_id}`, state: {order: PLACED}}]}>
      <Routes>
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/signup" element={<p>sign up page</p>} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('The page after an order is placed', () => {
  it('invites a guest to make an account, in a line that fits the phone', () => {
    renderConfirmation(makeStore({signedIn: false}));
    expect(screen.getByText('Order faster next time')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', {name: 'Create an account'}));
    expect(screen.getByText('sign up page')).toBeTruthy();
  });

  it('does not ask a signed-in customer to make one, and keeps its buttons', () => {
    getOrder.mockReturnValue(new Promise(() => {}));
    renderConfirmation(makeStore({signedIn: true}));
    expect(screen.queryByText('Order faster next time')).toBeNull();
    expect(screen.getByRole('link', {name: 'View Order'})).toBeTruthy();
    expect(screen.getByRole('link', {name: 'Continue Shopping'})).toBeTruthy();
  });

  it('shows what else sells under the order', async () => {
    renderConfirmation(makeStore());
    expect(await screen.findByText('You may also like')).toBeTruthy();
    expect(await screen.findByText('Seller 2')).toBeTruthy();
  });

  it('forgets the form a guest had typed: the order is placed', () => {
    saveCheckoutDraft({name: 'Rahim Uddin', address: 'House 1'});
    expect(loadCheckoutDraft()).not.toBeNull();
    renderConfirmation(makeStore());
    expect(loadCheckoutDraft()).toBeNull();
  });
});

// --- the product page ------------------------------------------------------------------------------------------------
const KETTLE = {
  id: 1, name: 'Blue Kettle', slug: 'kettle', category: 'home', has_variants: false, availability_status: true,
  base_price: 1200, discount_price: 900, has_discount: true, discount_value: 25, discount_type: 'percentage',
  avg_rating: 0, total_reviews: 0, total_orders: 0, minimum_order_quantity: 1,
  short_description: '<p>Boils fast</p>', long_description: '', media_files: [], colors: null, sizes: [],
  categories: [], brand: null, tags: [], model: '', weight: null, dimension: null, material: '', features: '',
  warranty_information: '', shipping_information: '', return_policy: '', qrcode_image_url: '',
};
const renderProduct = async (item, store = makeStore()) => {
  getProductById.mockResolvedValue({data: {data: item}});
  getAllProducts.mockResolvedValue({data: {data: {results: [], next: null}}});
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/products/detail/${item.slug}`]}>
        <Routes><Route path="/products/detail/:slug" element={<ProductDetails />} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  await screen.findByRole('heading', {level: 1, name: item.name});
};

describe('The product page keeps the customer sure', () => {
  it('says what the discount takes off one unit', async () => {
    await renderProduct(KETTLE);
    expect(screen.getByText('You save ৳300')).toBeTruthy();
  });

  it('says nothing about saving when the product is not discounted', async () => {
    await renderProduct({...KETTLE, has_discount: false, discount_price: null});
    expect(screen.queryByText(/You save/)).toBeNull();
  });

  it('repeats the shop\'s trust points under the buy buttons', async () => {
    await renderProduct(KETTLE);
    const points = screen.getByRole('list', {name: 'Why shop with us'});
    expect(within(points).getByText('Cash on delivery')).toBeTruthy();
    expect(within(points).getByText('Pay when it arrives')).toBeTruthy();
    expect(within(points).getByText('Easy returns')).toBeTruthy();
  });

  it('draws no trust points when the shop listed none', async () => {
    await renderProduct(KETTLE, makeStore({site: {...SITE, trust_badges: []}}));
    expect(screen.queryByRole('list', {name: 'Why shop with us'})).toBeNull();
  });
});

// --- the wishlist ----------------------------------------------------------------------------------------------------
const READY = product(1, {name: 'Ready Kettle'});
const NEEDS_SIZE = product(2, {name: 'Cotton Shirt', has_variants: true});
const SOLD_OUT = product(3, {name: 'Sold Out Lamp', availability_status: false});
const MIN_THREE = product(4, {name: 'Pencils', minimum_order_quantity: 3});

const renderWishlist = (store) => render(<Provider store={store}><MemoryRouter><WishList /></MemoryRouter></Provider>);
const withWishlist = (items, options) => {
  const store = makeStore(options);
  items.forEach((item) => store.dispatch(addToWishlist(item)));
  return store;
};
const inCart = (store) => store.getState().cart.cartItems.map((item) => [item.id, item.quantity]);

describe('"Add all to cart" on the wishlist', () => {
  it('puts every product that is ready in the cart, with its smallest order, and says what was left and why', async () => {
    const store = withWishlist([READY, NEEDS_SIZE, SOLD_OUT, MIN_THREE]);
    renderWishlist(store);

    fireEvent.click(screen.getByRole('button', {name: 'Add all to cart'}));

    await waitFor(() => expect(inCart(store)).toEqual([[1, 1], [4, 3]]));
    await waitFor(() => expect(toasts(store)).toEqual(['Added 2 items to your cart. 1 item needs a colour or size: open it to choose. 1 item is sold out.']));
    expect(store.getState().wishList.items).toHaveLength(4); // the wishlist stays as it is
    expect(screen.getByText('Ready Kettle')).toBeTruthy();
  });

  it('leaves a product that is already in the cart alone: adding it again would raise its quantity', async () => {
    const store = withWishlist([READY, MIN_THREE]);
    renderWishlist(store);
    fireEvent.click(screen.getByRole('button', {name: 'Add all to cart'}));
    await waitFor(() => expect(inCart(store)).toHaveLength(2));
    cleanup();

    renderWishlist(store);
    expect(screen.queryByRole('button', {name: 'Add all to cart'})).toBeNull(); // nothing left to add
    expect(inCart(store)).toEqual([[1, 1], [4, 3]]);
  });

  it('asks the shop for a signed-in customer, and says why when it refuses', async () => {
    api.get.mockResolvedValue({data: {data: [READY, MIN_THREE]}});
    api.post
      .mockResolvedValueOnce({data: {success: true, message: 'ok', data: null}})
      .mockRejectedValueOnce({response: {data: {success: false, errors: ['Only 2 of Pencils left in stock.']}}});
    const store = withWishlist([READY, MIN_THREE], {signedIn: true});
    renderWishlist(store);

    fireEvent.click(await screen.findByRole('button', {name: 'Add all to cart'}));

    await waitFor(() => expect(toasts(store)).toEqual(['Added 1 item to your cart. Only 2 of Pencils left in stock.']));
    expect(api.post).toHaveBeenCalledWith('/accounts/cart/', {product_id: 1, quantity: 1, variant_id: 1, action: 'increase'}, {section: 'add-cart'});
    expect(inCart(store)).toEqual([[1, 1]]);
  });

  it('is not offered when nothing on the list can go straight in', () => {
    renderWishlist(withWishlist([NEEDS_SIZE, SOLD_OUT]));
    expect(screen.queryByRole('button', {name: 'Add all to cart'})).toBeNull();
  });
});

describe('The empty wishlist', () => {
  it('says what to do, offers the products, and suggests what to start with', async () => {
    renderWishlist(makeStore());
    expect(screen.getByRole('heading', {name: 'Your wishlist is empty'})).toBeTruthy();
    expect(screen.getByRole('link', {name: 'Browse products'}).getAttribute('href')).toBe('/products');
    expect(await screen.findByText('Start with these')).toBeTruthy();
    expect(await screen.findByText('Seller 1')).toBeTruthy();
  });
});

describe('The add-all helpers', () => {
  it('sorts the products by what can be done with them', () => {
    const groups = sortForAddAll([READY, NEEDS_SIZE, SOLD_OUT, MIN_THREE], [{id: 4, variant_id: 4, quantity: 3}]);
    expect(groups.add.map((item) => item.id)).toEqual([1]);
    expect(groups).toMatchObject({needOptions: 1, soldOut: 1, already: 1});
  });

  it('writes one sentence, with the right plural', () => {
    expect(addAllSummary({added: 1, already: 0, needOptions: 0, soldOut: 0, refused: ''})).toBe('Added 1 item to your cart.');
    expect(addAllSummary({added: 0, already: 2, needOptions: 0, soldOut: 0, refused: ''})).toBe('2 items are already in your cart.');
    expect(addAllSummary({added: 0, already: 0, needOptions: 0, soldOut: 0, refused: ''})).toBe('Nothing to add.');
  });
});

// --- the checkout form a guest was filling ------------------------------------------------------------------------------
describe('The checkout draft', () => {
  it('keeps only the contact and delivery fields, and only text', () => {
    saveCheckoutDraft({name: 'Rahim', email: '', phone_number: '1712345678', address: 'House 1', payment_type: 'cash', couponCode: 'X', district: 5});
    expect(loadCheckoutDraft()).toEqual({name: 'Rahim', phone_number: '1712345678', address: 'House 1'});
  });

  it('is gone once cleared, but an empty form never wipes it (a new page starts empty, and StrictMode starts it twice)', () => {
    saveCheckoutDraft({name: 'Rahim'});
    clearCheckoutDraft();
    expect(loadCheckoutDraft()).toBeNull();
    saveCheckoutDraft({name: 'Rahim'});
    saveCheckoutDraft({name: ''});
    expect(loadCheckoutDraft()).toEqual({name: 'Rahim'});
  });

  it('ignores a saved value that is not what it wrote', () => {
    window.sessionStorage.setItem('checkout-draft', '{not json');
    expect(loadCheckoutDraft()).toBeNull();
    window.sessionStorage.setItem('checkout-draft', JSON.stringify({name: 7, evil: 'x', address: 'House 1'}));
    expect(loadCheckoutDraft()).toEqual({address: 'House 1'});
  });

  it('does not break the form where the browser refuses storage', () => {
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => { throw new Error('denied'); });
    expect(() => saveCheckoutDraft({name: 'Rahim'})).not.toThrow();
    expect(loadCheckoutDraft()).toBeNull();
    expect(() => clearCheckoutDraft()).not.toThrow();
  });
});

const MUG = {id: 1, name: 'Mug', slug: 'mug', image: '', base_price: 500, discount_price: 500, has_discount: false, quantity: 1, minimum_order_quantity: 1, variant_id: 1, availability_status: true};
const renderCheckout = async ({signedIn = false, strict = false} = {}) => {
  const {default: Checkout} = await import('../pages/Checkout');
  const content = {data: {data: {delivery_charges: {inside_dhaka: 60, outside_dhaka: 120}, shipping_addresses: [], user_info: null}}};
  publicApi.get.mockResolvedValue(content);
  api.get.mockImplementation((url) => (String(url).includes('accounts/cart') ? Promise.resolve({data: {data: [MUG]}}) : Promise.resolve(content)));
  const store = makeStore({signedIn});
  store.dispatch({type: 'cart/addToCart', payload: MUG});
  if (strict) {
    // StrictMode starts the page twice and asks the shop twice; on a real network the second answer comes LATER than the first (the first
    // one's restore is already done by then), and it is the one that used to wipe the name, phone and e-mail
    publicApi.get.mockReset();
    publicApi.get.mockResolvedValueOnce(content);
    publicApi.get.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(content), 250)));
  }
  const page = <Provider store={store}><MemoryRouter><Checkout /></MemoryRouter></Provider>;
  render(strict ? <React.StrictMode>{page}</React.StrictMode> : page);
  await screen.findByText('Place Order');
  return store;
};
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});

describe('The checkout page for a guest who comes back', () => {
  it('has the contact and delivery fields back after a refresh', async () => {
    await renderCheckout();
    type('Full name', 'Rahim Uddin');
    type('Phone number', '1712345678');
    type('Delivery area', 'inside_dhaka');
    type('Area in Dhaka', 'Gulshan');
    type('Full address', 'House 1, Road 2');
    cleanup(); // the tab was refreshed: a new page, a new store

    await renderCheckout();

    // (it goes back after the shop's checkout answer, which fills the name, phone and e-mail itself)
    await waitFor(() => expect(screen.getByLabelText('Full name').value).toBe('Rahim Uddin'));
    expect(screen.getByLabelText('Phone number').value).toBe('1712345678');
    expect(screen.getByLabelText('Delivery area').value).toBe('inside_dhaka');
    expect(screen.getByLabelText('Area in Dhaka').value).toBe('Gulshan');
    expect(screen.getByLabelText('Full address').value).toBe('House 1, Road 2');
  });

  it('comes back whole while React starts the page twice (StrictMode, as the dev server does): the second start used to clear the name, phone and e-mail', async () => {
    saveCheckoutDraft({name: 'Rahim Uddin', phone_number: '1712345678', email: 'rahim@example.com', address: 'House 1, Road 2'});

    await renderCheckout({strict: true});

    await waitFor(() => expect(screen.getByLabelText('Full name').value).toBe('Rahim Uddin'));
    await new Promise((resolve) => setTimeout(resolve, 600)); // the slower second answer has arrived by now
    expect(screen.getByLabelText('Full name').value).toBe('Rahim Uddin');
    expect(screen.getByLabelText('Phone number').value).toBe('1712345678');
    expect(screen.getByLabelText(/^Email/).value).toBe('rahim@example.com');
    expect(screen.getByLabelText('Full address').value).toBe('House 1, Road 2');
  });

  it('has the district list back too, for a division outside Dhaka', async () => {
    const division = divisionsData[0];
    const district = districtsData.find((item) => item.division_id === division.id);
    saveCheckoutDraft({name: 'Rahim', shipping_type: 'outside_dhaka', division: division.name, district: district.name});

    await renderCheckout();

    await waitFor(() => expect(screen.getByLabelText('Division').value).toBe(division.name));
    expect(screen.getByLabelText('District').value).toBe(district.name);
  });

  it('is kept in this tab only: nothing typed is written to the long-lived storage', async () => {
    await renderCheckout();
    type('Full name', 'Rahim Uddin');
    expect(window.sessionStorage.getItem('checkout-draft')).toContain('Rahim Uddin');
    expect(Object.values(window.localStorage).join(' ')).not.toContain('Rahim Uddin');
  });

  it('never keeps or restores anything for a signed-in customer (they have saved addresses)', async () => {
    saveCheckoutDraft({name: 'Somebody else'});
    await renderCheckout({signedIn: true});
    await new Promise((resolve) => setTimeout(resolve, 50)); // (a restore would have happened by now)
    expect(screen.getByLabelText('Full name').value).not.toBe('Somebody else');
    type('Full name', 'Rahim Uddin');
    expect(window.sessionStorage.getItem('checkout-draft')).not.toContain('Rahim Uddin');
  });
});
