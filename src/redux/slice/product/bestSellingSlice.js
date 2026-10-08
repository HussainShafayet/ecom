import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getBestSellingProducts} from "../../../services/productService";

const initialState = {
    best_selling_Loading: false,
    best_selling: [],
    best_selling_error: null,
    hasMore: true,
    relatedProductsLoading: false,
}

//get Best Selling products
export const fetchBestSellingProducts = createAsyncThunk("product/fetchBestSellingProducts", async ({page=1, page_size=null})=>{
    let response = await getBestSellingProducts(page, page_size);

    return {data: response?.data?.data?.results, next: response?.data?.data?.next || null, error: response?.message};
});

const bestSellingSlice = createSlice({
    name: 'best_selling',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //get bestSelling products
        builder.addCase(fetchBestSellingProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.best_selling_Loading = true;
        });
        builder.addCase(fetchBestSellingProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.best_selling_Loading = false;
            state.best_selling_error = null;
            state.best_selling = action.meta.arg.page > 1
            ? [...state.best_selling, ...(action?.payload?.data || [])]
            : action?.payload?.data || [];
            state.hasMore = Boolean(action?.payload?.next); // the backend says whether another page exists
        });
        builder.addCase(fetchBestSellingProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.best_selling_Loading = false;
            //state.products = [];
            state.best_selling_error = action?.error?.message || 'Something went wrong';
        });
    }
});

export default bestSellingSlice.reducer;