import { createSlice } from "@reduxjs/toolkit";

const globalErrorSlice = createSlice({
  name: "globalError",
  initialState: {
    globalError: null, // For app-wide critical errors
    sectionErrors: {}, // For section-specific errors (e.g., { "flash-sale": "API failed" })
  },
  reducers: {
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
      state.sectionErrors = {}; // Clear section errors if global error occurs
    },
    setSectionError: (state, action) => {
      const { section, error } = action.payload;
      state.sectionErrors[section] = error;
    },
    clearSectionError: (state, action) => {
      delete state.sectionErrors[action.payload];
    },
    clearAllErrors: (state) => {
      state.globalError = null;
      state.sectionErrors = {};
    },
  },
});

export const { setGlobalError, setSectionError, clearSectionError, clearAllErrors } = globalErrorSlice.actions;
export default globalErrorSlice.reducer;