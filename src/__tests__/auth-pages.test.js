// Sign in, sign up and the code page, phone first: the form is the first thing on the page (no brand panel with a picture from
// another website, no social buttons that did nothing), a fixed +880 and a phone box that cleans what is typed or pasted (the
// backend's rule is +880 and exactly 10 digits), one sentence per problem with the customer taken to it, a code box a phone can
// fill in from the SMS, a resend button that counts down, and the page they came from kept (with its query string) all the way back.
// (The redirect itself is also covered in post-login-redirect.test.js.)
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import siteReducer, {EMPTY_SITE} from '../redux/slice/siteSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import publicApi from '../api/publicApi';
import {maskPhone, normalizePhone, validatePhone} from '../utils/phone';
import SignIn from '../pages/user/SignIn';
import SignUp from '../pages/user/SignUp';
import VerifyOtp, {RESEND_SECONDS} from '../pages/user/VerifyOtp';

vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const init = (reducer) => reducer(undefined, {type: '@@init'});
const makeStore = ({auth = {}, cartItems = [], wishItems = [], sectionErrors = {}, site = null} = {}) => configureStore({
  reducer: {auth: authReducer, cart: cartReducer, wishList: wishListReducer, globalError: globalErrorReducer, ...(site ? {site: siteReducer} : {})},
  preloadedState: {
    auth: {...init(authReducer), ...auth},
    cart: {...init(cartReducer), cartItems},
    wishList: {...init(wishListReducer), items: wishItems},
    globalError: {sectionErrors},
    ...(site ? {site: {...init(siteReducer), site: {...EMPTY_SITE, ...site}}} : {}),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

// Says where the customer ended up, query string included
const Where = () => {
  const location = useLocation();
  return <p>{`AT ${location.pathname}${location.search}`}</p>;
};

const renderAt = (entry, store = makeStore()) => render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp/:token" element={<VerifyOtp />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});
const posted = (url) => publicApi.post.mock.calls.filter(([calledUrl]) => calledUrl === url);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  publicApi.post.mockImplementation((url) => {
    if (url === '/accounts/login/') return Promise.resolve({data: {message: 'Code sent', data: {token: 'tok-1'}}});
    if (url === '/accounts/register/') return Promise.resolve({data: {message: 'Registered', data: {token: 'tok-9'}}});
    if (url === '/accounts/resend-otp/') return Promise.resolve({data: {message: 'Sent again', data: null}});
    if (url === '/accounts/verify-otp/') {
      return Promise.resolve({data: {data: {message: 'Verified', tokens: {access: 'access-tok', refresh: 'refresh-tok'}}}});
    }
    return Promise.reject(new Error(`unexpected POST ${url}`));
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('The phone helpers', () => {
  it('turn whatever was typed into the 10 digits, and say what is wrong with anything else', () => {
    expect(normalizePhone('01712345678')).toBe('1712345678');
    expect(normalizePhone('+880 1712-345678')).toBe('1712345678');
    expect(validatePhone('')).toBe('Enter your phone number');
    expect(validatePhone('12345')).toBe('Enter 10 digits after +880, for example 1712345678');
    expect(validatePhone('1712345678')).toBe('');
  });

  it('hide the middle of the number a code went to', () => {
    expect(maskPhone('1712345678')).toBe('+880 17•••••678');
    expect(maskPhone('01712345678')).toBe('+880 17•••••678');
    expect(maskPhone('')).toBe('');
    expect(maskPhone('17')).toBe('');
  });
});

describe('Sign in', () => {
  it('is the form and nothing above it: no brand panel with an outside picture, no buttons that did nothing', () => {
    const {container} = renderAt('/signin');

    expect(screen.getByRole('heading', {level: 1, name: 'Welcome back'})).toBeTruthy();
    expect(screen.queryByText('Welcome to Our Store')).toBeNull();
    expect(container.querySelector('[style*="flaticon"]')).toBeNull();
    expect(screen.getByLabelText('Phone number')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /facebook|google/i})).toBeNull();
    expect(screen.getByText('Sign up').getAttribute('href')).toBe('/signup');
  });

  it('asks a phone for its number keypad and saved number, with the +880 fixed in front', () => {
    const {container} = renderAt('/signin');
    const phone = screen.getByLabelText('Phone number');

    expect(screen.getByText('+880')).toBeTruthy();
    expect(phone.getAttribute('type')).toBe('tel');
    expect(phone.getAttribute('inputmode')).toBe('numeric');
    expect(phone.getAttribute('autocomplete')).toBe('tel-national');
    expect(container.querySelector('form').noValidate).toBe(true);
    expect(container.querySelector('[required]')).toBeNull();
  });

  it('takes the number the way people write it', () => {
    renderAt('/signin');
    const phone = screen.getByLabelText('Phone number');

    type('Phone number', '01712345678');
    expect(phone.value).toBe('1712345678');
    type('Phone number', '+880 1712-345678');
    expect(phone.value).toBe('1712345678');
  });

  it('says what is wrong, takes the customer to the box, and sends nothing', () => {
    renderAt('/signin');

    fireEvent.click(screen.getByRole('button', {name: 'Sign In'}));
    expect(screen.getByText('Enter your phone number')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Phone number'));
    expect(screen.getByLabelText('Phone number').getAttribute('aria-invalid')).toBe('true');

    type('Phone number', '12345');
    fireEvent.click(screen.getByRole('button', {name: 'Sign In'}));
    expect(screen.getByText('Enter 10 digits after +880, for example 1712345678')).toBeTruthy();
    expect(publicApi.post).not.toHaveBeenCalled();
  });

  it('sends +880 and the 10 digits', async () => {
    renderAt('/signin');
    type('Phone number', '01712345678');

    fireEvent.click(screen.getByRole('button', {name: 'Sign In'}));

    await waitFor(() => expect(posted('/accounts/login/')).toHaveLength(1));
    expect(posted('/accounts/login/')[0][1]).toEqual({phone_number: '+8801712345678'});
  });

  it('shows the backend\'s sentence when the number is not known', async () => {
    publicApi.post.mockRejectedValue({response: {data: {success: false, errors: ['No account has this phone number.']}}});
    renderAt('/signin');
    type('Phone number', '1712345678');

    fireEvent.click(screen.getByRole('button', {name: 'Sign In'}));

    expect(await screen.findByText('No account has this phone number.')).toBeTruthy();
  });

  it('says the session expired, when it did', () => {
    renderAt('/signin', makeStore({auth: {sessionExpired: true}}));
    expect(screen.getByRole('status').textContent).toContain('Your session expired');
  });

  it('takes the number to the code page, and brings the customer back to the page they were on, with its query string', async () => {
    renderAt({pathname: '/signin', state: {from: {pathname: '/orders', search: '?status=shipped'}}});
    type('Phone number', '1712345678');
    fireEvent.click(screen.getByRole('button', {name: 'Sign In'}));

    expect(await screen.findByText('We sent a 6-digit code to +880 17•••••678.')).toBeTruthy();

    type(/otp/i, '123456');
    fireEvent.click(screen.getByRole('button', {name: 'Verify OTP'}));

    expect(await screen.findByText('AT /orders?status=shipped')).toBeTruthy(); // not just "/orders"
  });
});

describe('Sign up', () => {
  it('has a label above each field, the attributes a phone fills in from, and an optional e-mail', () => {
    const {container} = renderAt('/signup');

    expect(screen.getByRole('heading', {level: 1, name: 'Create your account'})).toBeTruthy();
    expect(screen.getByLabelText('Full name').getAttribute('autocomplete')).toBe('name');
    expect(screen.getByLabelText('Phone number').getAttribute('inputmode')).toBe('numeric'); // it was type=number
    expect(screen.getByLabelText('Phone number').getAttribute('type')).toBe('tel');
    const email = screen.getByLabelText(/^Email/);
    expect(email.getAttribute('type')).toBe('email');
    expect(email.getAttribute('autocomplete')).toBe('email');
    expect(screen.getByText('(optional)')).toBeTruthy();
    expect(container.querySelector('form').noValidate).toBe(true);
    expect(screen.queryByRole('button', {name: /facebook|google/i})).toBeNull();
    expect(screen.getByText('Sign in').getAttribute('href')).toBe('/signin');
  });

  it('says what is wrong, takes the customer to the first field, and sends nothing', () => {
    renderAt('/signup');

    fireEvent.click(screen.getByRole('button', {name: 'Sign Up'}));

    expect(screen.getByText('Enter your full name')).toBeTruthy();
    expect(screen.getByText('Enter your phone number')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Full name'));
    expect(publicApi.post).not.toHaveBeenCalled();
  });

  it('checks the e-mail only when there is one', () => {
    renderAt('/signup');
    type('Full name', 'Rahim');
    type('Phone number', '1712345678');

    type(/^Email/, 'rahim@');
    fireEvent.click(screen.getByRole('button', {name: 'Sign Up'}));
    expect(screen.getByText('Enter a valid email address, or leave it empty')).toBeTruthy();
    expect(publicApi.post).not.toHaveBeenCalled();

    type(/^Email/, '');
    fireEvent.click(screen.getByRole('button', {name: 'Sign Up'}));
    expect(screen.queryByText(/Enter a valid email/)).toBeNull();
  });

  it('sends the account, then goes to the code page with the number the code went to', async () => {
    renderAt('/signup');
    type('Full name', '  Rahim Uddin ');
    type('Phone number', '01712345678');

    fireEvent.click(screen.getByRole('button', {name: 'Sign Up'}));

    await waitFor(() => expect(posted('/accounts/register/')).toHaveLength(1));
    expect(posted('/accounts/register/')[0][1]).toEqual({phone_number: '+8801712345678', email: '', name: 'Rahim Uddin'});
    expect(await screen.findByText('We sent a 6-digit code to +880 17•••••678.')).toBeTruthy();
  });
});

describe('The code page', () => {
  const at = (state = {from: '/', phone: '1712345678'}) => renderAt({pathname: '/verify-otp/tok-1', state});

  it('is a big box that asks the phone for the number keypad and to fill in the SMS, and says where the code went', () => {
    at();
    const otp = screen.getByLabelText(/otp/i);

    expect(otp.getAttribute('inputmode')).toBe('numeric');
    expect(otp.getAttribute('autocomplete')).toBe('one-time-code');
    expect(screen.getByRole('heading', {level: 1, name: 'Enter your code'})).toBeTruthy();
    expect(screen.getByText('We sent a 6-digit code to +880 17•••••678.')).toBeTruthy();
    expect(screen.getByText('Use a different number').getAttribute('href')).toBe('/signin');
  });

  it('does not say a number it does not know', () => {
    at({});
    expect(screen.getByText('We sent you a 6-digit code.')).toBeTruthy();
  });

  it('keeps only digits, at most six, however the code was typed or pasted', () => {
    at();
    type(/otp/i, '12 34-56 78');
    expect(screen.getByLabelText(/otp/i).value).toBe('123456');
    type(/otp/i, 'ab');
    expect(screen.getByLabelText(/otp/i).value).toBe('');
  });

  it('asks for the six digits and sends nothing until they are there', () => {
    at();
    type(/otp/i, '123');

    fireEvent.click(screen.getByRole('button', {name: 'Verify OTP'}));

    expect(screen.getByText('Enter the 6-digit code we sent you')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/otp/i));
    expect(publicApi.post).not.toHaveBeenCalled();
  });

  it('sends the code with the guest cart and wishlist, to be merged into the account', async () => {
    renderAt({pathname: '/verify-otp/tok-1', state: {from: '/', phone: '1712345678'}}, makeStore({
      cartItems: [{id: 9, quantity: 2, variant_id: 5, name: 'Mug'}],
      wishItems: [{id: 4}],
    }));
    type(/otp/i, '123456');

    fireEvent.click(screen.getByRole('button', {name: 'Verify OTP'}));

    await waitFor(() => expect(posted('/accounts/verify-otp/')).toHaveLength(1));
    expect(posted('/accounts/verify-otp/')[0][1]).toEqual({
      token: 'tok-1', otp: '123456', cart: [{product_id: 9, quantity: 2, variant_id: 5}], favorite: [{product_id: 4}],
    });
  });

  it('counts down before another code can be asked for, and starts over when it is', async () => {
    vi.useFakeTimers();
    at();
    const resend = () => screen.getByRole('button', {name: /Resend code/});

    expect(resend().textContent).toBe(`Resend code in ${RESEND_SECONDS}s`);
    expect(resend().disabled).toBe(true);

    // (a second at a time: each tick schedules the next one when the page has re-rendered)
    act(() => { vi.advanceTimersByTime(1000); });
    expect(resend().textContent).toBe(`Resend code in ${RESEND_SECONDS - 1}s`);

    for (let second = 1; second < RESEND_SECONDS; second += 1) act(() => { vi.advanceTimersByTime(1000); });
    expect(resend().textContent).toBe('Resend code');
    expect(resend().disabled).toBe(false);

    await act(async () => { fireEvent.click(resend()); });
    expect(posted('/accounts/resend-otp/')).toHaveLength(1);
    expect(posted('/accounts/resend-otp/')[0][1]).toEqual({token: 'tok-1'});
    expect(resend().textContent).toBe(`Resend code in ${RESEND_SECONDS}s`);
    expect(resend().disabled).toBe(true);
  });

  it('shows why the shop refused (the code, or another code too soon), the code first', () => {
    const {unmount} = renderAt({pathname: '/verify-otp/tok-1', state: {}}, makeStore({sectionErrors: {'resend-otp': 'Too many requests. Please try again later.'}}));
    expect(screen.getByRole('alert').textContent).toBe('Too many requests. Please try again later.');
    unmount();

    renderAt({pathname: '/verify-otp/tok-1', state: {}}, makeStore({sectionErrors: {'verify-otp': 'The code is wrong.', 'resend-otp': 'Too many requests.'}}));
    expect(screen.getByRole('alert').textContent).toBe('The code is wrong.');
  });

  it('says it is checking the code, and sends a signed-in customer on', async () => {
    renderAt({pathname: '/verify-otp/tok-1', state: {from: '/checkout', phone: '1712345678'}}, makeStore({auth: {isAuthenticated: true}}));
    expect(await screen.findByText('AT /checkout')).toBeTruthy();
  });
});

describe('The look of the auth pages', () => {
  it('wear the shop\'s own name, tagline and logo (from its site settings), not a stock box', () => {
    renderAt('/signin', makeStore({site: {name: 'GoCart', tagline: 'Everyday things', logo: '/media/logo.png'}}));

    expect(screen.getByText('GoCart')).toBeTruthy();
    expect(screen.getByText('Everyday things')).toBeTruthy();
    expect(screen.getByAltText('GoCart logo').getAttribute('src')).toBe('/media/logo.png');
  });

  it('say Welcome and use the bundled logo until (or unless) the site settings arrive', () => {
    renderAt('/signin');

    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByAltText('Shop logo').getAttribute('src')).toBe('/static image/gocart-logo.svg');
  });

  it('draw everything themselves: no picture from another website', () => {
    const {container} = renderAt('/signin');
    const pictures = [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'));
    expect(pictures.every((source) => source.startsWith('/'))).toBe(true);
    expect(container.querySelector('[style*="url("]')).toBeNull();
  });

  it('show the two steps, and which one this is', () => {
    const {unmount} = renderAt('/signin');
    let steps = screen.getByRole('list', {name: 'Steps'});
    expect(steps.querySelector('[aria-current="step"]').textContent).toContain('Your phone');
    expect(steps.textContent).toContain('Your code');
    unmount();

    renderAt({pathname: '/verify-otp/tok-1', state: {}});
    steps = screen.getByRole('list', {name: 'Steps'});
    expect(steps.querySelector('[aria-current="step"]').textContent).toContain('Your code');
    expect(steps.textContent).toContain('✓'); // the first step is done
  });

  it('say there is no password, and that the number is private', () => {
    renderAt('/signup');
    expect(screen.getByText('No password to remember')).toBeTruthy();
    expect(screen.getByText('We never share your number')).toBeTruthy();
  });
});

describe('The code boxes', () => {
  const boxesOf = () => [...screen.getByLabelText(/otp/i).previousSibling.children];

  it('are six squares that fill in as the code is typed, over one real input', () => {
    renderAt({pathname: '/verify-otp/tok-1', state: {}});
    const input = screen.getByLabelText(/otp/i);

    expect(boxesOf()).toHaveLength(6);
    expect(input.previousSibling.getAttribute('aria-hidden')).toBe('true'); // only the picture; the input is what is read and typed into
    expect(input.className).toContain('opacity-0'); // it lies over the boxes, so a tap anywhere on them focuses it
    expect(input.className).toContain('absolute');

    type(/otp/i, '1234');
    expect(boxesOf().map((box) => box.textContent)).toEqual(['1', '2', '3', '4', '', '']);
  });

  it('light the next empty box while the input is focused', () => {
    renderAt({pathname: '/verify-otp/tok-1', state: {}});
    const input = screen.getByLabelText(/otp/i);
    type(/otp/i, '12');
    expect(boxesOf()[2].className).not.toContain('border-indigo-600');

    fireEvent.focus(input);
    expect(boxesOf()[2].className).toContain('border-indigo-600');
    expect(boxesOf()[0].className).toContain('bg-indigo-50'); // filled

    fireEvent.blur(input);
    expect(boxesOf()[2].className).not.toContain('border-indigo-600');
  });

  it('turn red when the code is not right', () => {
    renderAt({pathname: '/verify-otp/tok-1', state: {}});
    type(/otp/i, '12');

    fireEvent.click(screen.getByRole('button', {name: 'Verify OTP'}));

    expect(boxesOf().every((box) => box.className.includes('border-red-400'))).toBe(true);
    expect(screen.getByText('Enter the 6-digit code we sent you')).toBeTruthy();
  });
});
