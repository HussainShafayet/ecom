import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
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
export const getAllPost = createAsyncThunk("product/getAllPost", async (params = {})=>{
    try {
        const response = await axios.get(API_URL, { params });
        console.log('get all product res', response);
        
        return response.data.products;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;  // Let the caller handle the error
      }
});

// Fetch a single product by its ID
export const getProductById = createAsyncThunk("post/getProductById", async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
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
        builder.addCase(getAllPost.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(getAllPost.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.products = action.payload;
            state.error = null
        });
        builder.addCase(getAllPost.rejected,(state, action)=>{
            state.isLoading = false;
            state.products = [];
            state.error = action.payload.message;
        });


        //get single product
        builder.addCase(getProductById.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(getProductById.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.product = action.payload;
            state.mainImage = action.payload.images[0];
            state.error = null
            
            //set releted products 
            state.relatedProducts = state.products.filter((item)=> item.category === action.payload.category && item.id !== action.payload.id);

            //set quantity initial
            state.quantity = 1;
        });
        builder.addCase(getProductById.rejected,(state, action)=>{
            state.isLoading = false;
            state.product = null;
            state.error = action.payload.message;
        });
    }
});

export const {setMainImage,incrementQuantity, decrementQuantity} = productSlice.actions;
export default productSlice.reducer;