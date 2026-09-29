import { createSlice } from '@reduxjs/toolkit';

// Short messages that appear over the page and go away by themselves: something that did not work but does not belong to
// one place on the page (a request nobody is waiting on visibly failed), or news (back online). Not persisted.
// `type` is 'error', 'success' or 'info'.
const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    showToast: (state, action) => {
      const { id, message, type } = action.payload;
      // The same sentence twice in a row (five failed requests, one cause) is one toast
      if (state.items.some((item) => item.message === message && item.type === type)) return;
      state.items.push({ id, message, type });
    },
    dismissToast: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;

let nextId = 1;

// Shows a toast and removes it again after `ms`.
export const pushToast = (message, type = 'info', ms = 6000) => (dispatch) => {
  const id = nextId++;
  dispatch(showToast({ id, message, type }));
  setTimeout(() => dispatch(dismissToast(id)), ms);
};

export const selectToasts = (state) => state.toast?.items || [];

export default toastSlice.reducer;
