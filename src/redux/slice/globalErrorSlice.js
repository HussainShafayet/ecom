import { createSlice } from "@reduxjs/toolkit";

// Errors of one part of the page, by the `section` a request was made with (e.g. { "flash-sale": "..." }). The part reads
// its own and shows it where it would have been (`SectionError`); nothing here ever replaces the whole page.
const globalErrorSlice = createSlice({
  name: "globalError",
  initialState: {
    sectionErrors: {},
  },
  reducers: {
    setSectionError: (state, action) => {
      const { section, error } = action.payload;
      state.sectionErrors[section] = error;
    },
    clearSectionError: (state, action) => {
      delete state.sectionErrors[action.payload];
    },
    clearAllErrors: (state) => {
      state.sectionErrors = {};
    },
  },
});

export const { setSectionError, clearSectionError, clearAllErrors } = globalErrorSlice.actions;
export default globalErrorSlice.reducer;
