import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getFeaturedReviews } from '../../services/reviewService';

const initialState = {
  reviews: [], // GET /products/reviews/featured/: what the homepage's "What Our Customers Say" draws
  isLoading: false,
};

// Only decoration: a failed request keeps what there was (nothing, the first time) and says nothing
export const fetchTestimonials = createAsyncThunk('testimonials/fetchTestimonials', async (_, { rejectWithValue }) => {
  try {
    const response = await getFeaturedReviews();
    const reviews = response?.data?.data?.reviews;
    return Array.isArray(reviews) ? reviews : [];
  } catch (error) {
    return rejectWithValue(error?.response?.data);
  }
});

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchTestimonials.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default testimonialsSlice.reducer;
