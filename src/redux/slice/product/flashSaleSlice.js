import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getFlashSaleProducts} from "../../../services/productService";

const initialState = {
    flash_sale_Loading: false,
    flash_sale_error: null,
    flash_sale: [],
    hasMore: true,
    relatedProductsLoading: false,
}
//get flash sale products
export const fetchFlashSaleProducts = createAsyncThunk("product/fetchFlashSaleProducts", async ({page=1, page_size=null})=>{
    let response = await getFlashSaleProducts(page, page_size);
    console.log('get flash sale product res', response);

    return {data: response?.data?.data?.results || [], next: response?.data?.data?.next || null, error: response.message};
});

const flashSaleSlice = createSlice({
    name: 'flash_sale',
    initialState,
    extraReducers: (builder)=>{
        //get flash sale products
        builder.addCase(fetchFlashSaleProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.flash_sale_Loading = true;
        });
        builder.addCase(fetchFlashSaleProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.flash_sale_Loading = false;
            state.flash_sale_error = null;
            state.flash_sale = action.meta.arg.page > 1
            ? [...state.flash_sale, ...action?.payload?.data]
            : action?.payload?.data;
            state.hasMore = Boolean(action?.payload?.next); // the backend says whether another page exists
        });
        builder.addCase(fetchFlashSaleProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.flash_sale_Loading = false;
            //state.products = [];
            state.flash_sale_error = action?.error?.message || 'Something went wrong';
        });
    }
});

export default flashSaleSlice.reducer;