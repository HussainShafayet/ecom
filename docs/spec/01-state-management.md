# State Management — `src/redux/`

## `store.js`

`configureStore` wraps a `combineReducers` root inside a top-level `persistReducer` (`redux-persist`, localStorage). Root persist config: `key: "root"`, `whitelist: ["cart", "wishList"]`.

The `auth` reducer gets its **own, separate** nested `persistReducer` (`key: "auth"`, `whitelist: ["isAuthenticated"]`) before being combined into the root — so auth is persisted independently of, and in addition to, the root whitelist (which doesn't list `"auth"` itself). Easy to miss; worth remembering when debugging why auth state does or doesn't survive a refresh.

All other slices (`product`, `new_arrival`, `best_selling`, `flash_sale`, `category`, `checkout`, `content`, `profile`, `review`, `order`, `globalError`) are **not** persisted.

Middleware: default RTK middleware with `serializableCheck: false`. Two custom middlewares (`cartMiddleware`, `wishlistMiddleware`) exist in commented-out/dead form. `persistor` is exported via `persistStore(store)` and wired in `src/index.js` with `<Provider>` + `<PersistGate loading={null}>`.

## `slice/authSlice.js`

State: `accessToken`/`refreshToken`/`token`, `isAuthenticated`, plus three parallel loading/message/error triples — one each for signup, signin, and verifyOtp.

Thunks (all via `publicApi` except `refreshToken`/`logoutUser`, which use raw `axios` + a manually attached `Authorization` header, bypassing both shared clients):
- `signUpUser` → `POST /accounts/register/`
- `verifyOtp` → `POST /accounts/verify-otp/`
- `resendOtp` → `POST /accounts/resend-otp/`
- `signInUser` → `POST /accounts/login/`
- `refreshToken` → `POST accounts/token/refresh/` (reads `accessToken` from state)
- `logoutUser` → `POST accounts/logout/`

Plain thunk `checkAuth()` dispatches `refreshToken` if a `refresh_token` cookie exists. Reducers: `loadUserFromStorage` (hydrates from `js-cookie`), `clearSignupState`, `clearVerifyOtpState`, `clearSigninState`. Tokens are written directly to cookies inside `extraReducers` — side effects living in reducer bodies, an unusual pattern. Only `isAuthenticated` is redux-persisted; tokens rely entirely on cookies for durability.

## `slice/authActions.js`

Not a slice — exports `Logout(logout_data)`, a thunk that dispatches `logoutUser`, `clearCart`, `clearWishlist`, then calls `persistStore(store).purge()`. Imports the store singleton directly (`../store`) rather than relying on `dispatch`/`getState` — an unusual pattern worth knowing before refactoring this file.

## `slice/cartSlice.js`

State: `cartItems: []` plus separate loading/error flags for add/fetch/remove.

Thunks (dynamic `import('../../api/axiosSetup')`, authenticated client):
- `handleAddtoCart` → `POST /accounts/cart/`
- `handleFetchCart` → `GET /accounts/cart/`
- `handleRemovetoCart` → `PUT /accounts/cart/` (not `DELETE` — matches the backend contract)

Sync reducers `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` operate purely on local `cartItems` (no API call), matched on `id` + optional `variant_id`. Selectors: `selectCartItems`, `selectCartCount`, `selectTotalPrice` (uses `discount_price` if `has_discount` else `base_price`). Helper `handleClonedProduct(...)` builds a cart-item DTO from a product/variant.

Persisted via the root whitelist (`"cart"`). Dead code: commented-out `loadCartFromLocalStorage`/`saveCartToLocalStorage`, and the commented-out `cartMiddleware`.

## `slice/categorySlice.js`

Pure read state for 5 category groupings (all, flash-sale, new-arrival, best-selling, featured), each with its own loading/error. 5 thunks call `services/categoryService`. No sync reducers. Not persisted.

## `slice/checkoutSlice.js`

Large form-state slice: `formData` (shipping/payment fields), `errors`, `touched`, `districts`/`upazilas`, `addresses`, `delivery_charges`, `user_info`, `order_id`, `order` (the `POST /orders/` answer `{order_id, status, created_at, subtotal, delivery_charge, total}`, handed to the confirmation page; cleared by `resetForm`), `isCheckoutFulfilled`.

Thunks:
- `handleCheckout` → `POST /orders/` (branches authenticated client vs `publicApi`; dispatches `clearCart()` on success)
- `handleGetCheckoutContent` → `GET /content/checkout/` (same auth branching; populates `formData.name/phone/email` from `user_info`)

Plain thunk `initializeCheckout()` dispatches `handleGetCheckoutContent` and, if authenticated, `handleFetchCart()` — cross-slice orchestration living outside any single slice file. A large commented-out block references a nonexistent `handleGetProfile`/`setAddress` flow (dead code / abandoned direction). Not persisted, so a page refresh mid-checkout loses form progress.

## `slice/orderSlice.js`

A customer's orders. Calls go through `services/orderService.js` (not inlined). Not persisted; **reset to its initial state on `logoutUser.fulfilled`/`rejected`**, so nothing of one customer's orders is left for the next person on the browser. Errors are stored as the backend's `errors` sentences (an array, for `ErrorDisplay`).

State: `orders`/`ordersCount`/`ordersNext`/`ordersPrevious`/`ordersLoading`/`ordersError` (the list page), `order`/`orderLoading`/`orderError` (detail and confirmation), `cancelLoading`/`cancelError`, `tracking`/`trackingLoading`/`trackingError` (the guest lookup).

Thunks: `fetchOrders({page, page_size})` → `GET /orders/`; `fetchOrder(orderId)` → `GET /orders/{id}/`; `cancelOrder(orderId)` → `POST /orders/{id}/cancel/` (replaces `order` with the answer and updates the row in `orders`); `trackOrder({order_id, phone_number})` → `GET /orders/track/` (public client). Sync reducers: `clearOrder`, `clearTracking`.

## `slice/contentSlice.js`

CMS-style content per page (home/new-arrival/flash-sale/best-selling/featured/shop/categories): `image_sliders`, `video_sliders`, banners, plus shop-only fields (`tags`, `brands`, `colors`, `sizes`, `price_range`, `discounts`). 7 near-identical thunks hitting `services/contentService`. A single shared `isLoading`/`error` covers all 7 async flows — concurrent fetches can clobber each other's loading state (unlike `categorySlice`, which has per-section flags). Not persisted.

## `slice/globalErrorSlice.js`

Simple UI-error bus: `globalError` (string|null) + `sectionErrors` (map). Reducers: `setGlobalError` (also wipes `sectionErrors`), `setSectionError`, `clearSectionError`, `clearAllErrors`. No thunks. Not persisted. See [03-api-integration.md](03-api-integration.md) for how this connects to the axios interceptors.

## `slice/productSlice.js`

State: product list (`items`), single `product` detail, variant selection (`selectedColor`/`selectedSize`/`mainImage`/`quantity`), search (`suggestions`), sidebar/sort UI flags, `hasMore` (pagination flag).

Thunks: `fetchAllProducts`/`fetchFeaturedProducts` (via `services/productService`, support pagination-append), `fetchProductById` (sets initial variant/image/qty from the response), `searchSuggestions` (branches authenticated client vs `publicApi` on auth state).

**Bug**: `hasMore` is computed as `payload.data.length === action.meta.arg.limit`, but the thunk argument is actually named `page_size`, not `limit` — `action.meta.arg.limit` is always `undefined`, so this comparison is effectively always false. Pagination's "load more" signal is broken as written. The `fulfilled` handlers for both `fetchAllProducts` and `fetchFeaturedProducts` also assign `state.hasMore` twice (redundant duplicate line). Not persisted.

## `slice/profileSlice.js`

The largest slice: `profile`, `addresses` (+ CRUD loading/error), address form state, and a parallel phone/email OTP-verification sub-state (`loading`, `otpToken`, `message`, `verifyPopup`, `verified`, `verifyError`, `otpSubmitLoading/Error`, `previousValue`) keyed by `field` (`'phone'|'email'`).

7 thunks via the authenticated client:
- `handleGetProfile` → `GET /accounts/profile/`
- `handleProfileUpdate` → `PUT /accounts/profile/`
- `handleGetAddress` / `handleAddressCreate` / `handleAddressUpdate` / `handleAddressDelete` → `/accounts/addresses/`
- `handleSendOtp` → `POST accounts/request-otp/`
- `handleSubmitOtp` → `POST accounts/verify-otp-for-profile/`

Not persisted — the full profile/address list is refetched every session.

## `slice/reviewSlice.js`

State: `reviews`, `can_review`, `review_status` + `review_order_id` (the backend's answer to *why* the signed-in customer may not review: `can_review` | `reviewed` | `waiting_for_delivery` (with the number of the order they are waiting for) | `not_purchased` | `guest`), `reviewFormData` (product_id/rating/comment/media), add/update loading+completed flags. `createReview.fulfilled` sets `can_review=false` and `review_status='reviewed'` (one review per product, so the form closes). Reset to the initial state on `logoutUser.fulfilled`/`rejected` (which reviews the customer may edit, and whether they may review, are theirs).

Thunks via the authenticated client: `fetchReviews` (`GET products/reviews/?product_id=`), `createReview` (`POST products/reviews/`), `updateReview` (`PUT products/reviews/:id/`). Cosmetic typo in a thunk type string: `'review/fetchRevies'` (doesn't affect behavior). Not persisted.

## `slice/wishlistSlice.js`

State: `items`, `favouriteIds` (id lookup map for O(1) checks), add/fetch/remove loading+error.

Thunks via the authenticated client: `handleAddtoWishlist` (`POST /accounts/favourite/`), `fetchtoWishlist` (`GET /accounts/favourite/`), `handleRemovetoWishlist` (`PUT /accounts/favourite/`, not `DELETE`).

**Bug**: all three thunk type strings are prefixed `'cart/...'` (e.g. `'cart/handleAddtoWishlist'`) instead of `'wishList/...'` — a copy-paste leftover from `cartSlice`. Doesn't break functionality (the type strings are still unique) but pollutes the `cart/*` namespace in Redux DevTools/action logs and is misleading when debugging.

Sync reducers `addToWishlist`/`removeFromWishlist`/`clearWishlist` mirror `cartSlice`'s local-mutation pattern. Persisted via the root whitelist (`"wishList"`). Dead code: commented-out `saveWishlistToLocalStorage`, `wishlistMiddleware`.

## `slice/product/bestSellingSlice.js`, `flashSaleSlice.js`, `newArrivalSlice.js`

Three near-identical slices, each with one loading flag, one data array, one error, and one thunk (`fetchBestSellingProducts`/`fetchFlashSaleProducts`/`fetchNewArrivalProducts`) calling the matching `services/productService` function, with pagination-append logic copy-pasted from `productSlice.js` — including the same `hasMore`/`action.meta.arg.limit` bug and the same duplicated `state.hasMore = ...` line, in all three files.

`flashSaleSlice.js` and `newArrivalSlice.js`'s `initialState` lacks `hasMore`/`relatedProductsLoading` keys, yet the reducer writes to them anyway (RTK/Immer tolerates adding new keys at runtime — harmless but inconsistent with the declared shape). None are persisted.

These three overlap conceptually with `categorySlice`'s flash-sale/new-arrival/best-selling fields, and with `contentSlice`'s per-page fetches — three different slices independently model "flash sale" (as products, as categories, and as page content), which is a lot of duplicated boilerplate for closely related concepts. Worth consolidating if this area is touched for a feature, not just a bug fix.

## `src/context/CartContext.js` vs `cartSlice.js`

`CartContext.js` defines a fully independent `useState`-based cart (`CartProvider`, `useCart` hook) with its own `addToCart`/`removeFromCart`/`updateQuantity`/`clearCart`/`cartCount` — functionally overlapping with `cartSlice.js` almost 1:1, but with no backend integration, no persistence, and no cross-tab/reload durability.

**This file is dead code.** No other file in `src` imports `CartContext`, `CartProvider`, or `useCart`; `App`/`index.js` only wrap the tree in Redux's `<Provider>`/`<PersistGate>`, never `<CartProvider>`. It's an orphaned earlier implementation superseded by `cartSlice.js` + redux-persist. Safe to delete if the codebase is being cleaned up; do not build new features on it.

## Flagged issues

- **`hasMore` pagination bug**: `productSlice`, `bestSellingSlice`, `flashSaleSlice`, `newArrivalSlice` all compare against `action.meta.arg.limit`, which no thunk actually receives (the param is `page_size`) — "load more" logic is effectively non-functional as written, duplicated across four files.
- **Auth persistence split**: `auth` is nested-persisted independently of the root `persistConfig.whitelist` — easy to overlook.
- **Inconsistent async client usage**: most slices lazy `import()` `api/axiosSetup` per-thunk to dodge circular deps; `authSlice`'s `refreshToken`/`logoutUser` use raw `axios` with manually attached headers instead — duplicated auth-header logic, and these two calls skip the shared interceptor error handling entirely.
- **Inconsistent auth-branching pattern**: `checkoutSlice` and `productSlice.searchSuggestions` branch client-by-auth-state; cart/wishlist/profile/review assume the user is always authenticated.
- **`wishlistSlice` action-type namespace bug** (`'cart/...'` prefix — see above).
- Multiple large commented-out dead-code blocks (localStorage cart/wishlist helpers, both custom middlewares, `checkoutSlice`'s old profile-prefill flow) should eventually be deleted rather than left commented.
- Excessive `console.log` of API responses left in nearly every thunk.
