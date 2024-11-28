import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {getAllProducts, getProductById, getProductsByCategory} from "../../services/productService";
const initialState = {
    isLoading: false,
    relatedProductsLoading: false,
    items: [],
    error: null,
    product: null,
    mainImage: null,
    quantity: 1,
    hasMore: true,
    isSidebarOpen: false,
    sortType: '',
}
const API_URL = 'https://dummyjson.com/products';

//get all products
export const fetchAllProducts = createAsyncThunk("product/fetchAllProducts", async ({category=null, limit=null,sortBy=null, order=null, page=1, skip=0})=>{
    let response;
    if (category) {
        response = await getProductsByCategory(category, limit, sortBy, order, page, skip)
    }else{
        response = await getAllProducts(limit, sortBy, order, page, skip);
    }
    console.log('get all product res', response);
    
    return {data: response.data.products, error: response.message};
});

// Fetch a single product by its ID
export const fetchProductById = createAsyncThunk("post/getProductById", async (id) => {
    try {
      const response = await getProductById(id);
      console.log('get product res', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
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
            state.quantity =  Math.max(1, state.quantity - 1);
        },
        setIsSidebarOpen: (state, action)=>{
            state.isSidebarOpen = action.payload;
        },
        setSortType: (state, action)=>{
            state.sortType = action.payload;
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


        //get single product
        builder.addCase(fetchProductById.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchProductById.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.product = action.payload;
            state.mainImage = action.payload.images[0];
            state.error = null

            //set quantity initial
            state.quantity = 1;
        });
        builder.addCase(fetchProductById.rejected,(state, action)=>{
            state.isLoading = false;
            state.product = null;
            state.error = action.payload.message;
        });
    }
});

export const {setMainImage,incrementQuantity, decrementQuantity, setIsSidebarOpen, setSortType} = productSlice.actions;
export default productSlice.reducer;