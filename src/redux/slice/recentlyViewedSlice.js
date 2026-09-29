// src/redux/slice/recentlyViewedSlice.js
import { createSlice } from '@reduxjs/toolkit';

const MAX_RECENTLY_VIEWED = 12;

const initialState = {
  items: [],
  ids: {},
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    recordViewed: (state, action) => {
      const product = action.payload;
      if (!product || !product.id) {
        console.error("Invalid product:", product);
        return;
      }

      // move to the front if already seen, then enforce the cap
      state.items = state.items.filter((item) => item.id !== product.id);
      state.items.unshift(product);
      state.items.length = Math.min(state.items.length, MAX_RECENTLY_VIEWED);

      const ids = {};
      state.items.forEach((item) => { ids[item.id] = item.id; });
      state.ids = ids;
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
      state.ids = {};
    },
  },
});

export const { recordViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;

export const selectRecentlyViewed = (state) => state.recentlyViewed.items;

export default recentlyViewedSlice.reducer;
