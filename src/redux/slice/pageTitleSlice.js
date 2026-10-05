// The name of the page being looked at, for the browser tab. Pages say it through `hooks/usePageTitle`; `Layout` is the only writer of
// `document.title` (it also knows the shop's name), so two things can never fight over the tab.
import { createSlice } from '@reduxjs/toolkit';

const pageTitleSlice = createSlice({
  name: 'pageTitle',
  initialState: { title: '' },
  reducers: {
    setPageTitle: (state, action) => {
      state.title = typeof action.payload === 'string' ? action.payload : '';
    },
  },
});

export const { setPageTitle } = pageTitleSlice.actions;
export const selectPageTitle = (state) => state.pageTitle?.title || '';
export default pageTitleSlice.reducer;
