import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

const initialState = {
    reviewLoading: false,
    reviews: [],
    reviewError: null,
    can_review: false,
}
//get reivews 
export const fetchReviews = createAsyncThunk('review/fetchRevies', async (product_id, {rejectWithValue}) =>{
    try {
        // Import axiosSetup only when needed to avoid circular dependency issues
        const api = (await import('../../api/axiosSetup')).default;
        const response = await api.get(`products/reviews/?product_id=${product_id}`);
       console.log('fetch reviews response', response);
       return response.data.data;
     } catch (error) {
       return rejectWithValue(error.response.data);
     }
} );

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    extraReducers: ((builder)=>{
        builder
        //fetch to reviews 
        .addCase(fetchReviews.pending, (state)=>{
            state.reviewLoading = true;
        })
        .addCase(fetchReviews.fulfilled, (state, action)=>{
            state.reviewLoading = false;
            state.reviewError = false;
            state.reviews = action.payload?.results || [];
            state.can_review = action.payload?.can_review || false;
        })
        .addCase(fetchReviews.rejected, (state, action)=>{
            state.reviewLoading = false;
            state.reviewError = action.payload.error;
        })
    }),
});

export default reviewSlice.reducer;