// src/redux/slice/wishlistSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


// Load initial Wish items from localStorage, or default to an empty array
//const loadWishlistFromLocalStorage = () => {
//    try {
//      const serializedWish = localStorage.getItem('wishList');
//      return serializedWish ? JSON.parse(serializedWish) : [];
//    } catch (e) {
//      console.warn("Could not load wishlist items from localStorage:", e);
//      return [];
//    }
//  };


const initialState = {
  isLoading: false,
  items: [],
  favouriteIds: {},
  error: null,
  addWishlistLoading: false,
  addWishlistError: null,
  removeWishlistLoading: false,
  removeWishlistError: null,
};


//add to wishlist
export const handleAddtoWishlist = createAsyncThunk('cart/handleAddtoWishlist', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('/accounts/favourite/', formData, { section: "add-wishlist"});
    console.log('add to wishlist response',response);
    response.data = formData;
    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

//fetch to wishlist
export const fetchtoWishlist = createAsyncThunk('cart/fetchtoWishlist', async (_, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.get('/accounts/favourite/', { section: "get-wishlist"});
    console.log('fetch to wishlist response',response);
    return response?.data || [];
  } catch (error) {
    console.log('fetch wish list error: ', error);
    
    return rejectWithValue(error?.response?.data || error.message);
  }
});

//remove to wishlist
export const handleRemovetoWishlist = createAsyncThunk('cart/handleRemovetoWishlist', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.put('/accounts/favourite/', formData, { section: "remove-wishlist"});
    console.log('remove to wishlist response',response);
    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});


const wishlistSlice = createSlice({
  name: 'wishList',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      if (!product || !product.id) {
        console.error("Invalid product:", product);
        return;
      }

      if (!state.favouriteIds[product.id]) {
        const clonedObj = {...action.payload};
        
        clonedObj.is_favourite = true;
        state.items.push(clonedObj);
        state.favouriteIds[product.id] = product.id; // Redux Toolkit handles mutation correctly
      }
      
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      const newFavouriteIds = { ...state.favouriteIds };
      delete newFavouriteIds[action.payload]; // Remove from lookup object safely
      state.favouriteIds = newFavouriteIds;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.favouriteIds = {};
    },
  },
  extraReducers: (builder) => {
      builder
      //add to wishlist 
      .addCase(handleAddtoWishlist.pending, (state)=>{
        state.addWishlistLoading = true;
      })
      .addCase(handleAddtoWishlist.fulfilled, (state, action)=>{
        state.addWishlistLoading = false;
        state.addWishlistError = null;
        const {product_id} = action.payload;
        state.favouriteIds[product_id] =product_id;
      })
      .addCase(handleAddtoWishlist.rejected, (state, action)=>{
        state.addWishlistLoading = false;
        state.addWishlistError = action?.payload?.error  || 'Something went wrong!';
      })
  
       //get wishlist 
       .addCase(fetchtoWishlist.pending, (state)=>{
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchtoWishlist.fulfilled, (state, action)=>{
        state.isLoading = false;
        state.error = null;
        state.items = action?.payload?.data;
        
      })
      .addCase(fetchtoWishlist.rejected, (state, action)=>{
        state.isLoading = false;
        state.items = [];
        state.error = action?.payload?.error || action?.payload || 'Something went wrong!';
      })
  
      //remove from cart 
      .addCase(handleRemovetoWishlist.pending, (state)=>{
        state.removeWishlistLoading = true;
      })
      .addCase(handleRemovetoWishlist.fulfilled, (state, action)=>{
        state.removeWishlistLoading = false;
        state.removeWishlistError = null;
        
      })
      .addCase(handleRemovetoWishlist.rejected, (state, action)=>{
        state.removeWishlistLoading = false;
        state.removeWishlistError = action?.payload?.error  || 'Something went wrong!';
      })
    }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

// Save cart to localStorage whenever cart items change
//export const saveWishlistToLocalStorage = (wishlistItems) => {
//    try {
//      const serializedWish = JSON.stringify(wishlistItems);
//      localStorage.setItem('wishList', serializedWish);
//    } catch (e) {
//      console.warn("Could not save wishList items to localStorage:", e);
//    }
//  };
  
  // Middleware to sync cart with localStorage
  //export const wishlistMiddleware = (store) => (next) => (action) => {
  //  const result = next(action);
  //  const state = store.getState().auth;
    
  //  if (
  //      addToWishlist.match(action) ||
  //      (!state.isAuthenticated && removeFromWishlist.match(action)) ||
  //      clearWishlist.match(action)
  //  ) {
  //    saveWishlistToLocalStorage(store.getState().wishList.items);
  //  }
  //  return result;
  //};
export default wishlistSlice.reducer;
