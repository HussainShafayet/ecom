import {configureStore} from "@reduxjs/toolkit";
import productReducer from "./slice/productSlice";
import categoryReducer from "./slice/categorySlice";
import authSlice from "./slice/authSlice";
import checkoutReducer from './slice/checkoutSlice'

const store = configureStore({
    reducer: {
        product: productReducer,
        category: categoryReducer,
        auth: authSlice,
        checkout: checkoutReducer,
    }
});

export default store;