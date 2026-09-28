import {createAsyncThunk, createSlice} from "@reduxjs/toolkit"
import {getNewArrivalProducts} from "../../../services/productService";

const initialState = {

    new_arrival_Loading: false,
    new_arrival: [],
    new_arrival_error: null,
    hasMore: true,
    relatedProductsLoading: false,
}

//get new arrival products
export const fetchNewArrivalProducts = createAsyncThunk("product/fetchNewArrivalProducts", async ({page=1, page_size=null})=>{
    let response = await getNewArrivalProducts(page, page_size);
    console.log('get new arrival product res', response);

    return {data: response?.data?.data?.results || [], next: response?.data?.data?.next || null, error: response?.message};
});

const newArrivalSlice = createSlice({
    name: 'new_arrival',
    initialState,
    reducers: {
        
    },
    extraReducers: (builder) => {
      //get NewArrival products
        builder.addCase(fetchNewArrivalProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.new_arrival_Loading = true;
        });
        builder.addCase(fetchNewArrivalProducts.fulfilled,(state, action)=>{
            state.relatedProductsLoading = false;
            state.new_arrival_Loading = false;
            state.new_arrival_error = null;
            state.new_arrival = action.meta.arg.page > 1
            ? [...state.new_arrival, ...action?.payload?.data]
            : action?.payload?.data;
            state.hasMore = Boolean(action?.payload?.next); // the backend says whether another page exists
        });
        builder.addCase(fetchNewArrivalProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.new_arrival_Loading = false;
            //state.products = [];
            
            state.new_arrival_error = action?.error?.message || 'Something went wrong';
        });  
    }
});

export default newArrivalSlice.reducer;