import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getBestSellingContent, getFlashSaleContent, getHomeContent, getNewArrivalContent} from "../../services/contentService";

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

export const fetchNewArrivalContent = createAsyncThunk("content/fetchNewArrivalContent", async ()=>{
    const response =  await getNewArrivalContent();
    console.log('get new arrival content res', response);
    return {data: response.data.data, error: response.message};
});

export const fetchFlashSaleContent = createAsyncThunk("content/fetchFlashSaleContent", async ()=>{
    const response =  await getFlashSaleContent();
    console.log('get flash sale content res', response);
    return {data: response.data.data, error: response.message};
});

export const fetchBestSellingContent = createAsyncThunk("content/fetchBestSellingContent", async ()=>{
    const response =  await getBestSellingContent();
    console.log('get best sale content res', response);
    return {data: response.data.data, error: response.message};
});

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
        //get all home page content
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


        //get all new Arrival content
        builder.addCase(fetchNewArrivalContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchNewArrivalContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = action.payload.data.page_content.image_sliders;
            state.video_sliders = action.payload.data.page_content.video_sliders;
            state.left_banner = action.payload.data.page_content.left_banner;
            state.right_banner = action.payload.data.page_content.right_banner;
            state.error = null;
        });
        builder.addCase(fetchNewArrivalContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action.error.message;
        });

        //get all flash sale content
        builder.addCase(fetchFlashSaleContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchFlashSaleContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = action.payload.data.page_content.image_sliders;
            state.video_sliders = action.payload.data.page_content.video_sliders;
            state.left_banner = action.payload.data.page_content.left_banner;
            state.right_banner = action.payload.data.page_content.right_banner;
            state.error = null;
        });
        builder.addCase(fetchFlashSaleContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action.error.message;
        });


        //get best sale sale content
        builder.addCase(fetchBestSellingContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchBestSellingContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = action.payload.data.page_content.image_sliders;
            state.video_sliders = action.payload.data.page_content.video_sliders;
            state.left_banner = action.payload.data.page_content.left_banner;
            state.right_banner = action.payload.data.page_content.right_banner;
            state.error = null;
        });
        builder.addCase(fetchBestSellingContent.rejected,(state, action)=>{
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