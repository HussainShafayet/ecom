import {configureStore} from "@reduxjs/toolkit";
import productReducer from "./slice/productSlice";
import categoryReducer from "./slice/categorySlice";
import authSlice from "./slice/authSlice";

const store = configureStore({
    reducer: {
        product: productReducer,
        category: categoryReducer,
        auth: authSlice,
    }
});

export default store;