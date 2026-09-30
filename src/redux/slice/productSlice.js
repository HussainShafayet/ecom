import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getAllProducts, getFeaturedProducts, getProductById} from "../../services/productService";
import publicApi from "../../api/publicApi";
import {apiErrorMessage} from "../../api/errors";
// The most one cart line can hold (backend apps/cart/services.py MAX_QUANTITY)
export const MAX_QUANTITY = 10000;

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
    count: null, // how many products the shop has for the list that is loaded (the backend's `count`)
    isLoadingMore: false, // `isLoading` for the page after the first: the list stays on the screen
    listKey: null, // which list `items` is (the page's query string; undefined when another page asked), so a page never draws another's
    listPage: 1, // the last page of it that was loaded
    listRequestId: null, // the request whose answer counts; an older one that arrives late is ignored
    selectedColor: null,
    selectedSize: null,
    suggestionsLoading: false,
    suggestions: [],
    suggestionsError: null,
}

//get all products. `page` > 1 is the next page of the same list (it is added under the first); `key` names the list (the
//products page passes its query string) so the page can tell its own list from one another page loaded
export const fetchAllProducts = createAsyncThunk("product/fetchAllProducts", async ({page_size=null,ordering=null, page=1,category = null, brands=[], tags=[], min_price=0, max_price=0, sizes=[], colors=[],discount_type, discount_value, search=""}, {rejectWithValue})=>{
    try {
        const response = await getAllProducts(page_size, ordering, page, category, brands,tags, min_price, max_price, sizes, colors,discount_type, discount_value,search);
        return {data: response?.data?.data?.results || [], next: response?.data?.data?.next || null, count: response?.data?.data?.count ?? null};
    } catch (error) {
        return rejectWithValue(apiErrorMessage(error)); // a sentence, never a raw "Request failed with status code 503"
    }
});

//get featured products
export const fetchFeaturedProducts = createAsyncThunk("product/fetchFeaturedProducts", async ({page=1, page_size=null})=>{
    let response = await getFeaturedProducts(page, page_size);
    console.log('get fetured products res', response);

    return {data: response?.data?.data?.results || [], next: response?.data?.data?.next || null, error: response.message};
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
            response = await api.get(`/products/search-suggestions/?q=${searchValue}`, { section: "search-suggestions", optionalAuth: true});
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
        // The quantity on the product page: never below the product's minimum order, never above what one cart line may hold
        // (the backend's cart MAX_QUANTITY). The +/- buttons and the typed number both go through here.
        setQuantity: (state, action)=>{
            const wanted = Math.floor(Number(action.payload));
            state.quantity = Math.min(MAX_QUANTITY, Math.max(state.minimum_quantity, Number.isFinite(wanted) ? wanted : state.minimum_quantity));
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
        builder.addCase(fetchAllProducts.pending, (state, action)=>{
            const more = action.meta.arg.page > 1;
            state.listRequestId = action.meta.requestId;
            state.relatedProductsLoading = true;
            state.isLoading = true;
            state.isLoadingMore = more;
            if (!more) {
                state.error = null;
                state.listKey = action.meta.arg.key;
            }
        });
        builder.addCase(fetchAllProducts.fulfilled,(state, action)=>{
            if (state.listRequestId !== action.meta.requestId) return; // a newer list is on its way: this answer is for one nobody looks at
            const page = action.meta.arg.page || 1;
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.isLoadingMore = false;
            state.error = null;
            state.items = page > 1
            ? [...state.items, ...action?.payload?.data]
            : action?.payload?.data;
            state.listPage = page;
            state.count = action?.payload?.count;
            state.hasMore = Boolean(action?.payload?.next); // the backend says whether another page exists
        });
        builder.addCase(fetchAllProducts.rejected,(state, action)=>{
            if (state.listRequestId !== action.meta.requestId) return;
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.isLoadingMore = false;
            state.error = action?.payload || action?.error?.message || 'Something went wrong';
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
            state.hasMore = Boolean(action?.payload?.next); // the backend says whether another page exists
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

            //set quantity initial: the product's minimum order (1 when it has none)
            state.minimum_quantity = Math.max(1, Number(action.payload?.minimum_order_quantity) || 1);
            state.quantity = state.minimum_quantity;
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

export const {setMainImage, setQuantity, setSelectedColor, setSelectedSize, suggestionsInputTime} = productSlice.actions;
export default productSlice.reducer;