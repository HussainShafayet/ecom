import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {getAllProducts, getProductById, getProductsByCategory} from "../../services/productService";
const initialState = {
    isLoading: false,
    products: [],
    error: null,
    product: null,
    mainImage: null,
    relatedProducts: [],
    quantity: 1,
}
const API_URL = 'https://dummyjson.com/products';

//get all products
export const fetchAllProducts = createAsyncThunk("product/fetchAllProducts", async ({category=null, limit=null})=>{
    let response;
    if (category) {
        response = await getProductsByCategory(category, limit)
    }else{
        response = await getAllProducts(limit);
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
    },
    extraReducers: (builder)=>{

        //get all products
        builder.addCase(fetchAllProducts.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchAllProducts.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.products = action.payload.data;
            state.error = null
        });
        builder.addCase(fetchAllProducts.rejected,(state, action)=>{
            state.isLoading = false;
            state.products = [];
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
            
            //set releted products 
            state.relatedProducts = state.products.filter((item)=> item.category === action.payload.category && item.id !== action.payload.id);

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

export const {setMainImage,incrementQuantity, decrementQuantity} = productSlice.actions;
export default productSlice.reducer;