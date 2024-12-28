import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getAllCategories, getFlashSaleCategories} from "../../services/categoryService";

const initialState ={
    isLoading: false,
    categories: [],
    flash_sale: [],
    error: null,
}

export const fetchAllCategories = createAsyncThunk("category/fetchAllCategories", async ({page_size=null,page=1,})=>{
    const response =  await getAllCategories(page_size, page);
    console.log('get all categories res', response);
    return {data: response.data.data.results, error: response.message};
});

export const fetchFlashSaleCategories = createAsyncThunk("category/fetchFlashSaleCategories", async ({page_size=null,page=1,})=>{
    const response =  await getFlashSaleCategories(page_size, page);
    console.log('get flash sale categories res', response);
    return {data: response.data.data.results, error: response.message};
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
            state.categories = action.payload.data;
            state.error = null
        });
        builder.addCase(fetchAllCategories.rejected,(state, action)=>{
            state.isLoading = false;
            state.categories = [];
            state.error = action.error.message;
        });

         //get all categories
         builder.addCase(fetchFlashSaleCategories.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchFlashSaleCategories.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.flash_sale = action.payload.data;
            state.error = null
        });
        builder.addCase(fetchFlashSaleCategories.rejected,(state, action)=>{
            state.isLoading = false;
            state.flash_sale = [];
            state.error = action.error.message;
        });
    }
});

export default categorySlice.reducer;