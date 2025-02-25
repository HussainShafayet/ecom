import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getAllCategories, getBestSellingCategories, getFeaturedCategories, getFlashSaleCategories, getNewArrivalCategories} from "../../services/categoryService";

const initialState ={
    isLoading: false,
    categories: [],
    error: null,
    flash_sale_loading: false,
    flash_sale: [],
    flash_sale_error: null,
    new_arrival_loading: false,
    new_arrival: [],
    new_arrival_error: null,
    best_selling_loading: false,
    best_selling:[],
    best_selling_error: null,
    featured_loading: false,
    featured: [],
    featured_error: null,
}

export const fetchAllCategories = createAsyncThunk("category/fetchAllCategories", async ({page_size=null,page=1,})=>{
    const response =  await getAllCategories(page_size, page);
    console.log('get all categories res', response);
    return {data: response?.data?.data?.results || [], error: response?.message};
});

export const fetchFlashSaleCategories = createAsyncThunk("category/fetchFlashSaleCategories", async ({page_size=null,page=1,})=>{
    const response =  await getFlashSaleCategories(page_size, page);
    console.log('get flash sale categories res', response);
    return {data: response?.data?.data?.results || [], error: response?.message};
});

export const fetchNewArrivalCategories = createAsyncThunk("category/fetchNewArrivalCategories", async ({page_size=null,page=1,})=>{
    const response =  await getNewArrivalCategories(page_size, page);
    console.log('get new arrival categories res', response);
    return {data: response?.data?.data?.results || [], error: response?.message};
});

export const fetchBestSellingCategories = createAsyncThunk("category/fetchBestSellingCategories", async ({page_size=null,page=1,})=>{
    const response =  await getBestSellingCategories(page_size, page);
    console.log('get best selling categories res', response);
    return {data: response?.data?.data?.results || [], error: response?.message};
});

export const fetchFeaturedCategories = createAsyncThunk("category/fetchFeaturedCategories", async ({page_size=null,page=1,})=>{
    const response =  await getFeaturedCategories(page_size, page);
    console.log('get featured categories res', response);
    return {data: response?.data?.data?.results || [], error: response?.message};
});

const categorySlice = createSlice({
    name: 'category', 
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        //get all categories
        builder.addCase(fetchAllCategories.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchAllCategories.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.categories = action?.payload?.data;
            state.error = null
        });
        builder.addCase(fetchAllCategories.rejected,(state, action)=>{
            state.isLoading = false;
            state.categories = [];
            state.error = action?.error?.message  || 'Something went wrong!';
        });

         //get flash_sale categories
         builder.addCase(fetchFlashSaleCategories.pending, (state)=>{
            state.flash_sale_loading = true;
        });
        builder.addCase(fetchFlashSaleCategories.fulfilled,(state, action)=>{
            state.flash_sale_loading = false;
            state.flash_sale_error = null;
            state.flash_sale = action?.payload?.data;
        });
        builder.addCase(fetchFlashSaleCategories.rejected,(state, action)=>{
            state.flash_sale_loading = false;
            state.flash_sale = [];
            state.flash_sale_error = action?.error?.message  || 'Something went wrong!';
        });


         //get new arrival categories
         builder.addCase(fetchNewArrivalCategories.pending, (state)=>{
            state.new_arrival_loading = true;
        });
        builder.addCase(fetchNewArrivalCategories.fulfilled,(state, action)=>{
            state.new_arrival_loading = false;
            state.new_arrival = action?.payload?.data;
        });
        builder.addCase(fetchNewArrivalCategories.rejected,(state, action)=>{
            state.new_arrival_loading = false;
            state.new_arrival = [];
            state.new_arrival_error = action?.error?.message  || 'Something went wrong!';
        });


         //get best selling categories
         builder.addCase(fetchBestSellingCategories.pending, (state)=>{
            state.best_selling_loading = true;
        });
        builder.addCase(fetchBestSellingCategories.fulfilled,(state, action)=>{
            state.best_selling_loading = false;
            state.best_selling_error = null;
            state.best_selling = action?.payload?.data;
        });
        builder.addCase(fetchBestSellingCategories.rejected,(state, action)=>{
            state.best_selling_loading = false;
            state.best_selling = [];
            state.best_selling_error = action?.error?.message  || 'Something went wrong!';
        });


         //get featured categories
         builder.addCase(fetchFeaturedCategories.pending, (state)=>{
            state.featured_loading = true;
        });
        builder.addCase(fetchFeaturedCategories.fulfilled,(state, action)=>{
            state.featured_loading = false;
            state.featured_error = null;
            state.featured = action?.payload?.data;
        });
        builder.addCase(fetchFeaturedCategories.rejected,(state, action)=>{
            state.featured_loading = false;
            state.featured = [];
            state.featured_error = action?.error?.message  || 'Something went wrong!';
        });
    }
});

export default categorySlice.reducer;