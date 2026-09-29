// When the shop says "too many" (HTTP 429) to a code request, a customer used to see DRF's raw "Request was throttled. Expected
// available in 15 seconds." under a red "Error". Now: how long to wait is worked out (retryAfterSeconds), said in words
// (formatWait), counted down on the page, and the button that would ask again is disabled until then. The resend cooldown is the
// backend's own 60 s (it was 30, so pressing Resend at 31 s was refused). What the shop says about a wrong code stays under the
// boxes, and a resend that failed is said by the resend button. The code page takes its numbers (seconds before a resend, how long
// the code works, how many digits) from the backend's answer to "send a code", and falls back to 60 s / 6 digits without them.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import publicApi from '../api/publicApi';
import {apiErrorMessage, formatWait, retryAfterSeconds} from '../api/errors';
import SignIn from '../pages/user/SignIn';
import SignUp from '../pages/user/SignUp';
import VerifyOtp, {RESEND_SECONDS} from '../pages/user/VerifyOtp';

vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

// DRF's answer to a throttled request, as the envelope the backend sends it in
const throttled = (seconds, headers = {}) => Object.assign(new Error('Request failed with status code 429'), {
  response: {
    status: 429,
    headers,
    data: {success: false, message: 'Too many requests.', errors: [`Request was throttled. Expected available in ${seconds} second${seconds === 1 ? '' : 's'}.`]},
  },
});
const refused = (errors) => Object.assign(new Error('Request failed with status code 400'), {response: {status: 400, headers: {}, data: {success: false, errors}}});

const makeStore = () => configureStore({
  reducer: {auth: authReducer, cart: cartReducer, wishList: wishListReducer, globalError: globalErrorReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderAt = (entry) => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp/:token" element={<VerifyOtp />} />
        <Route path="*" element={<p>elsewhere</p>} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});
const click = async (name) => { await act(async () => { fireEvent.click(screen.getByRole('button', {name})); }); };
// (a second at a time: each tick schedules the next one when the page has re-rendered)
const tick = (seconds) => { for (let second = 0; second < seconds; second += 1) act(() => { vi.advanceTimersByTime(1000); }); };
const notice = () => screen.getByRole('alert').textContent;

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('How long to wait, and how to say it', () => {
  it('is the Retry-After header when the browser lets us read it, else the seconds in the backend\'s sentence', () => {
    expect(retryAfterSeconds(throttled(15, {'retry-after': '20'}))).toBe(20);
    expect(retryAfterSeconds(throttled(15))).toBe(15);
    expect(retryAfterSeconds(throttled(1))).toBe(1);
  });

  it('is nothing for what was not a 429, and 30 s for a 429 that does not say', () => {
    expect(retryAfterSeconds(refused(['Nope.']))).toBeNull();
    expect(retryAfterSeconds(new Error('Network Error'))).toBeNull();
    const silent = {response: {status: 429, headers: {}, data: {errors: ['Slow down.']}}};
    expect(retryAfterSeconds(silent)).toBe(30);
    expect(retryAfterSeconds(silent, null)).toBeNull();
  });

  it('is said in seconds, minutes or hours, whichever a person would say', () => {
    expect(formatWait(1)).toBe('1 second');
    expect(formatWait(15)).toBe('15 seconds');
    expect(formatWait(89)).toBe('89 seconds');
    expect(formatWait(100)).toBe('2 minutes');
    expect(formatWait(1500)).toBe('25 minutes');
    expect(formatWait(3601)).toBe('61 minutes'); // still counted in minutes below an hour and a half
    expect(formatWait(7200)).toBe('2 hours');
  });

  it('is what a toast or a section error says for a 429 too', () => {
    expect(apiErrorMessage(throttled(100))).toBe('Too many requests. Please try again in 2 minutes.');
    expect(apiErrorMessage({response: {status: 429, headers: {}, data: {}}})).toBe('Too many requests. Please try again in a moment.');
  });
});

describe('Sign in when too many codes were asked for', () => {
  it('says how long to wait, counts it down, and asks again only when it is over', async () => {
    publicApi.post.mockRejectedValue(throttled(15));
    renderAt('/signin');
    type('Phone number', '1712345678');

    await click('Sign In');

    expect(notice()).toContain('You have asked for too many codes. Please try again in 15 seconds');
    expect(document.body.textContent).not.toContain('Request was throttled'); // DRF's sentence is not for a customer
    expect(screen.queryByText('Error')).toBeNull();
    const button = screen.getByRole('button', {name: 'Try again in 15 seconds'});
    expect(button.disabled).toBe(true);

    tick(5);
    expect(screen.getByRole('button', {name: 'Try again in 10 seconds'})).toBeTruthy();
    fireEvent.submit(button.closest('form')); // pressing Enter in the box does nothing either
    expect(publicApi.post).toHaveBeenCalledTimes(1);

    tick(10);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', {name: 'Sign In'}).disabled).toBe(false);
  });

  it('says minutes for a long wait (a limit per hour)', async () => {
    publicApi.post.mockRejectedValue(throttled(1500));
    renderAt('/signin');
    type('Phone number', '1712345678');

    await click('Sign In');

    expect(notice()).toContain('25 minutes');
    expect(screen.getByRole('button', {name: 'Try again in 25 minutes'}).disabled).toBe(true);
  });

  it('starts the count again when it is refused again', async () => {
    publicApi.post.mockRejectedValueOnce(throttled(2));
    publicApi.post.mockRejectedValueOnce(throttled(2));
    renderAt('/signin');
    type('Phone number', '1712345678');
    await click('Sign In');
    tick(2);

    await click('Sign In'); // a second refusal, with the same number of seconds

    expect(screen.getByRole('button', {name: 'Try again in 2 seconds'})).toBeTruthy();
  });
});

describe('Sign up when too many codes were asked for', () => {
  it('waits the same way', async () => {
    publicApi.post.mockRejectedValue(throttled(20));
    renderAt('/signup');
    type('Full name', 'Rahim');
    type('Phone number', '1712345678');

    await click('Sign Up');

    expect(notice()).toContain('Please try again in 20 seconds');
    expect(screen.getByRole('button', {name: 'Try again in 20 seconds'}).disabled).toBe(true);
    tick(20);
    expect(screen.getByRole('button', {name: 'Sign Up'}).disabled).toBe(false);
  });
});

describe('The code page', () => {
  const at = () => renderAt({pathname: '/verify-otp/tok-1', state: {from: '/', phone: '1712345678'}});
  const boxes = () => [...screen.getByLabelText(/otp/i).previousSibling.children];

  it('waits the backend\'s 60 s before another code, not 30 (the backend refused a resend before that)', () => {
    expect(RESEND_SECONDS).toBe(60);
    at();
    expect(screen.getByRole('button', {name: 'Resend code in 60s'}).disabled).toBe(true);
    tick(59);
    expect(screen.getByRole('button', {name: 'Resend code in 1s'})).toBeTruthy();
    tick(1);
    expect(screen.getByRole('button', {name: 'Resend code'}).disabled).toBe(false);
  });

  it('takes the wait the shop names when it refuses a resend, and says so', async () => {
    publicApi.post.mockRejectedValue(throttled(20));
    at();
    tick(RESEND_SECONDS);

    await click('Resend code');

    expect(screen.getByRole('button', {name: 'Resend code in 20s'}).disabled).toBe(true);
    expect(notice()).toContain('You have asked for too many codes. Please try again in 20 seconds');
    expect(document.body.textContent).not.toContain('Request was throttled');
    expect(boxes().every((box) => !box.className.includes('border-red-400'))).toBe(true); // nothing is wrong with the code
  });

  it('says minutes on the button when the limit per hour was reached', async () => {
    publicApi.post.mockRejectedValue(throttled(1500));
    at();
    tick(RESEND_SECONDS);

    await click('Resend code');

    expect(screen.getByRole('button', {name: 'Resend code in 25 minutes'}).disabled).toBe(true);
    expect(notice()).toContain('25 minutes');
  });

  it('says a resend that failed by the resend button, and leaves the way back', async () => {
    publicApi.post.mockRejectedValue(refused(['Too many resend requests. Please start again.']));
    at();
    tick(RESEND_SECONDS);

    await click('Resend code');

    expect(screen.getByRole('alert').textContent).toBe('Too many resend requests. Please start again.');
    expect(screen.getByText('Use a different number').getAttribute('href')).toBe('/signin');
    expect(boxes().every((box) => !box.className.includes('border-red-400'))).toBe(true);
  });

  it('holds the Verify button for as long as the shop says after too many attempts', async () => {
    publicApi.post.mockRejectedValue(throttled(15));
    at();
    type(/otp/i, '123456');

    await click('Verify OTP');

    expect(notice()).toContain('Too many attempts. Please try again in 15 seconds');
    expect(screen.getByRole('button', {name: 'Try again in 15 seconds'}).disabled).toBe(true);
    expect(boxes().every((box) => !box.className.includes('border-red-400'))).toBe(true); // the code was not "wrong"
    tick(15);
    expect(screen.getByRole('button', {name: 'Verify OTP'}).disabled).toBe(false);
  });

  it('shows what the shop says about a wrong code under the boxes (red), and forgets it when a new code is typed', async () => {
    publicApi.post.mockRejectedValue(refused(['Incorrect code. 4 attempts left.']));
    at();
    type(/otp/i, '111111');

    await click('Verify OTP');

    expect(screen.getByText('Incorrect code. 4 attempts left.')).toBeTruthy();
    expect(boxes().every((box) => box.className.includes('border-red-400'))).toBe(true);

    type(/otp/i, '11111');
    expect(screen.queryByText('Incorrect code. 4 attempts left.')).toBeNull();
  });
});

describe('The code page follows what the backend says about the code', () => {
  // the backend's answer to register/login: the token, and the timing of the code it just sent
  const sent = (data) => ({data: {success: true, message: 'OTP sent.', data: {token: 'tok-9', ...data}}});
  const signIn = async (timing) => {
    publicApi.post.mockResolvedValueOnce(sent(timing));
    renderAt('/signin');
    type('Phone number', '1712345678');
    await click('Sign In');
  };
  const boxes = () => [...screen.getByLabelText(/otp/i).previousSibling.children];

  it('counts the wait it was told, draws as many boxes as the code has digits, and says how long the code works', async () => {
    await signIn({resend_after: 45, expires_in: 300, length: 4});

    expect(screen.getByText('We sent a 4-digit code to +880 17•••••678. It works for 5 minutes.')).toBeTruthy();
    expect(screen.getByLabelText('4-digit OTP')).toBeTruthy();
    expect(boxes()).toHaveLength(4);
    expect(screen.getByRole('button', {name: 'Resend code in 45s'}).disabled).toBe(true);
  });

  it('asks for as many digits as the backend said, no more and no fewer', async () => {
    await signIn({resend_after: 60, expires_in: 300, length: 4});
    type(/otp/i, '123');

    await click('Verify OTP');

    expect(screen.getByText('Enter the 4-digit code we sent you')).toBeTruthy();
    expect(publicApi.post).toHaveBeenCalledTimes(1); // only the sign-in

    publicApi.post.mockRejectedValueOnce(refused(['Incorrect code.']));
    type(/otp/i, '12345'); // a fifth digit does not fit
    expect(screen.getByLabelText(/otp/i).value).toBe('1234');
    await click('Verify OTP');
    expect(publicApi.post).toHaveBeenLastCalledWith('/accounts/verify-otp/', expect.objectContaining({otp: '1234'}), expect.anything());
  });

  it('starts the wait again from the same number when Resend is pressed', async () => {
    await signIn({resend_after: 45, expires_in: 300, length: 6});
    tick(45);
    publicApi.post.mockResolvedValueOnce({data: {success: true, message: 'A new code was sent.', data: {resend_after: 45, expires_in: 300, length: 6}}});

    await click('Resend code');

    expect(screen.getByRole('button', {name: 'Resend code in 45s'}).disabled).toBe(true);
  });

  it('keeps to 60 seconds and 6 digits, and says nothing about expiry, when the backend does not send them (an older one)', async () => {
    await signIn({});

    expect(screen.getByText('We sent a 6-digit code to +880 17•••••678.')).toBeTruthy();
    expect(boxes()).toHaveLength(6);
    expect(screen.getByRole('button', {name: 'Resend code in 60s'}).disabled).toBe(true);
  });
});
