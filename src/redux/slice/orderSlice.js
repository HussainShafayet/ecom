import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {cancelOrder as cancelOrderRequest, getOrder, getOrders, getOrdersTotal, trackOrder as trackOrderRequest} from "../../services/orderService";
import {logoutUser} from "./authSlice";
import {handleAddtoCart, handleFetchCart} from "./cartSlice";

const initialState = {
    // my orders (list page)
    orders: [],
    ordersCount: 0,
    ordersNext: null,
    ordersPrevious: null,
    ordersLoading: false,
    ordersError: null,
    ordersStatus: '', // the statuses the list is for ("" = all): a list is never drawn for another filter
    ordersRequestId: null, // the newest first-page request: an older answer that arrives late is dropped
    ordersTotal: null, // how many orders I have, for the account page (apart from the list above, which a filter narrows); null until known


    // "Buy again": what went into the cart, and what could not (the shop's sentences)
    buyAgain: {loading: false, added: [], skipped: [], done: false},

    // one of my orders (detail and confirmation pages); `orderNotFound`: the backend answered 404 (somebody else's or unknown), which
    // is not something trying again will change
    order: null,
    orderLoading: false,
    orderError: null,
    orderNotFound: false,

    // cancelling it
    cancelLoading: false,
    cancelError: null,

    // a guest's lookup by order number + phone
    tracking: null,
    trackingLoading: false,
    trackingError: null,
};

// An answer for a list nobody is looking at any more: another filter was chosen, or a newer first page was asked for
const staleOrdersAnswer = (state, action) => {
    const arg = action.meta.arg || {};
    if ((arg.status || '') !== state.ordersStatus) return true;
    return (arg.page || 1) === 1 && action.meta.requestId !== state.ordersRequestId;
};

// The backend answers errors as { success:false, message, error, errors:[...] }: pages show the sentences.
const errorsOf = (action) => action.payload?.errors || ['Something went wrong!'];

//my orders
export const fetchOrders = createAsyncThunk('order/fetchOrders', async ({page, page_size, status = ''} = {}, {rejectWithValue}) => {
    try {
        const response = await getOrders(page, page_size, status);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

// How many orders I have (a failure just leaves it unknown: the account page then draws no number)
export const fetchOrdersTotal = createAsyncThunk('order/fetchOrdersTotal', async (_, {rejectWithValue}) => {
    try {
        const response = await getOrdersTotal();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

//one order
export const fetchOrder =createAsyncThunk('order/fetchOrder', async (orderId, {rejectWithValue}) => {
    try {
        const response = await getOrder(orderId);
        return response.data.data;
    } catch (error) {
        return rejectWithValue({...error.response?.data, status: error.response?.status});
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

// Put every line of one of my orders back in the cart, one at a time (a line the shop refuses must not stop the others), then
// read the cart again so the page shows what is really in it. A line whose product or variant is gone cannot be bought.
export const buyOrderAgain = createAsyncThunk('order/buyOrderAgain', async (items, {dispatch}) => {
    const added = [];
    const skipped = [];
    for (const item of items || []) {
        if (!item.product_id || !item.variant_id) {
            skipped.push(`${item.product_name} is not sold any more.`);
            continue;
        }
        try {
            await dispatch(handleAddtoCart({product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity, action: 'increase'})).unwrap();
            added.push(item.product_name);
        } catch (error) {
            const sentence = Array.isArray(error?.errors) ? error.errors[0] : null;
            skipped.push(sentence || `${item.product_name} could not be added.`);
        }
    }
    await dispatch(handleFetchCart());
    return {added, skipped};
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
            state.orderNotFound = false;
            state.cancelError = null;
            state.buyAgain = initialState.buyAgain;
        },
        clearTracking: (state) => {
            state.tracking = null;
            state.trackingError = null;
        },
    },
    extraReducers: (builder) => {
        builder
        //my orders
        .addCase(fetchOrders.pending, (state, action) => {
            state.ordersLoading = true;
            state.ordersError = null;
            const status = action.meta.arg?.status || '';
            if ((action.meta.arg?.page || 1) === 1) {
                state.ordersRequestId = action.meta.requestId;
                if (status !== state.ordersStatus) { // another filter: nothing of the old list may show
                    state.orders = [];
                    state.ordersCount = 0;
                    state.ordersNext = null;
                    state.ordersPrevious = null;
                }
                state.ordersStatus = status;
            }
        })
        .addCase(fetchOrders.fulfilled, (state, action) => {
            if (staleOrdersAnswer(state, action)) return;
            state.ordersLoading = false;
            // page 1 starts the list again; a later page ("Load more") goes under what is already there
            const results = action.payload?.results || [];
            const loaded = new Set(state.orders.map((order) => order.order_id));
            state.orders = (action.meta.arg?.page || 1) > 1 ? [...state.orders, ...results.filter((order) => !loaded.has(order.order_id))] : results;
            state.ordersCount = action.payload?.count || 0;
            state.ordersNext = action.payload?.next || null;
            state.ordersPrevious = action.payload?.previous || null;
        })
        .addCase(fetchOrders.rejected, (state, action) => {
            if (staleOrdersAnswer(state, action)) return;
            state.ordersLoading = false;
            state.ordersError = errorsOf(action);
        })

        .addCase(fetchOrdersTotal.fulfilled, (state, action) => {
            const count = action.payload?.count;
            state.ordersTotal = typeof count === 'number' ? count : null;
        })

        //one order
        .addCase(fetchOrder.pending, (state) => {
            state.orderLoading = true;
            state.orderError = null;
            state.orderNotFound = false;
        })
        .addCase(fetchOrder.fulfilled, (state, action) => {
            state.orderLoading = false;
            state.order = action.payload;
        })
        .addCase(fetchOrder.rejected, (state, action) => {
            state.orderLoading = false;
            state.orderError = errorsOf(action);
            state.orderNotFound = action.payload?.status === 404;
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

        //buy again
        .addCase(buyOrderAgain.pending, (state) => {
            state.buyAgain = {loading: true, added: [], skipped: [], done: false};
        })
        .addCase(buyOrderAgain.fulfilled, (state, action) => {
            state.buyAgain = {loading: false, added: action.payload.added, skipped: action.payload.skipped, done: true};
        })
        .addCase(buyOrderAgain.rejected, (state) => {
            state.buyAgain = {loading: false, added: [], skipped: ['Something went wrong. Please try again.'], done: true};
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
