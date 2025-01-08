import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {getAllProducts, getBestSellingProducts, getFeaturedProducts, getFlashSaleProducts, getNewArrivalProducts, getProductById, getProductsByCategory} from "../../services/productService";
const initialState = {
    isLoading: false,
    relatedProductsLoading: false,
    items: [],
    new_arrival: [],
    best_selling: [],
    flash_sale: [],
    featured: [],
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
}
const API_URL = 'https://dummyjson.com/products';

//get all products
export const fetchAllProducts = createAsyncThunk("product/fetchAllProducts", async ({page_size=null,sortBy=null, order=null, page=1, brands=[], tags=[], min_price=0, max_price=0, sizes=[], colors=[]})=>{
    let response = await getAllProducts(page_size, sortBy, order, page, brands,tags, min_price, max_price, sizes, colors);
    console.log('get all product res', response);
    
    return {data: response.data.data.results, error: response.message};
});

//get new arrival products
export const fetchNewArrivalProducts = createAsyncThunk("product/fetchNewArrivalProducts", async ({page=1, page_size=null})=>{

    let response = await getNewArrivalProducts(page, page_size);
    console.log('get new arrival product res', response);
    
    return {data: response.data.data.results, error: response.message};
});

//get Best Selling products
export const fetchBestSellingProducts = createAsyncThunk("product/fetchBestSellingProducts", async ({page=1, page_size=null})=>{
    let response = await getBestSellingProducts(page, page_size);
    console.log('get best selling product res', response);
    
    return {data: response.data.data.results, error: response.message};
});

//get flash sale products
export const fetchFlashSaleProducts = createAsyncThunk("product/fetchFlashSaleProducts", async ({page=1, page_size=null})=>{
    let response = await getFlashSaleProducts(page, page_size);
    console.log('get flash sale product res', response);
    
    return {data: response.data.data.results, error: response.message};
});

//get featured products
export const fetchFeaturedProducts = createAsyncThunk("product/fetchFeaturedProducts", async ({page=1, page_size=null})=>{
    let response = await getFeaturedProducts(page, page_size);
    console.log('get fetured products res', response);
    
    return {data: response.data.data.results, error: response.message};
});

// Fetch a single product by its slug
export const fetchProductById = createAsyncThunk("post/getProductById", async (slug) => {
    try {
      const response = await getProductById(slug);
      console.log('get product res', response);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${slug}:`, error);
      throw error;  // Let the caller handle the error
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
            state.items = action.meta.arg.page > 1 
            ? [...state.items, ...action.payload.data] 
            : action.payload.data;
        state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchAllProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action.error.message;
        });



        //get NewArrival products
        builder.addCase(fetchNewArrivalProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.isLoading = true;
        });
        builder.addCase(fetchNewArrivalProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.new_arrival = action.meta.arg.page > 1 
            ? [...state.new_arrival, ...action.payload.data] 
            : action.payload.data;
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchNewArrivalProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action.error.message;
        });


        //get bestSelling products
        builder.addCase(fetchBestSellingProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.isLoading = true;
        });
        builder.addCase(fetchBestSellingProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.best_selling = action.meta.arg.page > 1 
            ? [...state.best_selling, ...action.payload.data] 
            : action.payload.data;
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchBestSellingProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action.error.message;
        });


        //get flash sale products
        builder.addCase(fetchFlashSaleProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.isLoading = true;
        });
        builder.addCase(fetchFlashSaleProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.flash_sale = action.meta.arg.page > 1 
            ? [...state.flash_sale, ...action.payload.data] 
            : action.payload.data;
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchFlashSaleProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action.error.message;
        });


        //get fetured products
        builder.addCase(fetchFeaturedProducts.pending, (state)=>{
            state.relatedProductsLoading = true;
            state.isLoading = true;
        });
        builder.addCase(fetchFeaturedProducts.fulfilled,(state, action)=>{
            
            state.relatedProductsLoading = false;
            state.isLoading = false;
            state.featured = action.meta.arg.page > 1 
            ? [...state.featured, ...action.payload.data] 
            : action.payload.data;
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
            
            state.hasMore = action.payload.data.length === action.meta.arg.limit; // Check if more pages are available
        });
        builder.addCase(fetchFeaturedProducts.rejected,(state, action)=>{
            state.relatedProductsLoading = false;
            state.isLoading = false;
            //state.products = [];
            state.error = action.error.message;
        });


        //get single product
        builder.addCase(fetchProductById.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchProductById.fulfilled,(state, action)=>{
            state.isLoading = false;
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
            state.error = null

            //set quantity initial
            state.minimum_quantity = action.payload?.minimum_order_quantity;
            state.quantity = action.payload?.minimum_order_quantity;
        });
        builder.addCase(fetchProductById.rejected,(state, action)=>{
            state.isLoading = false;
            state.product = null;
            state.error = action.payload.message;
        });
    }
});

export const {setMainImage,incrementQuantity, decrementQuantity, setIsSidebarOpen, setSortType, setSelectedColor, setSelectedSize} = productSlice.actions;
export default productSlice.reducer;