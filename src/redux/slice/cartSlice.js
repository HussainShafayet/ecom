// src/redux/slice/cartSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { removeFromWishlist } from './wishlistSlice';

// Load initial cart items from localStorage, or default to an empty array
//const loadCartFromLocalStorage = () => {
//  try {
//    const serializedCart = localStorage.getItem('cartItems');
//    return serializedCart ? JSON.parse(serializedCart) : [];
//  } catch (e) {
//    console.warn("Could not load cart items from localStorage:", e);
//    return [];
//  }
//};

const initialState = {
  cartLoading: false,
  cartItems: [],
  cartError: null,
  cartAddedSuccessfull: false,
};

// Async action for add to cart
export const handleAddtoCart = createAsyncThunk('cart/handleAddtoCart', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.post('/accounts/cart/', formData, {section: 'add-cart'});
    console.log('add to cart response',response);
    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async action for get to cart
export const handleFetchCart = createAsyncThunk('cart/handleFetchCart', async (_, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.get('/accounts/cart/',  {section: "fetch-cart"});
    console.log('get cart response',response);
    return response?.data || [];
  } catch (error) {
    console.log('fetch error cart:', error);
    
    return rejectWithValue(error?.response?.data || error?.message);
  }
});

// Async action for remove to cart
export const handleRemovetoCart = createAsyncThunk('cart/handleRemovetoCart', async (formData, { rejectWithValue }) => {
  try {
     // Import axiosSetup only when needed to avoid circular dependency issues
     const api = (await import('../../api/axiosSetup')).default;
     const response = await api.put('/accounts/cart/', formData);
    console.log('remove to cart response',response);
    return response?.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || error.message || 'Something went wrong!');
  }
});



const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.cartLoading = false;
      state.cartError = null;
      const { id, variant_id, quantity } = action.payload;

      const existingItem = state.cartItems.find((item) => 
          item.id === id && 
          (item.variant_id ? item.variant_id === variant_id : !variant_id) // Handle both cases
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      const { id, variant_id } = action.payload;

      state.cartItems = state.cartItems.filter((item) =>
          item.id !== id || (item.variant_id ? item.variant_id !== variant_id : variant_id !== undefined)
      );
    },
    updateQuantity: (state, action) => {
      const { id, variant_id, quantity } = action.payload;

      const item = state.cartItems.find((item) => 
          item.id === id && 
          (item.variant_id ? item.variant_id === variant_id : !variant_id)
      );
  
     
      item && (item.quantity = quantity);
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
    //add to cart 
    .addCase(handleAddtoCart.pending, (state)=>{
      state.cartLoading = true;
    })
    .addCase(handleAddtoCart.fulfilled, (state, action)=>{
      state.cartLoading = false;
      state.cartAddedSuccessfull = true;
    })
    .addCase(handleAddtoCart.rejected, (state, action)=>{
      state.cartLoading = false;
      state.cartError = false;
      state.cartError = action.payload?.errors   || 'Something went wrong!';
    })

     //get cart 
     .addCase(handleFetchCart.pending, (state)=>{
      state.cartLoading = true;
    })
    .addCase(handleFetchCart.fulfilled, (state, action)=>{
      state.cartLoading = false;
      state.cartError = false;
      state.cartItems = action?.payload?.data;
      
    })
    .addCase(handleFetchCart.rejected, (state, action)=>{
      state.cartLoading = false;
      state.cartItems = [];
      state.cartError = action.payload?.error || action?.payload || 'Something went wrong!';
    })

    //remove from cart 
    .addCase(handleRemovetoCart.pending, (state)=>{
      state.cartLoading = true;
    })
    .addCase(handleRemovetoCart.fulfilled, (state, action)=>{
      state.cartLoading = false;
      //console.log(action);
      
    })
    .addCase(handleRemovetoCart.rejected, (state, action)=>{
      state.cartLoading = false;
      state.cartError = action?.payload?.error  || 'Something went wrong!';
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
  state.cart.cartItems.reduce((total, item) => total + (item.has_discount? item.discount_price : item.base_price) * item.quantity, 0);

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
//export const cartMiddleware = (store) => (next) => (action) => {
//  const result = next(action);
//  if (
//    addToCart.match(action) ||
//    removeFromCart.match(action) ||
//    updateQuantity.match(action) ||
//    clearCart.match(action)
//  ) {
//    saveCartToLocalStorage(store.getState().cart.cartItems);
//  }
//  return result;
//};


// Thunk to handle adding to cart and removing from wishlist
//export const addToCartAndRemoveFromWishlist = (item) => (dispatch) => {
//  dispatch(addToCart(item));
//  dispatch(removeFromWishlist(item.id)); // Remove from wishlist after adding to cart
//};

export const handleClonedProduct = (product, selectedSize, selectedColor, quantity)=>(dispatch)=>{
  const dummyProduct = {}
  dummyProduct['id'] = product.id;
  dummyProduct['name'] = product.name;
  dummyProduct['slug'] = product.slug;
  dummyProduct['sku'] = product.sku;
  dummyProduct['base_price'] = selectedSize?.base_price || selectedColor?.base_price || product.base_price;
  dummyProduct['discount_price'] = selectedSize?.discount_price || selectedColor?.discount_price || product.discount_price;
  dummyProduct['has_discount'] = product.has_discount;
  dummyProduct['discount_type'] = product.discount_type;
  dummyProduct['discount_value'] = product.discount_value;
  dummyProduct['brand_name'] = product?.brand?.name || product.brand_name;
  dummyProduct['total_orders'] = product.total_orders;
  dummyProduct['total_views'] = product.total_views;
  dummyProduct['total_reviews'] = product.total_reviews;
  dummyProduct['avg_rating'] = product.avg_rating;
  let imgUrl = '';
  
  if(selectedColor && selectedColor?.media_files){ 
    for (const file of selectedColor.media_files) {
      if (file.file_type === 'image') {
          imgUrl = file.file_url;
          break;  // Exits the loop when condition is met
      }
    }
  }

  if(!selectedColor && product.media_files){ 
    for (const file of product.media_files) {
      if (file.file_type === 'image') {
          imgUrl = file.file_url;
          break;  // Exits the loop when condition is met
      }
    }
  }
  !selectedColor && product?.image && (imgUrl = product.image);  
  dummyProduct['image'] = imgUrl;
  dummyProduct['is_favourite'] = product.is_favourite;
  dummyProduct['availability_status'] = product.availability_status;
  dummyProduct['has_variants'] = product?.sizes?.length > 0 || product?.colors?.length > 0 ? true : false;
  dummyProduct['quantity'] = quantity;
  dummyProduct['color_name'] = selectedColor?.name;
  dummyProduct['color_hex_code'] = selectedColor?.hex_code;
  dummyProduct['size_name'] = selectedSize?.name;
  dummyProduct['variant_id'] = selectedSize?.variant_id || selectedColor?.variant_id;
  return dummyProduct;
}

export default cartSlice.reducer;
