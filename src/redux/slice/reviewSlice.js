import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {updateAddressFormData} from "./profileSlice";

const initialState = {
    reviewLoading: false,
    reviews: [],
    reviewError: null,
    can_review: false,

    reviewFormData: {
        product_id: '',
        rating: 0,
        comment: '',
        media: [],
    },

    addReviewLoading: false,
    addReviewError: null,
    addReviewCompleted: false,
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

//add reivew 
export const createReview = createAsyncThunk('review/createReview', async (formData, {rejectWithValue}) =>{
    try {
        // Import axiosSetup only when needed to avoid circular dependency issues
        const api = (await import('../../api/axiosSetup')).default;
        const response = await api.post(`products/reviews/`, formData);
       console.log('create review response', response);
       return response.data.data;
     } catch (error) {
       return rejectWithValue(error.response.data);
     }
} );

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        setMediaFiles : (state, action) => {
            state.reviewFormData.media = [...state.reviewFormData.media, action.payload]
        },
        updateReviewFormData : (state, action ) => {
            state.reviewFormData = {...state.reviewFormData, ...action.payload}
        },
        resetReviewFormData: (state)=> {
            state.reviewFormData = {
                product_id: '',
                rating: 0,
                comment: '',
                media: [],
            }
        }
    },
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


         //create to review 
         .addCase(createReview.pending, (state)=>{
            state.addReviewLoading = true;
        })
        .addCase(createReview.fulfilled, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = false;
            state.reviews = [...state.reviews, action.payload];
            state.addReviewCompleted = true;
        })
        .addCase(createReview.rejected, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = action.payload.error;
        })
    }),
});

export const {setMediaFiles,updateReviewFormData, resetReviewFormData} = reviewSlice.actions;
export default reviewSlice.reducer;