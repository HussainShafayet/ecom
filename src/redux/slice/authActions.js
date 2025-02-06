
import { persistStore } from 'redux-persist';
import store from '../store';
import {logoutUser} from './authSlice';

export const Logout = (logout_data) => (dispatch) => {
  dispatch(logoutUser(logout_data)); // Reset authentication state
  persistStore(store).purge(); // Clear persisted state
};
