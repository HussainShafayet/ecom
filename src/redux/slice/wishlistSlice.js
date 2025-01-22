// src/redux/slice/wishlistSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


// Load initial Wish items from localStorage, or default to an empty array
const loadWishlistFromLocalStorage = () => {
    try {
      const serializedWish = localStorage.getItem('wishList');
      return serializedWish ? JSON.parse(serializedWish) : [];
    } catch (e) {
      console.warn("Could not load wishlist items from localStorage:", e);
      return [];
    }
  };


const initialState = {
  isLoading: false,
  items: loadWishlistFromLocalStorage(),
  error: null,
};


//add to wishlist
export const handleAddtoWishlist = createAsyncThunk('cart/handleAddtoWishlist', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/favourite/', formData);
    console.log('add to wishlist response',response);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

//fetch to wishlist
export const fetchtoWishlist = createAsyncThunk('cart/fetchtoWishlist', async (_, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.get('api/accounts/favourite/');
    console.log('fetch to wishlist response',response);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

//remove to wishlist
export const handleRemovetoWishlist = createAsyncThunk('cart/handleRemovetoWishlist', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.put('api/accounts/favourite/', formData);
    console.log('remove to wishlist response',response);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});


const wishlistSlice = createSlice({
  name: 'wishList',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
      builder
      //add to cart 
      .addCase(handleAddtoWishlist.pending, (state)=>{
        state.isLoading = true;
      })
      .addCase(handleAddtoWishlist.fulfilled, (state, action)=>{
        state.isLoading = false;
      })
      .addCase(handleAddtoWishlist.rejected, (state, action)=>{
        state.isLoading = false;
        state.error = action.payload.error;
      })
  
       //get cart 
       .addCase(fetchtoWishlist.pending, (state)=>{
        state.isLoading = true;
      })
      .addCase(fetchtoWishlist.fulfilled, (state, action)=>{
        state.isLoading = false;
        state.items = action.payload.data;
        
      })
      .addCase(fetchtoWishlist.rejected, (state, action)=>{
        state.isLoading = false;
        state.error = action.payload.error;
      })
  
      //remove from cart 
      .addCase(handleRemovetoWishlist.pending, (state)=>{
        state.isLoading = true;
      })
      .addCase(handleRemovetoWishlist.fulfilled, (state, action)=>{
        state.isLoading = false;
        console.log(action);
        
      })
      .addCase(handleRemovetoWishlist.rejected, (state, action)=>{
        state.isLoading = false;
        state.error = action.payload.error;
      })
    }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

// Save cart to localStorage whenever cart items change
export const saveWishlistToLocalStorage = (wishlistItems) => {
    try {
      const serializedWish = JSON.stringify(wishlistItems);
      localStorage.setItem('wishList', serializedWish);
    } catch (e) {
      console.warn("Could not save wishList items to localStorage:", e);
    }
  };
  
  // Middleware to sync cart with localStorage
  export const wishlistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState().auth;
    
    if (
        addToWishlist.match(action) ||
        (!state.isAuthenticated && removeFromWishlist.match(action)) ||
        clearWishlist.match(action)
    ) {
      saveWishlistToLocalStorage(store.getState().wishList.items);
    }
    return result;
  };
export default wishlistSlice.reducer;
