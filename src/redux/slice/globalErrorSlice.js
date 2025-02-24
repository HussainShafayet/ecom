import { createSlice } from "@reduxjs/toolkit";

const globalErrorSlice = createSlice({
  name: "globalError",
  initialState: {
    message: null,  // Stores global API error message
    hasError: false // Tracks if an error exists
  },
  reducers: {
    setGlobalError: (state, action) => {
      state.message = action.payload;
      state.hasError = true;  // Set error flag
    },
    clearGlobalError: (state) => {
      state.message = null;
      state.hasError = false; // Reset error flag
    }
  },
});

export const { setGlobalError, clearGlobalError } = globalErrorSlice.actions;
export default globalErrorSlice.reducer;
