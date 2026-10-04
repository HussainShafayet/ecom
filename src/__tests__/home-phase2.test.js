// The homepage's second round: where a slide/banner leads (ContentLink, incl. another website), prices in taka, the hero
// (slides with a headline, video only on a computer), the category strip, and "Load more" on All Products.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import contentReducer from '../redux/slice/contentSlice';
import categoryReducer from '../redux/slice/categorySlice';
import productReducer from '../redux/slice/productSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import cartReducer from '../redux/slice/cartSlice';
import authReducer from '../redux/slice/authSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import useMediaQuery from '../hooks/useMediaQuery';
import {discountLabel, formatPrice} from '../utils/formatPrice';
import {resolveContentLink} from '../components/common/ContentLink';
import {ContentLink, Slider} from '../components/common';
import {AllProducts, CategoryStrip, HeroSection} from '../components/sections';
import {getHomeContent} from '../services/contentService';
import {getAllCategories} from '../services/categoryService';
import {getAllProducts} from '../services/productService';

vi.mock('../services/contentService', async (importOriginal) => ({...(await importOriginal()), getHomeContent: vi.fn()}));
vi.mock('../services/categoryService', async (importOriginal) => ({...(await importOriginal()), getAllCategories: vi.fn()}));
vi.mock('../services/productService', async (importOriginal) => ({...(await importOriginal()), getAllProducts: vi.fn()}));

// Swiper needs a real browser; what matters here is what it is given
const swiperProps = [];
vi.mock('swiper/react', () => ({
  Swiper: (props) => {
    swiperProps.push(props);
    return <div data-testid="swiper">{props.children}</div>;
  },
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

// A matchMedia whose answers the test chooses: `queries` maps a media query to whether it matches
const stubMatchMedia = (queries = {}) => {
  window.matchMedia = vi.fn((query) => ({
    matches: Boolean(queries[query]), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
};
const DESKTOP = {'(min-width: 1024px)': true};

const SLIDE = (order, extra = {}) => ({order, type: 'product', link: `product-${order}`, external_link: '', media: `/slide-${order}.jpg`, media_type: 'image', caption: '', ...extra});
const VIDEO = (order, extra = {}) => ({order, type: 'category', link: `cat-${order}`, external_link: '', media: `/video-${order}.mp4`, media_type: 'video', caption: `Video ${order}`, ...extra});
const PRODUCT = (id) => ({
  id, name: `Product ${id}`, slug: `product-${id}`, image: '', base_price: 100 * id, has_discount: false,
  availability_status: true, has_variants: false, variant_id: id, avg_rating: 0, total_reviews: 0,
});
const CATEGORY = (id, extra = {}) => ({id, name: `Category ${id}`, slug: `category-${id}`, image: '', has_discount: false, ...extra});

const makeStore = () => configureStore({
  reducer: {
    content: contentReducer, category: categoryReducer, product: productReducer, globalError: globalErrorReducer,
    cart: cartReducer, auth: authReducer, wishList: wishListReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderWithStore = (ui) => render(<Provider store={makeStore()}><MemoryRouter>{ui}</MemoryRouter></Provider>);
const homeContent = (page_content) => ({data: {data: {page_content}}});

beforeEach(() => {
  swiperProps.length = 0;
  stubMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  delete window.matchMedia;
});

describe('Where a slide or banner leads', () => {
  it('is a product page, a category, or another website, and nowhere for anything else', () => {
    expect(resolveContentLink({type: 'product', link: 'kettle'})).toEqual({to: '/products/detail/kettle'});
    expect(resolveContentLink({type: 'category', link: 'men'})).toEqual({to: '/products/?category=men'});
    expect(resolveContentLink({type: 'external', external_link: 'https://example.com/sale'})).toEqual({href: 'https://example.com/sale'});
    expect(resolveContentLink({type: 'external', external_link: 'javascript:alert(1)'})).toBeNull();
    expect(resolveContentLink({type: 'product', link: ''})).toBeNull();
    expect(resolveContentLink(null)).toBeNull();
  });

  it('stays in this tab for the shop\'s own pages and opens another website in a new one', () => {
    renderWithStore(
      <>
        <ContentLink item={{type: 'product', link: 'kettle'}}>Own page</ContentLink>
        <ContentLink item={{type: 'external', external_link: 'https://example.com/sale'}}>Other site</ContentLink>
      </>
    );
    const own = screen.getByText('Own page').closest('a');
    expect(own.getAttribute('href')).toBe('/products/detail/kettle');
    expect(own.getAttribute('target')).toBeNull();
    const other = screen.getByText('Other site').closest('a');
    expect(other.getAttribute('href')).toBe('https://example.com/sale');
    expect(other.getAttribute('target')).toBe('_blank');
    expect(other.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('draws the content without a link when it leads nowhere', () => {
    renderWithStore(<ContentLink item={{type: 'external', external_link: 'javascript:alert(1)'}}>Just a picture</ContentLink>);
    expect(screen.getByText('Just a picture').closest('a')).toBeNull();
  });
});

describe('Prices in taka', () => {
  it('writes whole amounts without decimals and any other amount with two, with thousands separated', () => {
    expect(formatPrice(129)).toBe('৳129');
    expect(formatPrice(3579)).toBe('৳3,579');
    expect(formatPrice(881.1)).toBe('৳881.10');
    expect(formatPrice('1200')).toBe('৳1,200');
    expect(formatPrice(undefined)).toBe('');
    expect(formatPrice(null)).toBe('');
  });

  it('words a discount as a percentage or as an amount', () => {
    expect(discountLabel(25, 'percentage')).toBe('25% OFF');
    expect(discountLabel(150, 'fixed')).toBe('৳150 OFF');
  });
});

describe('useMediaQuery', () => {
  const Probe = () => <p>{useMediaQuery('(min-width: 1024px)') ? 'computer' : 'phone'}</p>;

  it('follows the query, and is a phone where the browser cannot tell', () => {
    delete window.matchMedia;
    const {unmount} = render(<Probe />);
    expect(screen.getByText('phone')).toBeTruthy();
    unmount();

    stubMatchMedia(DESKTOP);
    render(<Probe />);
    expect(screen.getByText('computer')).toBeTruthy();
  });
});

describe('The hero slider', () => {
  it('shows each slide as one link, with its caption as the headline over a Shop Now button', () => {
    renderWithStore(<Slider image_sliders={[SLIDE(1, {caption: 'Big Sale'}), SLIDE(2), SLIDE(3, {type: 'external', external_link: 'https://example.com'})]} />);

    expect(screen.getByAltText('Big Sale').closest('a').getAttribute('href')).toBe('/products/detail/product-1');
    expect(screen.getByText('Big Sale')).toBeTruthy();
    expect(screen.getAllByText('Shop Now')).toHaveLength(1); // only the slide that has a headline
    expect(screen.getAllByAltText('Promotion')).toHaveLength(2); // and a real alt text, not "Slide"
    expect(screen.getAllByAltText('Promotion')[1].closest('a').getAttribute('target')).toBe('_blank');
  });

  it('changes by itself every 5 seconds, stops while the pointer is over it, and loops', () => {
    renderWithStore(<Slider image_sliders={[SLIDE(1), SLIDE(2)]} />);
    expect(swiperProps.at(-1).autoplay).toEqual({delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false});
    expect(swiperProps.at(-1).loop).toBe(true);
    expect(screen.getByLabelText('Previous slide')).toBeTruthy();
    expect(screen.getByLabelText('Next slide')).toBeTruthy();
  });

  it('has nothing to change and no arrows with a single slide, and no autoplay for someone who asked for less motion', () => {
    renderWithStore(<Slider image_sliders={[SLIDE(1)]} />);
    expect(swiperProps.at(-1).autoplay).toBe(false);
    expect(swiperProps.at(-1).loop).toBe(false);
    expect(screen.queryByLabelText('Next slide')).toBeNull();
    cleanup();

    stubMatchMedia({'(prefers-reduced-motion: reduce)': true});
    renderWithStore(<Slider image_sliders={[SLIDE(1), SLIDE(2)]} />);
    expect(swiperProps.at(-1).autoplay).toBe(false);
  });

  it('draws nothing without slides', () => {
    const {container} = renderWithStore(<Slider image_sliders={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('The hero', () => {
  const CONTENT = {
    image_sliders: [SLIDE(1, {caption: 'Big Sale'})],
    video_sliders: [VIDEO(1), VIDEO(2)],
    left_banner: {order: 1, type: 'product', link: 'kettle', external_link: '', media: '/left.jpg', media_type: 'image', caption: 'Kettle'},
    right_banner: {order: 1, type: 'external', link: null, external_link: 'https://example.com/promo', media: '/right.jpg', media_type: 'image', caption: 'Promo'},
  };

  it('on a phone: the slider and the two tiles, each leading where the admin chose, and the video only as a Play tile', async () => {
    getHomeContent.mockResolvedValue(homeContent(CONTENT));
    const {container} = renderWithStore(<HeroSection />);

    expect(await screen.findByAltText('Big Sale')).toBeTruthy();
    expect(screen.getByAltText('Kettle').closest('a').getAttribute('href')).toBe('/products/detail/kettle');
    const promo = screen.getByAltText('Promo').closest('a'); // this one used to point at /products/detail/null
    expect(promo.getAttribute('href')).toBe('https://example.com/promo');
    expect(promo.getAttribute('target')).toBe('_blank');
    expect(container.querySelector('video')).toBeNull(); // the file is not even asked for over mobile data until a tap
    expect(screen.getByRole('button', {name: 'Play video: Video 1'})).toBeTruthy();
  });

  it('on a phone: a tap on Play loads the video and plays it with sound, once; the next video goes back to its Play tile', async () => {
    getHomeContent.mockResolvedValue(homeContent(CONTENT));
    const {container} = renderWithStore(<HeroSection />);
    fireEvent.click(await screen.findByRole('button', {name: 'Play video: Video 1'}));

    const video = container.querySelector('video');
    expect(video.getAttribute('src')).toBe('/video-1.mp4');
    expect(video.hasAttribute('controls')).toBe(true);
    expect(video.muted).toBe(false); // a tap is a gesture, so sound is allowed
    expect(video.loop).toBe(false);
    expect(screen.queryByRole('button', {name: /^Play video/})).toBeNull();

    fireEvent.click(screen.getByLabelText('Next video'));
    expect(container.querySelector('video')).toBeNull(); // nothing downloaded that was not asked for
    fireEvent.click(screen.getByRole('button', {name: 'Play video: Video 2'}));
    expect(container.querySelector('video').getAttribute('src')).toBe('/video-2.mp4');
  });

  it('on a phone: the promo tiles come before the video, and the arrows are there without hovering', async () => {
    getHomeContent.mockResolvedValue(homeContent(CONTENT));
    renderWithStore(<HeroSection />);
    const play = await screen.findByRole('button', {name: 'Play video: Video 1'});
    const tiles = screen.getByAltText('Kettle').closest('.grid');
    expect(tiles.classList.contains('order-1')).toBe(true);
    expect(play.parentElement.classList.contains('order-2')).toBe(true);
    expect(screen.getByLabelText('Next video').className).not.toMatch(/(^|\s)opacity-0/); // hidden until hover only from a computer (lg:)
  });

  it('on a phone: a single video has no arrows, and a video with no caption says only "Play video"', async () => {
    getHomeContent.mockResolvedValue(homeContent({...CONTENT, video_sliders: [VIDEO(1, {caption: ''})]}));
    renderWithStore(<HeroSection />);
    expect(await screen.findByRole('button', {name: 'Play video'})).toBeTruthy();
    expect(screen.queryByLabelText('Next video')).toBeNull();
  });

  it('is one column that cannot grow with its content on a phone (Swiper stretched an "auto" column past 33 million px)', async () => {
    getHomeContent.mockResolvedValue(homeContent(CONTENT));
    renderWithStore(<HeroSection />);

    const grid = (await screen.findByAltText('Big Sale')).closest('.grid');
    expect(grid.classList.contains('grid-cols-1')).toBe(true); // minmax(0, 1fr): as wide as the page, whatever the slides want
    expect(grid.classList.contains('lg:grid-cols-3')).toBe(true); // and from a computer the 2/3 + 1/3 row
  });

  it('on a computer: the video too, which you can page through', async () => {
    stubMatchMedia(DESKTOP);
    getHomeContent.mockResolvedValue(homeContent(CONTENT));
    const {container} = renderWithStore(<HeroSection />);

    await waitFor(() => expect(container.querySelector('video')).toBeTruthy());
    expect(container.querySelector('video').getAttribute('src')).toBe('/video-1.mp4');
    expect(container.querySelector('video').muted).toBe(true); // plays at once, so it must be silent
    expect(container.querySelector('video').loop).toBe(true);
    expect(screen.queryByRole('button', {name: /^Play video/})).toBeNull(); // no Play tile
    expect(screen.getByText('Video 1').closest('a').getAttribute('href')).toBe('/products/?category=cat-1');

    fireEvent.click(screen.getByLabelText('Next video'));
    expect(container.querySelector('video').getAttribute('src')).toBe('/video-2.mp4');
    fireEvent.click(screen.getByLabelText('Next video')); // and round again
    expect(container.querySelector('video').getAttribute('src')).toBe('/video-1.mp4');
  });

  it('draws a tile that is a video only on a computer', async () => {
    getHomeContent.mockResolvedValue(homeContent({...CONTENT, video_sliders: [], right_banner: {...CONTENT.right_banner, media: '/promo.mp4', media_type: 'video'}}));
    const phone = renderWithStore(<HeroSection />);
    await screen.findByAltText('Kettle');
    expect(phone.container.querySelector('video')).toBeNull();
    expect(screen.queryByAltText('Promo')).toBeNull(); // (a video is not a picture)
    cleanup();

    stubMatchMedia(DESKTOP);
    const computer = renderWithStore(<HeroSection />);
    await waitFor(() => expect(computer.container.querySelector('video')).toBeTruthy());
    expect(computer.container.querySelector('video').getAttribute('src')).toBe('/promo.mp4');
  });

  it('draws nothing when the admin has put nothing in it', async () => {
    getHomeContent.mockResolvedValue(homeContent({image_sliders: [], video_sliders: [], left_banner: null, right_banner: null}));
    const {container} = renderWithStore(<HeroSection />);
    await waitFor(() => expect(getHomeContent).toHaveBeenCalled());
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });
});

describe('The category strip', () => {
  const results = (categories) => ({data: {data: {results: categories}}});

  it('is one tap into any category: a round picture and a name each, then All', async () => {
    getAllCategories.mockResolvedValue(results([CATEGORY(1, {name: 'Electronics'}), CATEGORY(2, {name: 'Fashion', image: '/fashion.jpg'})]));
    const {container} = renderWithStore(<CategoryStrip />);

    const electronics = await screen.findByText('Electronics');
    expect(electronics.closest('a').getAttribute('href')).toBe('/products/?category=category-1');
    expect(screen.getByText('Fashion').closest('a').getAttribute('href')).toBe('/products/?category=category-2');
    expect(screen.getByText('All').closest('a').getAttribute('href')).toBe('/categories');
    expect(screen.getByRole('navigation', {name: 'Shop by category'})).toBeTruthy();
    expect(container.querySelectorAll('img')).toHaveLength(2); // (the name is the label; the picture is decoration)
  });

  it('draws nothing without categories', async () => {
    getAllCategories.mockResolvedValue(results([]));
    const {container} = renderWithStore(<CategoryStrip />);
    await waitFor(() => expect(getAllCategories).toHaveBeenCalled());
    await waitFor(() => expect(container.querySelector('nav')).toBeNull());
  });

  it('carries a small pill on a category that has a discount, and none on the others', async () => {
    getAllCategories.mockResolvedValue(results([
      CATEGORY(1, {name: 'Electronics', has_discount: true, discount_amount: 10, discount_type: 'percentage'}),
      CATEGORY(2, {name: 'Fashion', has_discount: true, discount_amount: 150, discount_type: 'fixed'}),
      CATEGORY(3, {name: 'Books'}),
    ]));
    renderWithStore(<CategoryStrip />);

    expect(await screen.findByText('10% OFF')).toBeTruthy();
    expect(screen.getByText('৳150 OFF')).toBeTruthy();
    expect(screen.getAllByText(/OFF/)).toHaveLength(2);
  });

  it('asks for twelve categories, once; the rest are behind All', async () => {
    getAllCategories.mockResolvedValue(results(Array.from({length: 12}, (_, index) => CATEGORY(index + 1))));
    renderWithStore(<CategoryStrip />);

    expect(await screen.findByText('Category 12')).toBeTruthy();
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllCategories).toHaveBeenCalledWith(12, 1);
  });
});

describe('All Products on the homepage', () => {
  const page = (products, next = null) => ({data: {data: {results: products, next}}});

  it('adds the next page under the first when asked, and offers no more when there is none', async () => {
    getAllProducts.mockResolvedValueOnce(page([PRODUCT(1), PRODUCT(2)], 'https://api.example/products?page=2'));
    getAllProducts.mockResolvedValueOnce(page([PRODUCT(3)], null));
    renderWithStore(<AllProducts />);

    expect(await screen.findByText('Product 1')).toBeTruthy();
    fireEvent.click(screen.getByText('Load more'));

    expect(await screen.findByText('Product 3')).toBeTruthy();
    expect(screen.getByText('Product 1')).toBeTruthy(); // the first page stayed
    expect(getAllProducts.mock.calls[1][2]).toBe(2); // page 2
    expect(screen.queryByText('Load more')).toBeNull(); // that was the last page
  });

  it('keeps the products on screen while the next page is on its way', async () => {
    let answer;
    getAllProducts.mockResolvedValueOnce(page([PRODUCT(1)], 'next'));
    getAllProducts.mockReturnValueOnce(new Promise((resolve) => { answer = resolve; }));
    renderWithStore(<AllProducts />);
    await screen.findByText('Product 1');

    fireEvent.click(screen.getByText('Load more'));

    const busy = await screen.findByText('Loading...');
    expect(busy.closest('button').disabled).toBe(true);
    expect(screen.getByText('Product 1')).toBeTruthy(); // not swapped for a skeleton
    await act(async () => { answer(page([PRODUCT(2)], null)); });
    expect(await screen.findByText('Product 2')).toBeTruthy();
  });

  it('says so under the products, keeping them, when the next page fails, and lets them try again', async () => {
    getAllProducts.mockResolvedValueOnce(page([PRODUCT(1)], 'next'));
    getAllProducts.mockRejectedValueOnce(new Error('Network Error'));
    getAllProducts.mockResolvedValueOnce(page([PRODUCT(2)], null));
    renderWithStore(<AllProducts />);
    await screen.findByText('Product 1');

    fireEvent.click(screen.getByText('Load more'));

    expect((await screen.findByRole('alert')).textContent).toContain("couldn't load more");
    expect(screen.getByText('Product 1')).toBeTruthy();
    fireEvent.click(screen.getByText('Load more')); // the same button tries again, for the same page
    expect(await screen.findByText('Product 2')).toBeTruthy();
    expect(getAllProducts.mock.calls[2][2]).toBe(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
