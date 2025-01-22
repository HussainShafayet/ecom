import {configureStore} from "@reduxjs/toolkit";
import productReducer from "./slice/productSlice";
import categoryReducer from "./slice/categorySlice";
import authSlice from "./slice/authSlice";
import checkoutReducer from './slice/checkoutSlice'
import cartReducer, {cartMiddleware} from './slice/cartSlice';
import wishListReducer,{wishlistMiddleware} from './slice/wishlistSlice';
import contentReducer from './slice/contentSlice'
import profileReducer from './slice/profileSlice'

const store = configureStore({
    reducer: {
        product: productReducer,
        category: categoryReducer,
        auth: authSlice,
        checkout: checkoutReducer,
        cart: cartReducer,
        wishList: wishListReducer,
        content: contentReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cartMiddleware)
        .concat(wishlistMiddleware)
});

export default store;