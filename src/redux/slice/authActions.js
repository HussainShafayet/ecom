
import { persistStore } from 'redux-persist';
import store from '../store';
import {logoutUser} from './authSlice';
import {clearCart} from './cartSlice';
import {clearWishlist} from './wishlistSlice';

export const Logout = (logout_data) => (dispatch) => {
  dispatch(logoutUser(logout_data)); // Reset authentication state
  dispatch(clearCart());
  dispatch(clearWishlist());
  persistStore(store).purge(); // Clear persisted state
};
