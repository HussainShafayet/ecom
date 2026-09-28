// After ProtectedRoute redirects a guest to /signin with the page they wanted in location.state.from,
// signing in and verifying the OTP must land them back on that page, not always on '/' (see CLAUDE.md's
// former "Post-login redirect-to-previous-page is broken" landmine, fixed in SignIn.js/VerifyOtp.js).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import authReducer from '../redux/slice/authSlice';
import cartReducer from '../redux/slice/cartSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import publicApi from '../api/publicApi';
import SignIn from '../pages/user/SignIn';
import VerifyOtp from '../pages/user/VerifyOtp';

vi.mock('../api/publicApi', () => ({default: {get: vi.fn(), post: vi.fn()}}));

const makeStore = () => configureStore({
  reducer: {auth: authReducer, cart: cartReducer, wishList: wishListReducer, globalError: globalErrorReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderApp = (store) => render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[{pathname: '/signin', state: {from: {pathname: '/profile'}}}]}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-otp/:token" element={<VerifyOtp />} />
        <Route path="/profile" element={<div>PROFILE PAGE</div>} />
        <Route path="/" element={<div>HOME PAGE</div>} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  publicApi.post.mockImplementation((url) => {
    if (url === '/accounts/login/') {
      return Promise.resolve({data: {message: 'OTP sent', data: {token: 'tok-123'}}});
    }
    if (url === '/accounts/verify-otp/') {
      return Promise.resolve({
        data: {data: {message: 'Verified', tokens: {access: 'access-tok', refresh: 'refresh-tok'}}},
      });
    }
    return Promise.reject(new Error(`unexpected POST ${url}`));
  });
});

describe('Post-login redirect', () => {
  it('sends a signed-in customer back to the page they were on, not home', async () => {
    const store = renderApp(makeStore());

    fireEvent.change(screen.getByLabelText(/phone number/i), {target: {value: '1712345678'}});
    fireEvent.click(screen.getByRole('button', {name: /sign in/i}));

    // SignIn -> VerifyOtp, carrying the original `from` along.
    await waitFor(() => expect(screen.getByLabelText(/otp/i)).toBeTruthy());

    fireEvent.change(screen.getByLabelText(/otp/i), {target: {value: '123456'}});
    fireEvent.click(screen.getByRole('button', {name: /verify otp/i}));

    // VerifyOtp -> the originally requested page, not '/'.
    await waitFor(() => expect(screen.getByText('PROFILE PAGE')).toBeTruthy());
    expect(screen.queryByText('HOME PAGE')).toBeNull();
  });
});
