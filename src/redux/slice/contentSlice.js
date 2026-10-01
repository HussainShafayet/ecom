import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {apiErrorMessage} from "../../api/errors";
import {getBestSellingContent, getCategoriesContent, getFeaturedContent, getFlashSaleContent, getHomeContent, getNewArrivalContent, getShopContent} from "../../services/contentService";

const initialState ={
    isLoading: false,
    image_sliders: [],
    video_sliders: [],
    categories: [],
    tags: [],
    brands: [],
    colors: [],
    sizes: [],
    price_range: {},
    discounts: [],
    left_banner: null,
    right_banner: null,
    mid_banner: null, // a wide banner between the Home page's sections (only the Home page has one)
    error: null,
    shopLoading: false, // the filters' lists (categories ... discounts) have their own flags: another content request must not draw or hide them
    shopLoaded: false,
    shopError: null,
}

export const fetchHomeContent = createAsyncThunk("content/fetchHomeContent", async ()=>{
    const response =  await getHomeContent();
    console.log('get home page content res', response);
    return {data: response?.data?.data, error: response?.message};
});

export const fetchNewArrivalContent = createAsyncThunk("content/fetchNewArrivalContent", async ()=>{
    const response =  await getNewArrivalContent();
    console.log('get new arrival content res', response);
    return {data: response?.data?.data, error: response?.message};
});

export const fetchFlashSaleContent = createAsyncThunk("content/fetchFlashSaleContent", async ()=>{
    const response =  await getFlashSaleContent();
    console.log('get flash sale content res', response);
    return {data: response?.data?.data, error: response?.message};
});

export const fetchBestSellingContent = createAsyncThunk("content/fetchBestSellingContent", async ()=>{
    const response =  await getBestSellingContent();
    console.log('get best sale content res', response);
    return {data: response?.data?.data, error: response?.message};
});

export const fetchFeaturedContent = createAsyncThunk("content/fetchFeaturedContent", async ()=>{
    const response =  await getFeaturedContent();
    console.log('get featured content res', response);
    return {data: response?.data?.data, error: response?.message};
});

// the lists the products page filters by. A failure is a sentence (apiErrorMessage), never a raw status line.
export const fetchShopContent = createAsyncThunk("content/fetchShopContent", async (_, {rejectWithValue})=>{
    try {
        const response =  await getShopContent();
        return {data: response?.data?.data};
    } catch (error) {
        return rejectWithValue(apiErrorMessage(error));
    }
});

export const fetchCategoriesContent = createAsyncThunk("content/fetchCategoriesContent", async ()=>{
    const response =  await getCategoriesContent();
    console.log('get categories content res', response);
    return {data: response?.data?.data, error: response?.message};
});

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
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            state.mid_banner = action?.payload?.data?.page_content?.mid_banner ?? null;
        });
        builder.addCase(fetchHomeContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.mid_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });


        //get all new Arrival content
        builder.addCase(fetchNewArrivalContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchNewArrivalContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            
        });
        builder.addCase(fetchNewArrivalContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });

        //get all flash sale content
        builder.addCase(fetchFlashSaleContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchFlashSaleContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            
        });
        builder.addCase(fetchFlashSaleContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });


        //get best sale content
        builder.addCase(fetchBestSellingContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchBestSellingContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            
        });
        builder.addCase(fetchBestSellingContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });


        //get featured content
        builder.addCase(fetchFeaturedContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchFeaturedContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            
        });
        builder.addCase(fetchFeaturedContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });


        //get shop content
        builder.addCase(fetchShopContent.pending, (state)=>{
            state.shopLoading = true;
            state.shopError = null;
        });
        builder.addCase(fetchShopContent.fulfilled,(state, action)=>{
            const shop = action?.payload?.data;
            state.shopLoading = false;
            state.shopLoaded = true;
            state.categories =  shop?.categories || [];
            state.tags =  shop?.tags || [];
            state.brands =  shop?.brands || [];
            state.colors =  shop?.colors || [];
            state.sizes =  shop?.sizes || [];
            state.price_range =  shop?.price_range || {};
            state.discounts =  shop?.discounts || [];
        });
        builder.addCase(fetchShopContent.rejected,(state, action)=>{
            state.shopLoading = false;
            state.shopError = action?.payload || action?.error?.message || 'Something went wrong!'; // what was loaded before stays
        });


        //get categories  content
        builder.addCase(fetchCategoriesContent.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchCategoriesContent.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.image_sliders = action?.payload?.data?.page_content?.image_sliders;
            state.video_sliders = action?.payload?.data?.page_content?.video_sliders;
            state.left_banner = action?.payload?.data?.page_content?.left_banner;
            state.right_banner = action?.payload?.data?.page_content?.right_banner;
            
        });
        builder.addCase(fetchCategoriesContent.rejected,(state, action)=>{
            state.isLoading = false;
            state.image_sliders = [];
            state.video_sliders = [];
            state.left_banner = null;
            state.right_banner = null;
            state.error = action?.error?.message  || 'Something went wrong!';
        });

        
    }
});

export default contentSlice.reducer;