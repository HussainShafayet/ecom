import {configureStore} from "@reduxjs/toolkit";
import productReducer from "./slice/productSlice";
import categoryReducer from "./slice/categorySlice";
import authSlice from "./slice/authSlice";
import checkoutReducer from './slice/checkoutSlice'
import cartReducer, {cartMiddleware} from './slice/cartSlice';

const store = configureStore({
    reducer: {
        product: productReducer,
        category: categoryReducer,
        auth: authSlice,
        checkout: checkoutReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cartMiddleware),
});

export default store;