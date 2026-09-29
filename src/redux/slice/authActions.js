
import { persistStore } from 'redux-persist';
import store from '../store';
import {loadUserFromStorage, logoutUser, sessionEnded} from './authSlice';
import {clearCart} from './cartSlice';
import {clearWishlist} from './wishlistSlice';

export const Logout = (logout_data) => (dispatch) => {
  dispatch(logoutUser(logout_data)); // Reset authentication state
  dispatch(clearCart());
  dispatch(clearWishlist());
  persistStore(store).purge(); // Clear persisted state
};

// The local cart and wishlist of a signed-in customer are a copy of the ones on the server. Once this device is no
// longer signed in they must go: the backend ADDS a guest's cart to the account's cart at the next sign-in (so the same
// items would be counted twice), and a different customer signing in here would inherit them.
const forgetAccountData = (dispatch) => {
  dispatch(clearCart());
  dispatch(clearWishlist());
};

// The server refused this device's refresh token (api/session.js): the session is over. Unlike `Logout` there is nobody to
// tell (the token is dead) and the rest of the persisted state (recently viewed, ...) is not the session's.
export const endSession = () => (dispatch, getState) => {
  if (!getState().auth.isAuthenticated) return; // several requests found out at once: end it once
  dispatch(sessionEnded());
  forgetAccountData(dispatch);
};

// When the app opens: trust the cookies over the persisted `isAuthenticated` flag. A flag without a refresh token
// (cookies expired or cleared) is a customer who is no longer signed in, quietly: no error, just a guest again.
export const restoreSession = () => (dispatch, getState) => {
  const wasSignedIn = getState().auth.isAuthenticated;
  dispatch(loadUserFromStorage());
  if (wasSignedIn && !getState().auth.isAuthenticated) forgetAccountData(dispatch);
};
