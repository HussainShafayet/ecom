import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {logoutUser} from "./authSlice";

const initialState = {
    reviewLoading: false,
    reviews: [],
    reviewsFor: null, // the product the reviews in the list belong to
    reviewsCount: 0, // how many the shop has (the list holds the pages read so far, 30 each, newest first)
    reviewsPage: 0, // the last page read
    reviewsHasMore: false,
    reviewsMoreLoading: false,
    reviewError: null,
    can_review: false,
    // Why the signed-in customer may not review yet: 'can_review' | 'reviewed' | 'waiting_for_delivery' |
    // 'not_purchased' | 'guest'. With 'waiting_for_delivery', review_order_id is the order they are waiting for.
    review_status: null,
    review_order_id: null,

    reviewFormData: {
        product_id: '',
        rating: 0,
        comment: '',
        media: [],
    },

    addReviewLoading: false,
    addReviewError: null,
    addReviewCompleted: false,
    updateReviewCompleted: false,
}
//get reivews 
export const fetchReviews = createAsyncThunk('review/fetchRevies', async (product_id, {rejectWithValue}) =>{
    try {
        // Import axiosSetup only when debounceneeded to avoid circular dependency issues
        const api = (await import('../../api/axiosSetup')).default;
        const response = await api.get(`/products/reviews/?product_id=${product_id}`, { section: "get-review", optionalAuth: true});
       return response.data.data;
     } catch (error) {
       return rejectWithValue(error.response.data);
     }
} );

// the next page of the same product's reviews (30 each), added under the ones already there
export const fetchMoreReviews = createAsyncThunk('review/fetchMoreReviews', async (product_id, {getState, rejectWithValue}) =>{
    try {
        const api = (await import('../../api/axiosSetup')).default;
        const page = getState().review.reviewsPage + 1;
        const response = await api.get(`/products/reviews/?product_id=${product_id}&page=${page}`, { section: "more-reviews", optionalAuth: true});
        return { ...response.data.data, page };
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
}, {
    // one page at a time: a second tap while the first is on its way would ask for the same page twice
    condition: (_, {getState}) => !getState().review.reviewsMoreLoading,
});

//add reivew 
export const createReview = createAsyncThunk('review/createReview', async (formData, {rejectWithValue}) =>{
    try {
        // Import axiosSetup only when needed to avoid circular dependency issues
        const api = (await import('../../api/axiosSetup')).default;
        const response = await api.post(`/products/reviews/`, formData, { section: "create-review"});
       return response.data.data;
     } catch (error) {
       return rejectWithValue(error.response.data);
     }
} );

//update reivew 
export const updateReview = createAsyncThunk('review/updateReview', async ({formData, review_id}, {rejectWithValue}) =>{
    try {
        // Import axiosSetup only when needed to avoid circular dependency issues
        const api = (await import('../../api/axiosSetup')).default;
        const response = await api.put(`/products/reviews/${review_id}/`, formData, { section: "update-review"});
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
            state.reviewFormData.media = [...state.reviewFormData.media, ...action.payload]
        },
        updateReviewFormData : (state, action ) => {
            state.reviewFormData = {...state.reviewFormData, ...action.payload}
        },
        // a picked file the customer changed their mind about (an index of `reviewFormData.media`)
        removeMediaAt: (state, action) => {
            state.reviewFormData.media = state.reviewFormData.media.filter((_, index) => index !== action.payload)
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
        .addCase(fetchReviews.pending, (state, action)=>{
            state.reviewLoading = true;
            if (state.reviewsFor !== action.meta.arg) {
                // another product: the previous one's reviews must not stay under it while these arrive
                state.reviews = [];
                state.reviewsCount = 0;
                state.reviewsPage = 0;
                state.reviewsHasMore = false;
                state.reviewsFor = action.meta.arg;
            }
        })
        .addCase(fetchReviews.fulfilled, (state, action)=>{
            state.reviewLoading = false;
            state.reviewError = false;
            state.reviews = action.payload?.results || [];
            state.reviewsCount = action.payload?.count ?? state.reviews.length;
            state.reviewsPage = 1;
            state.reviewsHasMore = Boolean(action.payload?.next);
            state.can_review = action.payload?.can_review || false;
            state.review_status = action.payload?.review_status || null;
            state.review_order_id = action.payload?.order_id || null;
        })
        .addCase(fetchReviews.rejected, (state, action)=>{
            state.reviewLoading = false;
            state.reviewError = action.payload?.error || 'Something wend wrong!';
        })

        //more reviews (the next page)
        .addCase(fetchMoreReviews.pending, (state)=>{
            state.reviewsMoreLoading = true;
        })
        .addCase(fetchMoreReviews.fulfilled, (state, action)=>{
            state.reviewsMoreLoading = false;
            const known = new Set(state.reviews.map((review) => review.id));
            // a review written meanwhile moves the pages by one: what is already in the list is not added twice
            state.reviews = [...state.reviews, ...(action.payload?.results || []).filter((review) => !known.has(review.id))];
            state.reviewsCount = action.payload?.count ?? state.reviewsCount;
            state.reviewsPage = action.payload.page;
            state.reviewsHasMore = Boolean(action.payload?.next);
        })
        .addCase(fetchMoreReviews.rejected, (state)=>{
            state.reviewsMoreLoading = false;
        })


         //create to review 
         .addCase(createReview.pending, (state)=>{
            state.addReviewLoading = true;
            state.addReviewCompleted = false;
        })
        .addCase(createReview.fulfilled, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = false;
            state.addReviewCompleted = false;
            state.reviews = [action.payload, ...state.reviews]; // newest first, like the list the shop sends
            state.reviewsCount += 1;
            state.addReviewCompleted = true;
            // one review per product: the form must not stay open for a second one
            state.can_review = false;
            state.review_status = 'reviewed';
            state.review_order_id = null;
        })
        .addCase(createReview.rejected, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = action?.payload?.error || 'Something went wrong!';
        })

        //update to review 
        .addCase(updateReview.pending, (state)=>{
            state.addReviewLoading = true;
            state.updateReviewCompleted = false;
        })
        .addCase(updateReview.fulfilled, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = false;
            // Find the index of the review to update
            const index = state.reviews.findIndex(review => review.id === action.payload.id);
            
            if (index !== -1) {
                // Replace the old review with the updated one
                state.reviews[index] = { ...state.reviews[index], ...action.payload };
            }
            state.updateReviewCompleted = true;
        })
        .addCase(updateReview.rejected, (state, action)=>{
            state.addReviewLoading = false;
            state.addReviewError = action?.payload?.error || 'Something went wrong!';
        })
        //nothing of one customer's reviews (which ones they may edit, whether they may review) stays for the next
        .addMatcher(isAnyOf(logoutUser.fulfilled, logoutUser.rejected), () => initialState)
    }),
});

export const {setMediaFiles, removeMediaAt, updateReviewFormData, resetReviewFormData} = reviewSlice.actions;
export default reviewSlice.reducer;