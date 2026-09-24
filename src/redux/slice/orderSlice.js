import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {cancelOrder as cancelOrderRequest, getOrder, getOrders, trackOrder as trackOrderRequest} from "../../services/orderService";
import {logoutUser} from "./authSlice";

const initialState = {
    // my orders (list page)
    orders: [],
    ordersCount: 0,
    ordersNext: null,
    ordersPrevious: null,
    ordersLoading: false,
    ordersError: null,

    // one of my orders (detail and confirmation pages)
    order: null,
    orderLoading: false,
    orderError: null,

    // cancelling it
    cancelLoading: false,
    cancelError: null,

    // a guest's lookup by order number + phone
    tracking: null,
    trackingLoading: false,
    trackingError: null,
};

// The backend answers errors as { success:false, message, error, errors:[...] }: pages show the sentences.
const errorsOf = (action) => action.payload?.errors || ['Something went wrong!'];

//my orders
export const fetchOrders = createAsyncThunk('order/fetchOrders', async ({page, page_size} = {}, {rejectWithValue}) => {
    try {
        const response = await getOrders(page, page_size);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

//one order
export const fetchOrder = createAsyncThunk('order/fetchOrder', async (orderId, {rejectWithValue}) => {
    try {
        const response = await getOrder(orderId);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

//cancel my order
export const cancelOrder = createAsyncThunk('order/cancelOrder', async (orderId, {rejectWithValue}) => {
    try {
        const response = await cancelOrderRequest(orderId);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

//guest tracking
export const trackOrder = createAsyncThunk('order/trackOrder', async ({order_id, phone_number}, {rejectWithValue}) => {
    try {
        const response = await trackOrderRequest(order_id, phone_number);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrder: (state) => {
            state.order = null;
            state.orderError = null;
            state.cancelError = null;
        },
        clearTracking: (state) => {
            state.tracking = null;
            state.trackingError = null;
        },
    },
    extraReducers: (builder) => {
        builder
        //my orders
        .addCase(fetchOrders.pending, (state) => {
            state.ordersLoading = true;
            state.ordersError = null;
        })
        .addCase(fetchOrders.fulfilled, (state, action) => {
            state.ordersLoading = false;
            state.orders = action.payload?.results || [];
            state.ordersCount = action.payload?.count || 0;
            state.ordersNext = action.payload?.next || null;
            state.ordersPrevious = action.payload?.previous || null;
        })
        .addCase(fetchOrders.rejected, (state, action) => {
            state.ordersLoading = false;
            state.ordersError = errorsOf(action);
        })

        //one order
        .addCase(fetchOrder.pending, (state) => {
            state.orderLoading = true;
            state.orderError = null;
        })
        .addCase(fetchOrder.fulfilled, (state, action) => {
            state.orderLoading = false;
            state.order = action.payload;
        })
        .addCase(fetchOrder.rejected, (state, action) => {
            state.orderLoading = false;
            state.orderError = errorsOf(action);
        })

        //cancel
        .addCase(cancelOrder.pending, (state) => {
            state.cancelLoading = true;
            state.cancelError = null;
        })
        .addCase(cancelOrder.fulfilled, (state, action) => {
            state.cancelLoading = false;
            state.order = action.payload;
            // the list (if it is open behind) shows the new status too
            state.orders = state.orders.map((order) => order.order_id === action.payload?.order_id ? {...order, status: action.payload.status, status_display: action.payload.status_display} : order);
        })
        .addCase(cancelOrder.rejected, (state, action) => {
            state.cancelLoading = false;
            state.cancelError = errorsOf(action);
        })

        //guest tracking
        .addCase(trackOrder.pending, (state) => {
            state.trackingLoading = true;
            state.trackingError = null;
            state.tracking = null;
        })
        .addCase(trackOrder.fulfilled, (state, action) => {
            state.trackingLoading = false;
            state.tracking = action.payload;
        })
        .addCase(trackOrder.rejected, (state, action) => {
            state.trackingLoading = false;
            state.trackingError = errorsOf(action);
        })

        //nothing of one customer's orders stays behind for the next person on this browser
        .addMatcher(isAnyOf(logoutUser.fulfilled, logoutUser.rejected), () => initialState);
    },
});

export const {clearOrder, clearTracking} = orderSlice.actions;
export default orderSlice.reducer;
