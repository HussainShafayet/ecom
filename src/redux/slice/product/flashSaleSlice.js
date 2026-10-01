import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getFlashSaleProducts} from "../../../services/productService";
import {anchorFlashSale} from "../../../utils/flashSale";

const initialState = {
    flash_sale_Loading: false,
    flash_sale_error: null,
    flash_sale: [],
    flash_window: null, // `{isLive, startsAt, endsAt}` (moments on this device's clock), or null when the shop set no window
    hasMore: true,
    relatedProductsLoading: false,
}
//get flash sale products
export const fetchFlashSaleProducts = createAsyncThunk("product/fetchFlashSaleProducts", async ({page=1, page_size=null})=>{
    const response = await getFlashSaleProducts(page, page_size);
    // the window (docs/API_CONTRACT.md): the seconds left become moments on this clock as of now, when the answer arrived
    return {data: response?.data?.data?.results || [], next: response?.data?.data?.next || null, window: anchorFlashSale(response?.data?.data?.flash_sale)};
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
            state.flash_window = action?.payload?.window || null;
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