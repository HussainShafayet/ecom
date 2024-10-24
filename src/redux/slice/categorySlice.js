import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getAllCategories} from "../../services/categoryService";

const initialState ={
    isLoading: false,
    categories: [],
    error: null,
}

export const fetchAllCategories = createAsyncThunk("category/fetchAllCategories", async ()=>{
    const response =  await getAllCategories();
    console.log('get all categories res', response);
    return {data: response.data, error: response.message};
});

const categorySlice = createSlice({
    name: 'category', 
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        //get all products
        builder.addCase(fetchAllCategories.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchAllCategories.fulfilled,(state, action)=>{
            state.isLoading = false;
            state.categories = action.payload.data;
            state.error = null
        });
        builder.addCase(fetchAllCategories.rejected,(state, action)=>{
            state.isLoading = false;
            state.categories = [];
            state.error = action.error.message;
        });
    }
});

export default categorySlice.reducer;