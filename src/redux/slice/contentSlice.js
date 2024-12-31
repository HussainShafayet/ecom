import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getHomeContent} from "../../services/contentService";

const initialState ={
    isLoading: false,
    image_sliders: [],
    video_sliders: [],
    left_banner: null,
    right_banner: null,
    error: null,
}

export const fetchHomeContent = createAsyncThunk("content/fetchHomeContent", async ()=>{
    const response =  await getHomeContent();
    console.log('get home page content res', response);
    return {data: response.data.data, error: response.message};
});

//export const fetchFlashSaleCategories = createAsyncThunk("category/fetchFlashSaleCategories", async ({page_size=null,page=1,})=>{
//    const response =  await getFlashSaleCategories(page_size, page);
//    console.log('get flash sale categories res', response);
//    return {data: response.data.data.results, error: response.message};
//});

//export const fetchNewArrivalCategories = createAsyncThunk("category/fetchNewArrivalCategories", async ({page_size=null,page=1,})=>{
//    const response =  await getNewArrivalCategories(page_size, page);
//    console.log('get new arrival categories res', response);
//    return {data: response.data.data.results, error: response.message};
//});

//export const fetchBestSellingCategories = createAsyncThunk("category/fetchBestSellingCategories", async ({page_size=null,page=1,})=>{
//    const response =  await getBestSellingCategories(page_size, page);
//    console.log('get best selling categories res', response);
//    return {data: response.data.data.results, error: response.message};
//});

//export const fetchFeaturedCategories = createAsyncThunk("category/fetchFeaturedCategories", async ({page_size=null,page=1,})=>{
//    const response =  await getFeaturedCategories(page_size, page);
//    console.log('get featured categories res', response);
//    return {data: response.data.data.results, error: response.message};
//});

const contentSlice = createSlice({
    name: 'content', 
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        //get all categories
        builder.addCase(fetchHomeContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchHomeContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = action.payload.data.page_content.image_sliders;
            state.video_sliders = action.payload.data.page_content.video_sliders;
            state.left_banner = action.payload.data.page_content.left_banner;
            state.right_banner = action.payload.data.page_content.right_banner;
            state.error = null;
        });
        builder.addCase(fetchHomeContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action.error.message;
        });

        
    }
});

export default contentSlice.reducer;