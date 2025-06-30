import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Local storage

// Import reducers
import productReducer from "./slice/productSlice";
import newArrivalReducer from "./slice/product/newArrivalSlice";
import bestSellingReducer from "./slice/product/bestSellingSlice";

import categoryReducer from "./slice/categorySlice";
import authReducer from "./slice/authSlice";  // Authentication slice
import checkoutReducer from './slice/checkoutSlice';
import cartReducer from './slice/cartSlice';
import wishListReducer from './slice/wishlistSlice';
import contentReducer from './slice/contentSlice';
import profileReducer from './slice/profileSlice';
import reviewReducer from './slice/reviewSlice';
import globalErrorReducer from './slice/globalErrorSlice';

// ✅ Persist Only `isAuthenticated` (Not Full auth Slice)
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated"], // ✅ Only persist isAuthenticated
};

// ✅ Persist Other Slices as Normal
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishList"], // ✅ Persist cart and wishlist as before
};

// Combine reducers with auth having its own persist reducer
const rootReducer = combineReducers({
  product: productReducer,      // Not persisted
  new_arrival: newArrivalReducer,
  best_selling: bestSellingReducer,

  category: categoryReducer,    // Not persisted
  auth: persistReducer(authPersistConfig, authReducer), // ✅ Only persist isAuthenticated
  checkout: checkoutReducer,    // Not persisted
  cart: cartReducer,            // ✅ Persisted
  wishList: wishListReducer,    // ✅ Persisted
  content: contentReducer,      // Not persisted
  profile: profileReducer,       // Not persisted
  review: reviewReducer,        // not persisted
  globalError: globalErrorReducer, //not persisted
});

// Apply Persist Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Required for redux-persist
    })
    //.concat(cartMiddleware)
    //.concat(wishlistMiddleware),
});

// Persistor
export const persistor = persistStore(store);

export default store;
