// src/redux/slice/cartSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { removeFromWishlist } from './wishlistSlice';

// Load initial cart items from localStorage, or default to an empty array
const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cartItems');
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (e) {
    console.warn("Could not load cart items from localStorage:", e);
    return [];
  }
};

const initialState = {
  isLoading: false,
  cartItems: loadCartFromLocalStorage(),
  error: null,
};

// Async action for add to cart
export const handleAddtoCart = createAsyncThunk('cart/handleAddtoCart', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('api/accounts/cart/', formData);
    console.log('add to cart response',response);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});



const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
    //add to cart 
    .addCase(handleAddtoCart.pending, (state)=>{
      state.isLoading = true;
    })
    .addCase(handleAddtoCart.fulfilled, (state, action)=>{
      state.isLoading = false;
    })
    .addCase(handleAddtoCart.rejected, (state, action)=>{
      state.isLoading = false;
      state.error = action.payload.error;
    })
  }
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((total, item) => total + item.quantity, 0);
export const selectTotalPrice = (state) =>
  state.cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

// Save cart to localStorage whenever cart items change
export const saveCartToLocalStorage = (cartItems) => {
  try {
    const serializedCart = JSON.stringify(cartItems);
    localStorage.setItem('cartItems', serializedCart);
  } catch (e) {
    console.warn("Could not save cart items to localStorage:", e);
  }
};

// Middleware to sync cart with localStorage
export const cartMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (
    addToCart.match(action) ||
    removeFromCart.match(action) ||
    updateQuantity.match(action) ||
    clearCart.match(action)
  ) {
    saveCartToLocalStorage(store.getState().cart.cartItems);
  }
  return result;
};


// Thunk to handle adding to cart and removing from wishlist
export const addToCartAndRemoveFromWishlist = (item) => (dispatch) => {
  dispatch(addToCart(item));
  dispatch(removeFromWishlist(item.id)); // Remove from wishlist after adding to cart
};

export default cartSlice.reducer;
