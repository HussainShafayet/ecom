// src/redux/slice/wishlistSlice.js
import { createSlice } from '@reduxjs/toolkit';


// Load initial Wish items from localStorage, or default to an empty array
const loadWishlistFromLocalStorage = () => {
    try {
      const serializedWish = localStorage.getItem('wishList');
      return serializedWish ? JSON.parse(serializedWish) : [];
    } catch (e) {
      console.warn("Could not load wishlist items from localStorage:", e);
      return [];
    }
  };


const initialState = {
  items: loadWishlistFromLocalStorage(),
};

const wishlistSlice = createSlice({
  name: 'wishList',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

// Save cart to localStorage whenever cart items change
export const saveWishlistToLocalStorage = (wishlistItems) => {
    try {
      const serializedWish = JSON.stringify(wishlistItems);
      localStorage.setItem('wishList', serializedWish);
    } catch (e) {
      console.warn("Could not save wishList items to localStorage:", e);
    }
  };
  
  // Middleware to sync cart with localStorage
  export const wishlistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    if (
        addToWishlist.match(action) ||
        removeFromWishlist.match(action) ||
        clearWishlist.match(action)
    ) {
      saveWishlistToLocalStorage(store.getState().wishList.items);
    }
    return result;
  };
export default wishlistSlice.reducer;
