// The browser tab names the page: "Red Mug | GoCart". Pages say their name through `usePageTitle`; `Layout` is the only writer of
// `document.title`, so the shop's own title comes back by itself on a page with no name.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Link, MemoryRouter, Route, Routes} from 'react-router-dom';

import siteReducer, {handleFetchSite} from '../redux/slice/siteSlice';
import authReducer from '../redux/slice/authSlice';
import pageTitleReducer, {selectPageTitle, setPageTitle} from '../redux/slice/pageTitleSlice';
import orderReducer from '../redux/slice/orderSlice';
import categoryReducer from '../redux/slice/categorySlice';
import bestSellingReducer from '../redux/slice/product/bestSellingSlice';
import toastReducer from '../redux/slice/toastSlice';
import {getFaqs, getSite, getSitePage} from '../services/siteService';
import {getOrder} from '../services/orderService';
import {getAllCategories} from '../services/categoryService';
import {getBestSellingProducts} from '../services/productService';
import usePageTitle from '../hooks/usePageTitle';
import {documentTitle, siteTitle} from '../utils/pageTitle';
import {Layout} from '../components/layout';
import NotFound from '../pages/NotFound';
import FAQPage from '../pages/others/FAQPage';
import StaticPage from '../pages/others/StaticPage';
import OrderDetail from '../pages/OrderDetail';

vi.setConfig({testTimeout: 15000});

vi.mock('../services/siteService', () => ({getSite: vi.fn(), getSitePage: vi.fn(), getFaqs: vi.fn(), sendContactMessage: vi.fn(), subscribeToNewsletter: vi.fn()}));
vi.mock('../services/orderService', () => ({getOrders: vi.fn(), getOrder: vi.fn(), cancelOrder: vi.fn(), trackOrder: vi.fn()}));
// the not-found page draws the categories and the best sellers
vi.mock('../services/categoryService', () => ({getAllCategories: vi.fn()}));
vi.mock('../services/productService', () => ({getBestSellingProducts: vi.fn()}));
// Layout draws the whole shell; only the title matters here
vi.mock('../components/layout/NavBar', () => ({default: () => <nav>nav</nav>}));
vi.mock('../components/common/BackToTop', () => ({default: () => null}));
vi.mock('../components/common/BottomNav', () => ({default: () => null}));

const SITE = {name: 'GoCart', tagline: 'Everyday things', logo: null, contact: {email: '', phone: '', address: '', opening_hours: '', map_url: ''}};

const makeStore = () => configureStore({
  reducer: {site: siteReducer, auth: authReducer, pageTitle: pageTitleReducer, order: orderReducer, toast: toastReducer, category: categoryReducer, best_selling: bestSellingReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

// A page that names itself, and one that does not
const Named = ({title}) => { usePageTitle(title); return <p>named page</p>; };
const Plain = () => <p>plain page</p>;

const renderShop = (url = '/named', {title = 'Red Mug'} = {}) => {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Layout>
          <Link to="/plain">go plain</Link>
          <Link to="/named">go named</Link>
          <Routes>
            <Route path="/named" element={<Named title={title} />} />
            <Route path="/plain" element={<Plain />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/pages/:slug" element={<StaticPage />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
          </Routes>
        </Layout>
      </MemoryRouter>
    </Provider>
  );
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.title = 'GoCart';
  getSite.mockResolvedValue({data: {data: {site: SITE}}});
  getFaqs.mockResolvedValue({data: {data: {faqs: []}}});
  getAllCategories.mockResolvedValue({data: {data: {results: []}}});
  getBestSellingProducts.mockResolvedValue({data: {data: {results: [], next: null}}});
});
afterEach(() => {
  document.title = 'GoCart';
});

describe('The words of a title', () => {
  it('is the shop\'s name, with its tagline when it has one, and nothing before the shop is known', () => {
    expect(siteTitle({name: 'GoCart', tagline: 'Everyday things'})).toBe('GoCart | Everyday things');
    expect(siteTitle({name: 'GoCart', tagline: ''})).toBe('GoCart');
    expect(siteTitle({name: '', tagline: 'x'})).toBe('');
    expect(siteTitle()).toBe('');
  });

  it('puts the page before the shop, and the shop\'s own title on a page with no name', () => {
    expect(documentTitle({page: 'Red Mug', name: 'GoCart', tagline: 'Everyday things'})).toBe('Red Mug | GoCart');
    expect(documentTitle({page: '', name: 'GoCart', tagline: 'Everyday things'})).toBe('GoCart | Everyday things');
    expect(documentTitle({page: undefined, name: 'GoCart'})).toBe('GoCart');
  });

  it('says only the page before the shop is known, and nothing when there is nothing to say', () => {
    expect(documentTitle({page: 'Cart', name: ''})).toBe('Cart');
    expect(documentTitle({page: '  ', name: ''})).toBe('');
    expect(documentTitle({page: 12, name: 'GoCart'})).toBe('GoCart'); // not a name
  });
});

describe('The page title in the store', () => {
  it('holds the name, and turns anything that is not a sentence into none', () => {
    const store = makeStore();
    expect(selectPageTitle(store.getState())).toBe('');
    store.dispatch(setPageTitle('Cart'));
    expect(selectPageTitle(store.getState())).toBe('Cart');
    store.dispatch(setPageTitle(undefined));
    expect(selectPageTitle(store.getState())).toBe('');
  });

  it('is simply empty in a store that has no such slice (the pages still work)', () => {
    expect(selectPageTitle({})).toBe('');
  });
});

describe('The browser tab', () => {
  it('says the page, then the shop', async () => {
    renderShop();
    await waitFor(() => expect(document.title).toBe('Red Mug | GoCart'));
  });

  it('says only the page until the shop has answered, and then both', async () => {
    getSite.mockReturnValue(new Promise(() => {}));
    const {store} = renderShop('/named', {title: 'Cart'});
    await waitFor(() => expect(document.title).toBe('Cart'));
    getSite.mockResolvedValue({data: {data: {site: SITE}}});

    await act(async () => { await store.dispatch(handleFetchSite()); });

    expect(document.title).toBe('Cart | GoCart');
  });

  it('goes back to the shop\'s own title on a page with no name, and takes the next page\'s name', async () => {
    renderShop();
    await waitFor(() => expect(document.title).toBe('Red Mug | GoCart'));

    await act(async () => { screen.getByText('go plain').click(); });
    await waitFor(() => expect(document.title).toBe('GoCart | Everyday things'));

    await act(async () => { screen.getByText('go named').click(); });
    await waitFor(() => expect(document.title).toBe('Red Mug | GoCart'));
  });

  it('follows a name that changes (a product that has just arrived), and keeps the shop\'s title while it has none', async () => {
    const {store} = renderShop('/named', {title: ''});
    await waitFor(() => expect(document.title).toBe('GoCart | Everyday things'));

    await act(async () => { store.dispatch(setPageTitle('Blue Kettle')); });
    expect(document.title).toBe('Blue Kettle | GoCart');
  });

  it('leaves the title the HTML came with alone while there is nothing to say', async () => {
    getSite.mockReturnValue(new Promise(() => {}));
    document.title = 'Untouched';
    renderShop('/plain');
    await screen.findByText('plain page');
    expect(document.title).toBe('Untouched');
  });
});

describe('The pages that name themselves', () => {
  it('names the not-found page', async () => {
    renderShop('/not-found');
    await waitFor(() => expect(document.title).toBe('Page not found | GoCart'));
  });

  it('names the FAQ page', async () => {
    renderShop('/faq');
    await waitFor(() => expect(document.title).toBe('FAQ | GoCart'));
  });

  it('takes a page the admin wrote by its own title, and says "not found" for one that does not exist', async () => {
    getSitePage.mockResolvedValue({data: {data: {page: {slug: 'about-us', title: 'About Us', body: '<p>hi</p>', updated_at: ''}}}});
    renderShop('/pages/about-us');
    await waitFor(() => expect(document.title).toBe('About Us | GoCart'));
    cleanup();

    getSitePage.mockRejectedValue({response: {status: 404, data: {success: false, errors: ['x']}}});
    renderShop('/pages/nope');
    await waitFor(() => expect(document.title).toBe('Page not found | GoCart'));
  });

  it('names an order by its number', async () => {
    getOrder.mockReturnValue(new Promise(() => {}));
    renderShop('/orders/GC-20260923-0001');
    await waitFor(() => expect(document.title).toBe('Order GC-20260923-0001 | GoCart'));
  });
});
