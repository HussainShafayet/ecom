import {configureStore} from "@reduxjs/toolkit";
import productReducer from "./slice/productSlice";
import categoryReducer from "./slice/categorySlice";

const store = configureStore({
    reducer: {
        product: productReducer,
        category: categoryReducer,
    }
});

export default store;