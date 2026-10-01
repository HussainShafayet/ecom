// The shop's identity and the pages an admin writes: the site slice, the announcement bar, the trust badge strip, the footer (newsletter,
// social links, footer pages), the contact page, a static page and the FAQ. The backend's answers are the shapes in
// backend docs/API_CONTRACT.md section 9 (services/siteService is mocked).
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Link, MemoryRouter, Navigate, Route, Routes} from 'react-router-dom';

import siteReducer, {EMPTY_SITE, handleFetchSite} from '../redux/slice/siteSlice';
import authReducer from '../redux/slice/authSlice';
import {getFaqs, getSite, getSitePage, sendContactMessage, subscribeToNewsletter} from '../services/siteService';
import {AnnouncementBar, Footer, Layout, TrustBadgeBar} from '../components/layout';
import {SocialLinks} from '../components/common';
import Contact from '../pages/others/Contact';
import StaticPage from '../pages/others/StaticPage';
import FAQPage from '../pages/others/FAQPage';
import {errorMessages} from '../utils/errorMessages';

vi.mock('../services/siteService', () => ({
  getSite: vi.fn(),
  getSitePage: vi.fn(),
  getFaqs: vi.fn(),
  sendContactMessage: vi.fn(),
  subscribeToNewsletter: vi.fn(),
}));
// Layout draws the whole shell; only the parts under test matter here
vi.mock('../components/layout/NavBar', () => ({default: () => <nav>nav</nav>}));
vi.mock('../components/common/BackToTop', () => ({default: () => null}));
vi.mock('../components/common/BottomNav', () => ({default: () => null}));

const SITE = {
  name: 'GoCart',
  tagline: 'Everyday things',
  logo: null,
  announcement: {text: 'Flash Sale! Up to 50% Off', link: '/products/flash-sale'},
  contact: {
    email: 'support@gocart.example', phone: '+880 1700-000000', address: 'House 12, Dhaka',
    opening_hours: 'Sat - Thu: 10 AM - 8 PM', map_url: 'https://www.openstreetmap.org/export/embed.html?bbox=1%2C2%2C3%2C4',
  },
  social_links: [
    {platform: 'facebook', url: 'https://facebook.com/gocart'},
    {platform: 'instagram', url: 'https://instagram.com/gocart'},
  ],
  trust_badges: [
    {icon: 'delivery', title: 'Free delivery', subtitle: 'Orders over 1000'},
    {icon: 'returns', title: 'Easy returns', subtitle: ''},
  ],
  footer_pages: {
    company: [{slug: 'about-us', title: 'About Us'}],
    service: [{slug: 'shipping', title: 'Shipping'}],
    legal: [{slug: 'privacy-policy', title: 'Privacy Policy'}, {slug: 'terms-of-service', title: 'Terms of Service'}],
  },
};
const failure = (errors, status = 400) => ({response: {status, data: {success: false, errors}}});

const makeStore = (site = SITE, signedIn = false) => {
  const store = configureStore({
    reducer: {site: siteReducer, auth: authReducer},
    preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: signedIn}},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
  });
  if (site) {
    getSite.mockResolvedValue({data: {data: {site}}});
  }
  return store;
};

const renderPage = (ui, {url = '/', site = SITE, load = true, routes} = {}) => {
  const store = makeStore(site);
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>{routes || ui}</MemoryRouter>
    </Provider>
  );
  return {store, ...utils, ready: load ? store.dispatch(handleFetchSite()) : Promise.resolve()};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.title = 'GoCart';
});

describe('the site slice', () => {
  it('starts empty, so nothing is drawn for what the shop has not said', () => {
    const state = siteReducer(undefined, {type: '@@init'});
    expect(state.site).toEqual(EMPTY_SITE);
    expect(state.isLoaded).toBe(false);
  });

  it('keeps what the backend sent and fills any missing part with the empty value', async () => {
    const store = makeStore({name: 'Bare', contact: {email: 'a@b.co'}});
    await store.dispatch(handleFetchSite());
    const {site, isLoaded} = store.getState().site;
    expect(isLoaded).toBe(true);
    expect(site.name).toBe('Bare');
    expect(site.contact).toEqual({...EMPTY_SITE.contact, email: 'a@b.co'});
    expect(site.footer_pages).toEqual({company: [], service: [], legal: []});
    expect(site.social_links).toEqual([]);
    expect(site.trust_badges).toEqual([]);
    expect(site.announcement).toBeNull();
  });

  it('keeps the empty site and says why when the backend does not answer', async () => {
    getSite.mockRejectedValue({response: {data: {error: 'Server error'}}});
    const store = makeStore(null);
    await store.dispatch(handleFetchSite());
    expect(store.getState().site.site).toEqual(EMPTY_SITE);
    expect(store.getState().site.isLoaded).toBe(false);
    expect(store.getState().site.error).toBe('Server error');
  });
});

describe('the announcement bar and its end', () => {
  // The admin may set a moment after which the bar goes; the backend says how many seconds are left (measured by ITS clock), the slice
  // turns them into a moment on this device's clock, and the bar takes itself away then, without asking the shop again.
  const NOW = new Date('2026-10-01T10:00:00Z');
  const DAY = 24 * 60 * 60 * 1000;
  const sale = (seconds) => ({...SITE, announcement: {text: 'Flash Sale!', link: null, ends_in_seconds: seconds}});
  const draw = async (site) => {
    const utils = renderPage(<AnnouncementBar />, {site});
    await act(async () => { await utils.ready; });
    return utils;
  };
  const after = async (ms) => { await act(async () => { vi.advanceTimersByTime(ms); }); };

  beforeEach(() => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
    vi.setSystemTime(NOW);
    Object.defineProperty(document, 'visibilityState', {value: 'visible', configurable: true});
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('turns the seconds left into a moment on this clock, and keeps no end as no end', async () => {
    const {store} = await draw(sale(3600));
    expect(store.getState().site.site.announcement).toEqual({text: 'Flash Sale!', link: null, endsAt: NOW.getTime() + 3600 * 1000});

    const open = await draw(sale(null));
    expect(open.store.getState().site.site.announcement).toEqual({text: 'Flash Sale!', link: null, endsAt: null});

    const none = await draw({...SITE, announcement: null});
    expect(none.store.getState().site.site.announcement).toBeNull();
  });

  it('shows the bar while there is time left and takes it away when the moment comes, without asking the shop again', async () => {
    await draw(sale(60));
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
    await after(59 * 1000);
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
    await after(1000);
    expect(screen.queryByText('Flash Sale!')).toBeNull();
    expect(getSite).toHaveBeenCalledTimes(1);
  });

  it('draws nothing for a bar that has no time left at all', async () => {
    const {container} = await draw(sale(0));
    expect(container.innerHTML).toBe('');
  });

  it('keeps a bar with no end, however long the page stays open', async () => {
    await draw(sale(null));
    await after(400 * DAY);
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
  });

  it('is right again the moment a sleeping tab wakes (a phone with the screen off), even though no timer fired', async () => {
    await draw(sale(3600));
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
    vi.setSystemTime(new Date(NOW.getTime() + 2 * 3600 * 1000)); // two hours pass; the clock moved, the timer did not fire
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(screen.queryByText('Flash Sale!')).toBeNull();
  });

  it('waits for an end further away than one timer can wait (about 24.8 days), and does not hide the bar at once', async () => {
    await draw(sale(40 * 24 * 60 * 60));
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
    await after(39 * DAY);
    expect(screen.getByText('Flash Sale!')).toBeTruthy();
    await after(DAY + 1000);
    expect(screen.queryByText('Flash Sale!')).toBeNull();
  });
});

describe('the announcement bar', () => {
  it('shows the text as a link to a page of the shop', async () => {
    const {ready} = renderPage(<AnnouncementBar />);
    await ready;
    const link = await screen.findByText('Flash Sale! Up to 50% Off');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/products/flash-sale');
  });

  it('opens another website in a new tab, safely', async () => {
    const {ready} = renderPage(<AnnouncementBar />, {site: {...SITE, announcement: {text: 'Visit', link: 'https://example.com/x'}}});
    await ready;
    const link = await screen.findByText('Visit');
    expect(link.getAttribute('href')).toBe('https://example.com/x');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('is plain text without a link, and never a link to anything that is not a shop page or http(s)', async () => {
    const {ready, unmount} = renderPage(<AnnouncementBar />, {site: {...SITE, announcement: {text: 'Closed Friday', link: null}}});
    await ready;
    expect((await screen.findByText('Closed Friday')).tagName).not.toBe('A');
    unmount();
    const second = renderPage(<AnnouncementBar />, {site: {...SITE, announcement: {text: 'Odd', link: 'javascript:alert(1)'}}});
    await second.ready;
    expect((await screen.findByText('Odd')).tagName).not.toBe('A');
  });

  it('draws nothing when there is no announcement, or one without a text', async () => {
    const {ready, container, unmount} = renderPage(<AnnouncementBar />, {site: {...SITE, announcement: null}});
    await ready;
    expect(container.textContent).toBe('');
    unmount();
    const second = renderPage(<AnnouncementBar />, {site: {...SITE, announcement: {text: '', link: '/products/flash-sale'}}});
    await second.ready;
    expect(second.container.innerHTML).toBe('');
  });
});

describe('the trust badge strip', () => {
  it('draws each badge with its title, and its subtitle when it has one', async () => {
    const {ready} = renderPage(<TrustBadgeBar />);
    await ready;
    expect(await screen.findByText('Free delivery')).toBeTruthy();
    expect(screen.getByText('Orders over 1000')).toBeTruthy();
    expect(screen.getByText('Easy returns')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByLabelText('Why shop with us')).toBeTruthy();
  });

  it('still shows the words of a badge whose icon it does not know', async () => {
    const {ready, container} = renderPage(<TrustBadgeBar />, {site: {...SITE, trust_badges: [{icon: 'gift_wrap', title: 'Gift wrap', subtitle: ''}]}});
    await ready;
    expect(await screen.findByText('Gift wrap')).toBeTruthy();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('draws nothing without badges, or when the backend does not send the field', async () => {
    const {ready, container, unmount} = renderPage(<TrustBadgeBar />, {site: {...SITE, trust_badges: []}});
    await ready;
    expect(container.innerHTML).toBe('');
    unmount();
    const withoutField = {...SITE};
    delete withoutField.trust_badges;
    const second = renderPage(<TrustBadgeBar />, {site: withoutField});
    await second.ready;
    expect(second.container.innerHTML).toBe('');
  });
});

describe('the footer', () => {
  it('names the shop, lists the admin pages in their groups and the social accounts', async () => {
    const {ready} = renderPage(<Footer />);
    await ready;
    expect(await screen.findByText(/© \d{4} GoCart\. All rights reserved\./)).toBeTruthy();
    expect(screen.getByText('About Us').getAttribute('href')).toBe('/pages/about-us');
    expect(screen.getByText('Shipping').getAttribute('href')).toBe('/pages/shipping');
    expect(screen.getByText('Privacy Policy').getAttribute('href')).toBe('/pages/privacy-policy');
    expect(screen.getByText('Terms of Service').getAttribute('href')).toBe('/pages/terms-of-service');
    expect(screen.getByLabelText('Facebook').getAttribute('href')).toBe('https://facebook.com/gocart');
    expect(screen.getByLabelText('Instagram').getAttribute('href')).toBe('https://instagram.com/gocart');
    expect(screen.queryByLabelText('YouTube')).toBeNull();
    expect(screen.getByText('Everyday things')).toBeTruthy();
  });

  it('keeps its own links and hides what the admin has not set', async () => {
    const {ready} = renderPage(<Footer />, {site: EMPTY_SITE});
    await ready;
    expect(screen.getByText('Contact Us').getAttribute('href')).toBe('/contact');
    expect(screen.getByText('FAQ').getAttribute('href')).toBe('/faq');
    expect(screen.queryByText(/All rights reserved/)).toBeNull();
    expect(screen.queryByText('Privacy Policy')).toBeNull();
  });

  it('subscribes an address to the newsletter and shows the backend sentence', async () => {
    subscribeToNewsletter.mockResolvedValue({data: {success: true, message: 'Thank you for subscribing.', data: null}});
    renderPage(<Footer />, {load: false});
    fireEvent.change(screen.getByLabelText('Your email address'), {target: {value: ' rahim@example.com '}});
    fireEvent.click(screen.getByLabelText('Subscribe'));
    expect(await screen.findByText('Thank you for subscribing.')).toBeTruthy();
    expect(subscribeToNewsletter).toHaveBeenCalledWith('rahim@example.com');
    expect(screen.getByLabelText('Your email address').value).toBe('');
  });

  it('shows why a subscription was refused, and lets the visitor try again', async () => {
    subscribeToNewsletter.mockRejectedValueOnce(failure(['Enter a valid email address.']));
    renderPage(<Footer />, {load: false});
    fireEvent.change(screen.getByLabelText('Your email address'), {target: {value: 'a@b.co'}});
    fireEvent.click(screen.getByLabelText('Subscribe'));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter a valid email address.');
    expect(screen.getByLabelText('Your email address').value).toBe('a@b.co'); // kept, to correct it
    subscribeToNewsletter.mockResolvedValueOnce({data: {message: 'Thank you for subscribing.'}});
    fireEvent.click(screen.getByLabelText('Subscribe'));
    expect(await screen.findByText('Thank you for subscribing.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not send the same address twice while the first is on its way', async () => {
    let finish;
    subscribeToNewsletter.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderPage(<Footer />, {load: false});
    fireEvent.change(screen.getByLabelText('Your email address'), {target: {value: 'a@b.co'}});
    fireEvent.click(screen.getByLabelText('Subscribe'));
    expect(screen.getByLabelText('Subscribe').disabled).toBe(true);
    fireEvent.submit(screen.getByLabelText('Subscribe').closest('form')); // Enter in the box still submits
    expect(subscribeToNewsletter).toHaveBeenCalledTimes(1);
    finish({data: {message: 'Thank you for subscribing.'}});
    expect(await screen.findByText('Thank you for subscribing.')).toBeTruthy();
  });
});

describe('the shell (Layout)', () => {
  const renderLayout = (site = SITE) => {
    const store = makeStore(site);
    render(
      <Provider store={store}>
        <MemoryRouter><Layout scrollContainerRef={{current: null}}><p>page</p></Layout></MemoryRouter>
      </Provider>
    );
    return store;
  };

  it('reads the site once when it opens and puts the shop name on the browser tab', async () => {
    renderLayout();
    await waitFor(() => expect(document.title).toBe('GoCart | Everyday things'));
    expect(getSite).toHaveBeenCalledTimes(1);
    expect(screen.getByText('page')).toBeTruthy();
  });

  it('uses the name alone without a tagline, and leaves the title be when it has no name', async () => {
    renderLayout({...SITE, tagline: ''});
    await waitFor(() => expect(document.title).toBe('GoCart'));
    cleanup();
    document.title = 'Untouched';
    getSite.mockRejectedValue({response: {data: {error: 'x'}}});
    renderLayout(null);
    await waitFor(() => expect(getSite).toHaveBeenCalled());
    expect(document.title).toBe('Untouched');
  });

  it('draws the trust badge strip on every page it wraps', async () => {
    renderLayout();
    expect(await screen.findByText('Free delivery')).toBeTruthy();
    expect(screen.getByText('page')).toBeTruthy();
  });
});

describe('social links', () => {
  it('draws one icon link per known platform with an http(s) address and nothing else', () => {
    render(<SocialLinks links={[
      {platform: 'facebook', url: 'https://facebook.com/a'},
      {platform: 'x', url: 'javascript:alert(1)'},
      {platform: 'myspace', url: 'https://myspace.com/a'},
      {platform: 'tiktok', url: 'https://tiktok.com/@a'},
    ]} />);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'))).toEqual(['Facebook', 'TikTok']);
  });

  it('draws nothing for no links', () => {
    const {container} = render(<SocialLinks links={[]} />);
    expect(container.textContent).toBe('');
    expect(container.querySelector('a')).toBeNull();
  });
});

describe('the contact page', () => {
  const fill = (values = {}) => {
    const all = {Name: 'Rahim', Email: 'rahim@example.com', Message: 'Do you have it in blue?', ...values};
    Object.entries(all).forEach(([label, value]) => fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {target: {value}}));
  };

  it("shows the shop's own contact details, social links and map", async () => {
    const {ready} = renderPage(<Contact />);
    await ready;
    expect(await screen.findByText('House 12, Dhaka')).toBeTruthy();
    expect(screen.getByText('+880 1700-000000')).toBeTruthy();
    expect(screen.getByText('support@gocart.example')).toBeTruthy();
    expect(screen.getByText('Sat - Thu: 10 AM - 8 PM')).toBeTruthy();
    expect(screen.getByLabelText('Facebook')).toBeTruthy();
    const map = screen.getByTitle('Our location');
    expect(map.getAttribute('src')).toBe(SITE.contact.map_url);
    expect(map.getAttribute('sandbox')).toBeTruthy();
  });

  it('hides a detail the admin left empty, and the map, and the follow-us block', async () => {
    const {ready} = renderPage(<Contact />, {site: {...SITE, contact: {...SITE.contact, phone: '', map_url: ''}, social_links: []}});
    await ready;
    await screen.findByText('House 12, Dhaka');
    expect(screen.queryByText('+880 1700-000000')).toBeNull();
    expect(screen.queryByTitle('Our location')).toBeNull();
    expect(screen.queryByText('Follow Us')).toBeNull();
  });

  it('says how to reach the shop when the admin has given no details at all', async () => {
    const {ready} = renderPage(<Contact />, {site: {...SITE, contact: {...EMPTY_SITE.contact}, social_links: []}});
    await ready;
    expect(screen.getByText('Send us a message and we will get back to you.')).toBeTruthy();
  });

  it('sends the message trimmed, says thank you and empties the form', async () => {
    sendContactMessage.mockResolvedValue({data: {success: true, message: 'Thank you. We have your message and will get back to you soon.'}});
    renderPage(<Contact />, {load: false});
    fill({Name: '  Rahim  ', Phone: '+8801712345678'});
    fireEvent.click(screen.getByText('Send Message'));
    expect(await screen.findByText(/We have your message/)).toBeTruthy();
    expect(sendContactMessage).toHaveBeenCalledWith({
      name: 'Rahim', email: 'rahim@example.com', phone: '+8801712345678', subject: '', message: 'Do you have it in blue?',
    });
    expect(screen.getByLabelText(/^Name/).value).toBe('');
    expect(screen.getByLabelText(/^Message/).value).toBe('');
  });

  it('shows the backend sentences when the message is refused and keeps what was typed', async () => {
    sendContactMessage.mockRejectedValue(failure(['email: Enter a valid email address.']));
    renderPage(<Contact />, {load: false});
    fill();
    fireEvent.click(screen.getByText('Send Message'));
    expect(await screen.findByText('email: Enter a valid email address.')).toBeTruthy();
    expect(screen.queryByText(/We have your message/)).toBeNull();
    expect(screen.getByLabelText(/^Name/).value).toBe('Rahim');
  });

  it('says the connection is the problem when nothing answered, and lets the visitor retry', async () => {
    sendContactMessage.mockRejectedValueOnce({message: 'Network Error'});
    renderPage(<Contact />, {load: false});
    fill();
    fireEvent.click(screen.getByText('Send Message'));
    expect(await screen.findByText(/Could not reach the server/)).toBeTruthy();
    sendContactMessage.mockResolvedValueOnce({data: {message: 'Thank you. We have your message.'}});
    fireEvent.click(screen.getByText('Send Message'));
    expect(await screen.findByText('Thank you. We have your message.')).toBeTruthy();
    expect(screen.queryByText(/Could not reach the server/)).toBeNull(); // the old refusal is gone
  });

  it('does not send twice while the first is on its way', async () => {
    let finish;
    sendContactMessage.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderPage(<Contact />, {load: false});
    fill();
    fireEvent.click(screen.getByText('Send Message'));
    expect(await screen.findByText('Sending...')).toBeTruthy();
    fireEvent.submit(screen.getByText('Sending...').closest('form'));
    expect(sendContactMessage).toHaveBeenCalledTimes(1);
    finish({data: {message: 'Thank you.'}});
    expect(await screen.findByText('Thank you.')).toBeTruthy();
  });
});

describe('a page the admin wrote', () => {
  const routes = <Routes><Route path="/pages/:slug" element={<StaticPage />} /></Routes>;
  const PAGE = {slug: 'about-us', title: 'About Us', body: '<h2>Our Story</h2><p>Since <strong>2022</strong></p>', updated_at: '2026-09-25T10:00:00+06:00'};

  it('shows its title and its HTML', async () => {
    getSitePage.mockResolvedValue({data: {data: {page: PAGE}}});
    renderPage(null, {url: '/pages/about-us', routes, load: false});
    expect(await screen.findByRole('heading', {level: 1, name: 'About Us'})).toBeTruthy();
    expect(screen.getByRole('heading', {level: 2, name: 'Our Story'})).toBeTruthy();
    expect(screen.getByText('2022').tagName).toBe('STRONG');
    expect(getSitePage).toHaveBeenCalledWith('about-us');
  });

  it('says the page does not exist for a 404', async () => {
    getSitePage.mockRejectedValue(failure(['There is no such page.'], 404));
    renderPage(null, {url: '/pages/nothing', routes, load: false});
    expect(await screen.findByText('This page does not exist')).toBeTruthy();
    expect(screen.getByText('Go Back Home').getAttribute('href')).toBe('/');
  });

  it('says it could not be loaded for any other failure', async () => {
    getSitePage.mockRejectedValue(failure(['Server error'], 500));
    renderPage(null, {url: '/pages/about-us', routes, load: false});
    expect(await screen.findByText('This page could not be loaded')).toBeTruthy();
  });

  it('loads the next page when the address changes', async () => {
    getSitePage.mockImplementation((slug) => Promise.resolve({data: {data: {page: {...PAGE, slug, title: slug === 'a' ? 'Page A' : 'Page B', body: ''}}}}));
    const {ready} = renderPage(null, {
      url: '/pages/a', load: false,
      routes: <Routes><Route path="/pages/:slug" element={<><StaticPage /><Navigate to="/pages/b" replace /></>} /></Routes>,
    });
    await ready;
    expect(await screen.findByText('Page B')).toBeTruthy();
    expect(getSitePage).toHaveBeenLastCalledWith('b');
  });

  it('ignores a slow answer for a page the visitor has already left', async () => {
    const waiting = {};
    getSitePage.mockImplementation((slug) => new Promise((resolve) => { waiting[slug] = resolve; }));
    const answer = (slug, title) => ({data: {data: {page: {slug, title, body: '', updated_at: ''}}}});
    renderPage(null, {
      url: '/pages/a', load: false,
      routes: <><Link to="/pages/b">go to b</Link><Routes><Route path="/pages/:slug" element={<StaticPage />} /></Routes></>,
    });
    fireEvent.click(screen.getByText('go to b'));
    await waitFor(() => expect(getSitePage).toHaveBeenCalledWith('b'));
    waiting.b(answer('b', 'Page B'));
    expect(await screen.findByText('Page B')).toBeTruthy();
    waiting.a(answer('a', 'Page A')); // the first request finally answers
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText('Page A')).toBeNull();
    expect(screen.getByText('Page B')).toBeTruthy();
  });

  it('keeps a fixed slug when it is given one', async () => {
    getSitePage.mockResolvedValue({data: {data: {page: PAGE}}});
    renderPage(null, {url: '/somewhere', routes: <Routes><Route path="/somewhere" element={<StaticPage slug="about-us" />} /></Routes>, load: false});
    expect(await screen.findByText('About Us')).toBeTruthy();
    expect(getSitePage).toHaveBeenCalledWith('about-us');
  });
});

describe('the FAQ', () => {
  const FAQS = [
    {category: 'Orders', question: 'Can I cancel?', answer: 'Yes, while it is pending.\nFrom My Orders.'},
    {category: 'Shipping', question: 'How long?', answer: '3-5 days.'},
    {category: 'Orders', question: 'Return policy?', answer: '30 days.'},
  ];

  it('groups the questions by category in the admin order and opens one answer at a time', async () => {
    getFaqs.mockResolvedValue({data: {data: {faqs: FAQS}}});
    renderPage(<FAQPage />, {load: false});
    expect(await screen.findByText('Can I cancel?')).toBeTruthy();
    expect(screen.getAllByRole('heading', {level: 3}).map((heading) => heading.textContent).slice(0, 2)).toEqual(['Orders', 'Shipping']);
    expect(screen.queryByText('3-5 days.')).toBeNull();
    fireEvent.click(screen.getByText('How long?'));
    expect(screen.getByText('3-5 days.')).toBeTruthy();
    fireEvent.click(screen.getByText('Can I cancel?'));
    expect(screen.queryByText('3-5 days.')).toBeNull();
    expect(screen.getByText(/Yes, while it is pending/)).toBeTruthy();
    fireEvent.click(screen.getByText('Can I cancel?'));
    expect(screen.queryByText(/Yes, while it is pending/)).toBeNull();
  });

  it('opens only the question that was clicked, also when two categories have the same position', async () => {
    getFaqs.mockResolvedValue({data: {data: {faqs: [
      {category: 'A', question: 'First A?', answer: 'answer A'},
      {category: 'B', question: 'First B?', answer: 'answer B'},
    ]}}});
    renderPage(<FAQPage />, {load: false});
    fireEvent.click(await screen.findByText('First B?'));
    expect(screen.getByText('answer B')).toBeTruthy();
    expect(screen.queryByText('answer A')).toBeNull();
  });

  it('searches the questions and the answers', async () => {
    getFaqs.mockResolvedValue({data: {data: {faqs: FAQS}}});
    renderPage(<FAQPage />, {load: false});
    await screen.findByText('Can I cancel?');
    fireEvent.change(screen.getByLabelText('Search FAQs'), {target: {value: 'days'}});
    expect(screen.getByText('How long?')).toBeTruthy(); // matched in its answer
    expect(screen.getByText('Return policy?')).toBeTruthy();
    expect(screen.queryByText('Can I cancel?')).toBeNull();
    fireEvent.change(screen.getByLabelText('Search FAQs'), {target: {value: 'zzz'}});
    expect(screen.getByText(/No question matches "zzz"/)).toBeTruthy();
  });

  it('says so when there are no questions, and when they could not be loaded', async () => {
    getFaqs.mockResolvedValue({data: {data: {faqs: []}}});
    const first = renderPage(<FAQPage />, {load: false});
    expect(await screen.findByText('There are no questions here yet.')).toBeTruthy();
    first.unmount();
    getFaqs.mockRejectedValue(failure(['Server error'], 500));
    renderPage(<FAQPage />, {load: false});
    expect(await screen.findByText(/could not be loaded/)).toBeTruthy();
  });

  it('links to the contact page', async () => {
    getFaqs.mockResolvedValue({data: {data: {faqs: []}}});
    renderPage(<FAQPage />, {load: false});
    expect((await screen.findByText('Contact Support')).closest('a').getAttribute('href')).toBe('/contact');
  });
});

describe('errorMessages', () => {
  it('prefers the backend sentences, then its single error, then says the connection failed, then a general sentence', () => {
    expect(errorMessages(failure(['a', 'b']))).toEqual(['a', 'b']);
    expect(errorMessages({response: {data: {error: 'one'}}})).toEqual(['one']);
    expect(errorMessages({message: 'Network Error'})[0]).toMatch(/Could not reach the server/);
    expect(errorMessages({response: {data: {}}})).toEqual(['Something went wrong. Please try again.']);
    expect(errorMessages({response: {data: {errors: []}}}, 'Custom')).toEqual(['Custom']);
  });
});
