# State Management — `src/redux/`

## `store.js`

`configureStore` wraps a `combineReducers` root inside a top-level `persistReducer` (`redux-persist`, localStorage). Root persist config: `key: "root"`, `whitelist: ["cart", "wishList", "recentlyViewed"]`.

The `auth` reducer gets its **own, separate** nested `persistReducer` (`key: "auth"`, `whitelist: ["isAuthenticated"]`) before being combined into the root — so auth is persisted independently of, and in addition to, the root whitelist (which doesn't list `"auth"` itself). Easy to miss; worth remembering when debugging why auth state does or doesn't survive a refresh.

All other slices (`product`, `new_arrival`, `best_selling`, `flash_sale`, `category`, `checkout`, `content`, `profile`, `review`, `order`, `globalError`, `toast`) are **not** persisted.

Middleware: default RTK middleware with `serializableCheck: false`. `persistor` is exported via `persistStore(store)` and wired in `src/index.js` with `<Provider>` + `<PersistGate loading={null}>`.

## `slice/authSlice.js`

State: `accessToken`/`refreshToken`/`token`, `isAuthenticated`, `sessionExpired` (the server ended this device's session; not persisted, shown by `layout/SessionExpiredBanner` and the sign-in page until they sign in or dismiss it), plus three parallel loading/message/error triples — one each for signup, signin, and verifyOtp; `resendOtpError` (a resend that failed is about the resend, not about the code that was typed); `signinWait`/`signupWait`/`verifyWait`/`resendWait` (`{seconds, id}`, set instead of the error when the backend answered 429: `refusal(error)` in each thunk's `rejectWithValue` adds `retry_after` from `api/errors.js` `retryAfterSeconds`, the pages count it down with `hooks/useCountdown`, `id` = the request id tells one refusal from the next); and `otpTiming` (`{resend_after, expires_in, length}`, seconds and digits: what the backend said about the code it just sent, taken from `data` of the register/login/resend-otp answers by `timingOf`; `null` when an older backend does not send it or after a reload, then `VerifyOtp` uses `RESEND_SECONDS` = 60 and `CODE_LENGTH` = 6). Not persisted.

Thunks (all via `publicApi` except `logoutUser`, which uses raw `axios` + a manually attached `Authorization` header, bypassing both shared clients; the token **renewal** is no longer a thunk, it lives in `src/api/session.js`, see [03-api-integration.md](03-api-integration.md)):
- `signUpUser` → `POST /accounts/register/`
- `verifyOtp` → `POST /accounts/verify-otp/`
- `resendOtp` → `POST /accounts/resend-otp/`
- `signInUser` → `POST /accounts/login/`
- `logoutUser` → `POST accounts/logout/`

Plain thunks in `authActions.js`: `Logout()` (logout call + clears cart/wishlist + purges the persisted store), `endSession()` (the server refused the refresh token: `sessionEnded` + clears the local cart and wishlist, no server call, once even if several requests find out together) and `restoreSession()` (dispatched by `App.js` on open: `loadUserFromStorage`, and if the persisted `isAuthenticated` flag turns out to have no refresh cookie behind it, quietly a guest again and the account's cart/wishlist copy is dropped). Reducers: `loadUserFromStorage` (the **refresh cookie** is what a session stands on: with it `isAuthenticated = true` even if the access cookie is gone, without it `false`), `sessionRefreshed` (new tokens from a renewal), `sessionEnded` (signs out + `sessionExpired = true`), `dismissSessionNotice`, `clearSignupState`, `clearVerifyOtpState`, `clearSigninState`. Cookies are read and written only through `api/session.js` (`readTokens`/`saveTokens`/`clearTokens`): both last **30 days** (`expires`, matching the backend's refresh token; they used to be session cookies that vanished when the browser closed) and are `Secure` only over https. The cookie writes still happen inside `extraReducers` (side effects in reducer bodies, an unusual pattern). Only `isAuthenticated` is redux-persisted; tokens rely on the cookies. Why the local cart/wishlist are dropped whenever a signed-in device stops being signed in: they are a copy of the account's, the backend ADDS a guest's cart to the account's at the next sign-in (the items would count twice) and a different customer signing in here would inherit them.

## `slice/authActions.js`

Not a slice — exports `Logout(logout_data)`, a thunk that dispatches `logoutUser`, `clearCart`, `clearWishlist`, then calls `persistStore(store).purge()`. Imports the store singleton directly (`../store`) rather than relying on `dispatch`/`getState` — an unusual pattern worth knowing before refactoring this file.

## `slice/cartSlice.js`

State: `cartItems: []` plus separate loading/error flags for add/fetch/remove.

Thunks (dynamic `import('../../api/axiosSetup')`, authenticated client):
- `handleAddtoCart` → `POST /accounts/cart/`
- `handleFetchCart` → `GET /accounts/cart/`
- `handleRemovetoCart` → `PUT /accounts/cart/` (not `DELETE` — matches the backend contract)

Sync reducers `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` operate purely on local `cartItems` (no API call), matched on `id` + optional `variant_id`. Selectors: `selectCartItems`, `selectCartCount`, `selectTotalPrice` (uses `discount_price` if `has_discount` else `base_price`). Helper `handleClonedProduct(...)` builds a cart-item DTO from a product/variant (it keeps `minimum_order_quantity`, which the cart and the product cards use: `src/utils/minimumOrder.js` has `minimumOf`, `belowMinimum` and `minimumOrderProblems`, worded like the backend's checkout refusal).

Persisted via the root whitelist (`"cart"`).

## `slice/categorySlice.js`

Pure read state for 5 category groupings (all, flash-sale, new-arrival, best-selling, featured), each with its own loading/error. 5 thunks call `services/categoryService`. No sync reducers. Not persisted.

## `slice/checkoutSlice.js`

Large form-state slice: `formData` (shipping/payment fields), `errors`, `touched`, `districts`/`upazilas`, `addresses`, `delivery_charges`, `user_info`, `order_id`, `order` (the `POST /orders/` answer `{order_id, status, created_at, subtotal, delivery_charge, discount_amount, coupon_code, total}`, handed to the confirmation page; cleared by `resetForm`), `responseError` (**always an array of sentences** or null: the backend's `errors` when it refused the order, else one general sentence; shown by `CheckoutErrors`; cleared by a new attempt (`handleCheckout.pending`), by `clearResponseError` and by `resetForm`), `isCheckoutFulfilled`; plus a promo-code preview: `couponStatus` (`idle | validating | applied | failed`), `couponError`, `discountAmount`, `appliedCouponCode` (stored upper case, matching the backend), all cleared by `clearCoupon` and by `resetForm`.

Thunks:
- `handleCheckout` → `POST /orders/` (branches authenticated client vs `publicApi`; dispatches `clearCart()` on success; sends `coupon_code` when one is applied)
- `handleGetCheckoutContent` → `GET /content/checkout/` (same auth branching; populates `formData.name/phone/email` from `user_info`)
- `handleApplyCoupon` → `POST /coupons/validate/` (`services/couponService.js`, public) — previews a coupon's discount against the cart's current subtotal; does not place the order, and the actual redemption at `handleCheckout` time always re-validates against the server's own subtotal.

Plain thunk `initializeCheckout()` dispatches `handleGetCheckoutContent` and, if authenticated, `handleFetchCart()` — cross-slice orchestration living outside any single slice file. Profile name/phone/email and saved addresses both come from `handleGetCheckoutContent` (`GET /content/checkout/` returns `user_info` + `shipping_addresses` together); a selected saved address then fills the rest of the form via `ShowAddress.js` (`checkout/`, see [04-components-ui.md](04-components-ui.md)). Not persisted, so a page refresh mid-checkout loses form progress.

## `slice/orderSlice.js`

A customer's orders. Calls go through `services/orderService.js` (not inlined). Not persisted; **reset to its initial state on `logoutUser.fulfilled`/`rejected`**, so nothing of one customer's orders is left for the next person on the browser. Errors are stored as the backend's `errors` sentences (an array, for `ErrorDisplay`).

State: `orders`/`ordersCount`/`ordersNext`/`ordersPrevious`/`ordersLoading`/`ordersError` (the list page: page 1 replaces `orders`, a later page — "Load more" — is appended under it, an order id already there is not added twice, and a page that fails leaves what was loaded), `order`/`orderLoading`/`orderError`/`orderNotFound` (detail and confirmation; `orderNotFound` is true when the backend answered 404, which trying again will not change — `fetchOrder` passes the status on in its rejection), `cancelLoading`/`cancelError`, `tracking`/`trackingLoading`/`trackingError` (the guest lookup).

Thunks: `fetchOrders({page, page_size})` → `GET /orders/`; `fetchOrder(orderId)` → `GET /orders/{id}/`; `cancelOrder(orderId)` → `POST /orders/{id}/cancel/` (replaces `order` with the answer and updates the row in `orders`); `trackOrder({order_id, phone_number})` → `GET /orders/track/` (public client). Sync reducers: `clearOrder`, `clearTracking`.

## `slice/siteSlice.js`

The shop's own identity, written by the admin (Django admin > Site) and read once by `Layout` (`handleFetchSite` → `services/siteService.getSite` → `GET /site/`). Not persisted. State: `site` (`name`, `tagline`, `logo`, `announcement`, `contact`, `social_links`, `trust_badges`, `footer_pages`), `isLoaded`, `isLoading`, `error`. `EMPTY_SITE` is the value before the answer arrives and when it never does: an empty name draws no copyright line, no announcement draws no bar, no social link draws no icon, no trust badge draws no strip, so nothing is invented for what the shop has not said. A partial answer is merged over `EMPTY_SITE` (`trust_badges` falls back to `[]`, so a backend that does not send it yet still works). Read with `useSelector(selectSite)`. `Layout` also sets `document.title` to `name | tagline` once the name is known.

The contact form, the newsletter box, a static page and the FAQ keep their state in the component (they belong to one page each) and call `siteService` directly; the sentences to show for a failed request come from `utils/errorMessages.js`.

## `slice/contentSlice.js`

CMS-style content per page (home/new-arrival/flash-sale/best-selling/featured/shop/categories): `image_sliders`, `video_sliders`, banners, plus shop-only fields (`tags`, `brands`, `colors`, `sizes`, `price_range`, `discounts`). 7 near-identical thunks hitting `services/contentService`. A single shared `isLoading`/`error` covers all 7 async flows — concurrent fetches can clobber each other's loading state (unlike `categorySlice`, which has per-section flags). Not persisted.

## `slice/globalErrorSlice.js`

The errors of the parts of a page, by the `section` a request was made with: `sectionErrors` (map). Reducers: `setSectionError`, `clearSectionError`, `clearAllErrors`. No thunks. Not persisted. There is no page-wide error any more (`globalError`/`setGlobalError` and the `GlobalErrorHandler` screen are gone): a part reads its own entry and draws `common/SectionError`. The interceptors set an entry when a request of that section fails and clear it when one succeeds. See [03-api-integration.md](03-api-integration.md).

## `slice/toastSlice.js`

Short messages over the page: `items` `[{id, message, type}]` (`type` `error`|`success`|`info`). `showToast` (an identical message+type already showing is not added twice: five failed requests with one cause are one toast), `dismissToast`, and the thunk `pushToast(message, type = 'info', ms = 6000)` which shows one and removes it after `ms`. `selectToasts` tolerates a store without this slice. Drawn by `common/Toaster` (in `Layout`). Used by the interceptors for a failed request that names no `section`, and by `OfflineBanner` ("You're back online."). Not persisted.

## `slice/productSlice.js`

State: product list (`items`), single `product` detail, variant selection (`selectedColor`/`selectedSize`/`mainImage`/`quantity`/`minimum_quantity`; loading a product picks its first colour and size and sets `quantity` to its minimum order, 1 when it has none; `setQuantity` clamps a wanted number between `minimum_quantity` and the exported `MAX_QUANTITY` = 10000, the backend cart's limit, and replaced `incrementQuantity`/`decrementQuantity`), search (`suggestions`), sidebar/sort UI flags, and the list's bookkeeping: `hasMore` (pagination flag), `count` (the backend's `count`: how many products the shop has for this list), `isLoadingMore` (`isLoading` for a page after the first, so the list stays on the screen), `listKey` (which list `items` is: the products page passes its query string as `key`, and another page's request leaves it undefined, so the page never draws a list that another page loaded), `listPage` (the last page loaded) and `listRequestId` (only the latest request's answer is applied: a slow answer for an old list never lands on a new one).

Thunks: `fetchAllProducts` (via `services/productService`; `page` > 1 adds the page under the list, anything else replaces it; a failure is a **sentence** (`apiErrorMessage`: the backend's own, or "Something went wrong on our side…"), never "Request failed with status code 503"; shared by the products page, the homepage's All Products, the product page's related products and the cart's suggestions) and `fetchFeaturedProducts` (same pagination-append), `fetchProductById` (sets initial variant/image/qty from the response), `searchSuggestions` (branches authenticated client vs `publicApi` on auth state).

`hasMore` is set from the backend's own `next` field (`Boolean(action.payload.next)`, both `fetchAllProducts` and `fetchFeaturedProducts`) — the thunks now pass `next` through from the paginated response instead of only `results`. Not persisted.

## `slice/profileSlice.js`

The largest slice: `profile`, `addresses` (`addressesLoaded`: the list was read once, until then the tab draws a skeleton and not "no addresses"; `addressError`: why the LIST could not be read, cleared when a retry starts), and a parallel phone/email OTP-verification sub-state (`loading`, `otpToken`, `message`, `verifyPopup`, `verified`, `verifyError`, `otpSubmitLoading/Error`, `otpTiming`) keyed by `field` (`'phone'|'email'`). `otpTiming[field]` is what the backend said about the code it just sent (`{resend_after, expires_in, length}`; the sheet counts and draws from it, 60 s / 6 digits when absent). `updateFieldErrors` holds the backend's `field_errors` of a refused save, drawn under their fields. `infoEditing` is the edit form being open; `setInfoEditing` (true or false) starts it clean (nothing verified, no old refusal, no sheet). Gone with the redesign: `otp`, `previousValue`, `image` (they are local to the components now), and the address form's `addressFormData`, `touched`, `errors`, `districts`, `upazilas`, `isAddAddress` with their reducers (the form, `AddressForm`, owns its own state; which form is open is `AddressesTab`'s).

7 thunks via the authenticated client:
- `handleGetProfile` → `GET /accounts/profile/`
- `handleProfileUpdate` → `PUT /accounts/profile/`. A plain object goes as JSON (only what changed; `""` clears an e-mail or user name, `null` a birthday, which a multipart form cannot say), a `FormData` is the picture. A saved form ends editing and spends the verifications; a picture does not touch the form.
- `handleGetAddress` / `handleAddressCreate` / `handleAddressUpdate` / `handleAddressDelete` → `/accounts/addresses/` (`{id}/` for the last two; the update sends the fields without `id`). Create, update and delete only change the list when they worked; a refusal is **not** stored in the slice but comes back as the rejected value `{errors: [sentences]}` (`errorMessages`: the backend's own, e.g. "You can save at most 20 addresses. Delete one to add another.", else a general one, "Could not reach the server..." when there was no answer), which the form or card that asked says where the customer is looking. A refresh of the list that fails keeps the list on the screen.
- `handleSendOtp` → `POST accounts/request-otp/`
- `handleSubmitOtp` → `POST accounts/verify-otp-for-profile/`

`handleSendOtp` adds `retry_after` to a refusal (a 429 is said in words: "You have asked for too many codes. Please try again in 25 minutes.") and both OTP thunks survive a network error with no response. A failed profile load stores a sentence, never an object (React cannot draw one).

Not persisted — the full profile/address list is refetched every session. **Reset to its initial state on `logoutUser.fulfilled`/`rejected` and `sessionEnded`**, so nothing of one customer's profile or addresses is left for the next person on the browser.

## `slice/reviewSlice.js`

State: `reviews`, `can_review`, `review_status` + `review_order_id` (the backend's answer to *why* the signed-in customer may not review: `can_review` | `reviewed` | `waiting_for_delivery` (with the number of the order they are waiting for) | `not_purchased` | `guest`), `reviewFormData` (product_id/rating/comment/media), add/update loading+completed flags. `createReview.fulfilled` sets `can_review=false` and `review_status='reviewed'` (one review per product, so the form closes). Reset to the initial state on `logoutUser.fulfilled`/`rejected` (which reviews the customer may edit, and whether they may review, are theirs).

Thunks via the authenticated client: `fetchReviews` (`GET products/reviews/?product_id=`), `createReview` (`POST products/reviews/`), `updateReview` (`PUT products/reviews/:id/`). Cosmetic typo in a thunk type string: `'review/fetchRevies'` (doesn't affect behavior). Not persisted.

## `slice/wishlistSlice.js`

State: `items`, `favouriteIds` (id lookup map for O(1) checks), add/fetch/remove loading+error.

Thunks via the authenticated client: `handleAddtoWishlist` (`POST /accounts/favourite/`), `fetchtoWishlist` (`GET /accounts/favourite/`), `handleRemovetoWishlist` (`PUT /accounts/favourite/`, not `DELETE`).

**Bug**: all three thunk type strings are prefixed `'cart/...'` (e.g. `'cart/handleAddtoWishlist'`) instead of `'wishList/...'` — a copy-paste leftover from `cartSlice`. Doesn't break functionality (the type strings are still unique) but pollutes the `cart/*` namespace in Redux DevTools/action logs and is misleading when debugging.

Sync reducers `addToWishlist`/`removeFromWishlist`/`clearWishlist` mirror `cartSlice`'s local-mutation pattern. Persisted via the root whitelist (`"wishList"`) — this is what lets a guest build a wishlist locally (via `addToWishlist` on a product card) with no auth needed; `WishList.js` only additionally fetches the server copy when signed in.

## `slice/recentlyViewedSlice.js`

Purely local, no thunks, no backend call. State: `items` (product snapshots, most-recently-viewed first) + `ids` (id lookup map, mirrors `wishlistSlice`'s `favouriteIds`). `recordViewed(product)` moves an already-seen id back to the front instead of duplicating it, then caps the list at `MAX_RECENTLY_VIEWED = 12`; `clearRecentlyViewed()` empties it. `ProductDetails.js` dispatches `recordViewed` in a `useEffect` keyed on `product?.id`, passing the trimmed snapshot `cartSlice`'s `handleClonedProduct(product)` builds — not the full product-detail API object — since this is what gets serialized to localStorage. Rendered by the homepage-only `sections/RecentlyViewed.js` (draws nothing when `items` is empty; no "View All" link, no skeleton — the data is local and synchronous). Persisted via the root whitelist (`"recentlyViewed"`).

## `slice/product/bestSellingSlice.js`, `flashSaleSlice.js`, `newArrivalSlice.js`

Three near-identical slices, each with one loading flag, one data array, one error, and one thunk (`fetchBestSellingProducts`/`fetchFlashSaleProducts`/`fetchNewArrivalProducts`) calling the matching `services/productService` function, with pagination-append logic copy-pasted from `productSlice.js` — including the same `hasMore` fix (from the backend's `next` field). None are persisted.

None of `FlashSale.js`/`BestSelling.js`/`NewArrival.js`/`FeaturedProducts.js` actually read `hasMore` (no load-more/infinite-scroll UI exists for these — each just renders a fixed `page_size:12`), so it's correct but currently unused outside `productSlice.items` (consumed by `Products.js`'s **Load more** and the homepage's All Products).

These three overlap conceptually with `categorySlice`'s flash-sale/new-arrival/best-selling fields, and with `contentSlice`'s per-page fetches — three different slices independently model "flash sale" (as products, as categories, and as page content), which is a lot of duplicated boilerplate for closely related concepts. Worth consolidating if this area is touched for a feature, not just a bug fix.

## Flagged issues

- **Auth persistence split**: `auth` is nested-persisted independently of the root `persistConfig.whitelist` — easy to overlook.
- **Inconsistent async client usage**: most slices lazy `import()` `api/axiosSetup` per-thunk to dodge circular deps; `authSlice`'s `logoutUser` (and the renewal in `api/session.js`, on purpose: it must not go through the interceptor it serves) use raw `axios` with manually attached headers instead — these calls skip the shared interceptor error handling.
- **Inconsistent auth-branching pattern**: `checkoutSlice` and `productSlice.searchSuggestions` branch client-by-auth-state; cart/wishlist/profile/review assume the user is always authenticated.
- **`wishlistSlice` action-type namespace bug** (`'cart/...'` prefix — see above).
- Excessive `console.log` of API responses left in nearly every thunk.
