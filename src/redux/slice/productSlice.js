import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getAllProducts, getFeaturedProducts, getProductById} from "../../services/productService";
import publicApi from "../../api/publicApi";
const initialState = {
    isLoading: false,
    relatedProductsLoading: false,
    items: [],
    flash_sale_Loading: false,
    flash_sale_error: null,
    flash_sale: [],
    featured_Loading: false,
    featured: [],
    featured_error: null,
    error: null,
    product: null,
    mainImage: null,
    quantity: 1,
    minimum_quantity:1,
    hasMore: true,
    isSidebarOpen: false,
    sortType: '',
    selectedColor: null,
    selectedSize: null,
    suggestionsLoading: false,
    suggestions: [],
    suggestionsError: null,
}

//get all products
export const fetchAllProducts = createAsyncThunk("product/fetchAllProducts", async ({page_size=null,ordering=null, page=1,category = null, brands=[], tags=[], min_price=0, max_price=0, sizes=[], colors=[],discount_type, discount_value, search=""})=>{

    let response = await getAllProducts(page_size, ordering, page, category, brands,tags, min_price, max_price, sizes, colors,discount_type, discount_value,search);
    console.log('get all product res', response);
    
    return {data: response?.data?.data?.results || [], error: response.message};
});

//get featured products
export const fetchFeaturedProducts = createAsyncThunk("product/fetchFeaturedProducts", async ({page=1, page_size=null})=>{
    let response = await getFeaturedProducts(page, page_size);
    console.log('get fetured products res', response);
    
    return {data: response?.data?.data?.results || [], error: response.message};
});

// Fetch a single product by its slug
export const fetchProductById = createAsyncThunk("product/getProductById", async (slug, {rejectWithValue}) => {
    try {
      const response = await getProductById(slug);
      console.log('get product res', response);
      return response?.data?.data || [];
    } catch (error) {
      console.error(`Error fetching product with ID ${slug}:`, error);
      throw error;  // Let the caller handle the error
    }
  });

  //search suggestions
  export const searchSuggestions = createAsyncThunk('product/searchSuggestions', async (searchValue, { rejectWithValue , getState}) => {
    try {
        const {isAuthenticated} = getState().auth;
        let response;
        if (isAuthenticated) {
            // Import axiosSetup only when needed to avoid circular dependency issues
            const api = (await import('../../api/axiosSetup')).default;
            response = await api.get(`/products/search-suggestions/?q=${searchValue}`, { section: "search-suggestions"});
        } else {
            response = await publicApi.get(`/products/search-suggestions/?q=${searchValue}`, { section: "search-suggestions"});
        }
       
  
      console.log('suggestions response',response);
      
      return response?.data?.data || [];
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  });


const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setMainImage: (state, action)=>{
            state.mainImage = action.payload
        },
        incrementQuantity: (state, action) =>{
            state.quantity +=  1;
        },
        decrementQuantity: (state, action) =>{
            state.quantity =  Math.max(state.minimum_quantity, state.quantity - 1);
        },
        setIsSidebarOpen: (state, action)=>{
            state.isSidebarOpen = action.payload;
        },
        setSortType: (state, action)=>{
            state.sortType = action.payload;
        }, 
        setSelectedColor: (state, action)=>{
            state.selectedColor = action.payload
        },
        setSelectedSize: (state, action)=>{
            state.selectedSize = action.payload
        },
        suggestionsInputTime: (state) =>{
            state.suggestionsLoading = true;
        },
    },
    extraReducers: (builder)=>{

        //get all products
        builder.addCase(fetchAllProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.isLoading = true;
        });
        builder.addCase(fetchAllProducts.fulfilled,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.error = null;
            state.items = action.meta.arg.page > 1 
            ? [...state.items, ...action?.payload?.data] 
            : action?.payload?.data;
        state.hasMore = action?.payload?.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action?.payload?.data?.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchAllProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action?.error?.message || 'Something went wrong';
        });


        //get fetured products
        builder.addCase(fetchFeaturedProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.featured_Loading = true;
        });
        builder.addCase(fetchFeaturedProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.featured_Loading = false;
            state.featured_error = null;
            state.featured = action.meta.arg.page > 1 
            ? [...state.featured, ...action?.payload?.data] 
            : action?.payload?.data;
            state.hasMore = action?.payload?.data?.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action?.payload?.data?.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchFeaturedProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.featured_Loading = false;
            //state.products = [];
            state.featured_error = action?.error?.message || 'Something went wrong';
        });


        //get single product
        builder.addCase(fetchProductById.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchProductById.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.error = null;
            state.product = action.payload;
            //state.mainImage = action.payload.media_files[0];
            const product = action.payload;
            if (product?.colors?.length > 0 ) {
                state.selectedColor = product.colors[0];
                state.mainImage =  product.colors[0].media_files[0];
                state.selectedSize = product.colors[0].sizes[0];
            } else {
                state.selectedColor = null;
                state.mainImage = action.payload.media_files[0];
                if (action.payload?.sizes?.length > 0) {
                    state.selectedSize = action.payload.sizes[0];
                }
            }

            //set quantity initial
            state.minimum_quantity = action.payload?.minimum_order_quantity;
            state.quantity = action.payload?.minimum_order_quantity;
        });
        builder.addCase(fetchProductById.rejected,(state, action)=>{
            state.isLoading = false;
            state.product = null;
            console.log(action.payload);
            
            state.error = action?.payload?.message || 'Something went wrong';
        });

        //get search suggestions
        builder.addCase(searchSuggestions.pending, (state)=>{
            state.suggestionsLoading = true;
        });
        builder.addCase(searchSuggestions.fulfilled,(state, action)=>{
            state.suggestionsLoading = false;
            state.suggestionsError = null;
            state.suggestions = action.payload;
            
        });
        builder.addCase(searchSuggestions.rejected,(state, action)=>{
            state.suggestionsLoading = false;
            state.suggestions = [];
            state.suggestionsError = action.payload.message;
        });
    }
});

export const {setMainImage,incrementQuantity, decrementQuantity, setIsSidebarOpen, setSortType, setSelectedColor, setSelectedSize, suggestionsInputTime} = productSlice.actions;
export default productSlice.reducer;