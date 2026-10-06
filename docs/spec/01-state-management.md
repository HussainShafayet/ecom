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

Sync reducers `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` operate purely on local `cartItems` (no API call), matched on `id` + optional `variant_id`. Selectors: `selectCartItems`, `selectCartCount`, `selectTotalPrice` (uses `discount_price` if `has_discount` else `base_price`). Helper `handleClonedProduct(...)` builds a cart-item DTO from a product/variant (a line added from a card has no `variant_id`, one read from the server has: the wishlist's "Add all to cart" finds a product's line by `id`, `utils/addProductToCart.sortForAddAll`) (it keeps `minimum_order_quantity`, which the cart and the product cards use: `src/utils/minimumOrder.js` has `minimumOf`, `belowMinimum` and `minimumOrderProblems`, worded like the backend's checkout refusal).

Persisted via the root whitelist (`"cart"`).

## `slice/categorySlice.js`

Pure read state for 5 category groupings (all, flash-sale, new-arrival, best-selling, featured), each with its own loading/error. 5 thunks call `services/categoryService`. No sync reducers. Not persisted.

## `slice/checkoutSlice.js`

Large form-state slice: `formData` (shipping/payment fields), `errors`, `touched`, `districts`/`upazilas`, `addresses`, `delivery_charges`, `user_info`, `order_id`, `order` (the `POST /orders/` answer `{order_id, status, created_at, subtotal, delivery_charge, discount_amount, coupon_code, total}`, handed to the confirmation page; cleared by `resetForm`), `responseError` (**always an array of sentences** or null: the backend's `errors` when it refused the order, else one general sentence; shown by `CheckoutErrors`; cleared by a new attempt (`handleCheckout.pending`), by `clearResponseError` and by `resetForm`), `isCheckoutFulfilled`; plus a promo-code preview: `couponStatus` (`idle | validating | applied | failed`), `couponError`, `discountAmount`, `appliedCouponCode` (stored upper case, matching the backend), all cleared by `clearCoupon` and by `resetForm`; and the shop's suggested coupons: `offers` (the `GET /coupons/available/` list, `[]` when none or when the request failed) and `offersRequestId` (the newest request: an older answer, e.g. for a cart that changed meanwhile, is dropped), both cleared by `resetForm`.

Thunks:
- `handleCheckout` → `POST /orders/` (branches authenticated client vs `publicApi`; dispatches `clearCart()` on success; sends `coupon_code` when one is applied)
- `handleGetCheckoutContent` → `GET /content/checkout/` (same auth branching; populates `formData.name/phone/email` from `user_info`)
- `handleGetOffers(subtotal)` → `GET /coupons/available/?subtotal=` (`getAvailableOffers`, public, section `checkout-offers`) — a hint: a failure leaves `offers` empty and shows nothing (the section's error is stored but nothing renders it, and there is no toast); the page asks on mount and whenever the subtotal changes.
- `handleApplyCoupon` → `POST /coupons/validate/` (`services/couponService.js`, public) — previews a coupon's discount against the cart's current subtotal; does not place the order, and the actual redemption at `handleCheckout` time always re-validates against the server's own subtotal.

Plain thunk `initializeCheckout()` dispatches `handleGetCheckoutContent` and, if authenticated, `handleFetchCart()` — cross-slice orchestration living outside any single slice file. Profile name/phone/email and saved addresses both come from `handleGetCheckoutContent` (`GET /content/checkout/` returns `user_info` + `shipping_addresses` together); a selected saved address then fills the rest of the form via `ShowAddress.js` (`checkout/`, see [04-components-ui.md](04-components-ui.md)). Not persisted by redux-persist, but a GUEST's contact and delivery fields are kept in `sessionStorage` (`utils/checkoutDraft`, see the checkout flow in [02-routing-pages.md](02-routing-pages.md)): for a guest with a saved draft `initializeCheckout` waits for the content and then dispatches `restoreDraft(draft)` (fills the fields that are still empty and rebuilds the `districts`/`upazilas` lists the saved division and district need); `handleGetCheckoutContent.fulfilled` overwrites `formData.name/phone_number/email` with the profile's (empty for a guest), which is why the draft goes back after it.

## `slice/orderSlice.js`

A customer's orders. Calls go through `services/orderService.js` (not inlined). Not persisted; **reset to its initial state on `logoutUser.fulfilled`/`rejected`**, so nothing of one customer's orders is left for the next person on the browser. Errors are stored as the backend's `errors` sentences (an array, for `ErrorDisplay`).

State: `orders`/`ordersCount`/`ordersNext`/`ordersPrevious`/`ordersLoading`/`ordersError`/`ordersStatus`/`ordersRequestId` (the list page: `ordersStatus` is the statuses the list is for, `""` = all, and a request for another one empties it first, so a list is never drawn for another filter; an answer for another filter, or an older first page that arrives late, is dropped; page 1 replaces `orders`, a later page — "Load more" — is appended under it, an order id already there is not added twice, and a page that fails leaves what was loaded), `order`/`orderLoading`/`orderError`/`orderNotFound` (detail and confirmation; `orderNotFound` is true when the backend answered 404, which trying again will not change — `fetchOrder` passes the status on in its rejection), `cancelLoading`/`cancelError`, `returnLoading`/`returnError` (asking to return items of a delivered order) and `returnCancel` (`{id, loading, error}`: the request being called off, so its sentence shows under that request only), `buyAgain` (`{loading, added, skipped, done}`: the lines `buyOrderAgain` put in the cart and the sentences for those it could not; cleared by `clearOrder`), `tracking`/`trackingLoading`/`trackingError` (the guest lookup), `ordersTotal` (how many orders the customer has, for the account page: `null` until `fetchOrdersTotal` has been answered, and it stays `null` if that fails; apart from `ordersCount`, which a filter narrows, and a request for it never touches `orders`/`ordersStatus`).

Thunks: `fetchOrders({page, page_size, status})` → `GET /orders/` (`status` one or a comma list); `buyOrderAgain(items)` → `POST /accounts/cart/` once per line (`{product_id, variant_id, quantity, action: 'increase'}`, one at a time so a refused line does not stop the others; a line with no product or variant is not asked about) and then `handleFetchCart`; `fetchOrdersTotal()` → `GET /orders/?page=1&page_size=1` (only the `count` is read; its own section `orders-total`, so a failure is not the orders page's); `fetchOrder(orderId)` → `GET /orders/{id}/`; `cancelOrder(orderId)` → `POST /orders/{id}/cancel/` (replaces `order` with the answer and updates the row in `orders`); `requestOrderReturn({orderId, reason, details, items: [{item_id, quantity}]})` → `POST /orders/{id}/returns/` and `cancelOrderReturn({orderId, requestId})` → `POST /orders/{id}/returns/{requestId}/cancel/` (both answer with the order, whose `returns` block replaces `order` — but only if that order is still the one on the page, an answer for another one is dropped; a refusal is the shop's sentences in `returnError` / `returnCancel.error`; `clearOrder` and logout empty them); `trackOrder({order_id, phone_number})` → `GET /orders/track/` (public client). Sync reducers: `clearOrder`, `clearTracking`.

## `slice/siteSlice.js`

The shop's own identity, written by the admin (Django admin > Site) and read once by `Layout` (`handleFetchSite` → `services/siteService.getSite` → `GET /site/`). Not persisted. State: `site` (`name`, `tagline`, `logo`, `announcement`, `contact`, `social_links`, `trust_badges`, `footer_pages`), `isLoaded`, `isLoading`, `error`. `announcement` is `{text, link, endsAt}` or `null`: the backend sends `ends_in_seconds` (how long the bar has left, measured by ITS clock, `null` when the admin set no end) and `handleFetchSite` turns it into `endsAt`, a moment on this device's clock as of when the answer arrived (`utils/announcement.js` `anchorAnnouncement`, the same idea as the flash sale's window), `null` for no end; the backend already sends `announcement: null` once the end has passed. `EMPTY_SITE` is the value before the answer arrives and when it never does: an empty name draws no copyright line, no announcement draws no bar, no social link draws no icon, no trust badge draws no strip, so nothing is invented for what the shop has not said. A partial answer is merged over `EMPTY_SITE` (`trust_badges` falls back to `[]`, so a backend that does not send it yet still works). Read with `useSelector(selectSite)`. `Layout` also sets `document.title` to `name | tagline` once the name is known.

The contact form, the newsletter box, a static page and the FAQ keep their state in the component (they belong to one page each) and call `siteService` directly; the sentences to show for a failed request come from `utils/errorMessages.js`.

## `slice/testimonialsSlice.js`

What customers say, for the homepage (`fetchTestimonials` → `services/reviewService.getFeaturedReviews` → `GET /products/reviews/featured/`, public). Not persisted. State: `reviews` (at most 8: `{id, reviewer, rating, comment, created_at, verified, product_name, product_slug, image}`; `[]` until there is one) and `isLoading`. Only decoration, so a failed request keeps what there was (nothing the first time) and says nothing: the request names its own section (`home-testimonials`, no toast) and nothing renders that section's error.

## `slice/contentSlice.js`

CMS-style content per page (home/new-arrival/flash-sale/best-selling/featured/shop/categories): `image_sliders`, `video_sliders`, banners (`left_banner`, `right_banner` and, for the Home page only, `mid_banner`: set by `fetchHomeContent`, `null` from a backend that sends none, cleared when it fails; every item carries `cta_label`, the words on its button), plus shop-only fields (`tags`, `brands`, `colors`, `sizes`, `price_range`, `discounts`). 7 near-identical thunks hitting `services/contentService`. A single shared `isLoading`/`error` covers six of the 7 async flows — concurrent fetches can clobber each other's loading state (unlike `categorySlice`, which has per-section flags). The seventh, `fetchShopContent` (the lists the products page filters by), has its own flags `shopLoading`, `shopLoaded` and `shopError` (a **sentence**, `apiErrorMessage`), so another content request can neither draw nor hide the filters, and a failed refresh keeps the lists that were loaded. Not persisted.

## `slice/globalErrorSlice.js`

The errors of the parts of a page, by the `section` a request was made with: `sectionErrors` (map). Reducers: `setSectionError`, `clearSectionError`, `clearAllErrors`. No thunks. Not persisted. There is no page-wide error any more (`globalError`/`setGlobalError` and the `GlobalErrorHandler` screen are gone): a part reads its own entry and draws `common/SectionError`. The interceptors set an entry when a request of that section fails and clear it when one succeeds. See [03-api-integration.md](03-api-integration.md).

## `slice/pageTitleSlice.js`

The name of the page being looked at, for the browser tab: `{title: ''}`, `setPageTitle(name)` (anything that is not a string becomes none), `selectPageTitle` (`''` in a store without the slice). Pages set it through `hooks/usePageTitle(title)` (an effect that sets it and empties it again when the page goes, so the next page without a name does not inherit it); **`Layout` is the only writer of `document.title`** (`utils/pageTitle.documentTitle`: "Red Mug | GoCart", the shop's own "GoCart | Everyday things" for a page with no name, only the page's name until `GET /site/` has answered, and the title the HTML came with while there is nothing to say), so two things can never fight over the tab. Not persisted. Names: Products (the category, `Results for “mug”` or `All products`), a product (its name, once it has arrived), Cart, Checkout, Wishlist, My orders, `Order GC-…`, Order placed, My account, Sign in, Create account, Verify your phone, Contact us, FAQ, Track your order, Categories, Flash sale, New arrivals, Best selling, Featured products (the four sale pages only as routes), a page the admin wrote (its own title; "Page not found" when there is none), 404. The home page has none: it shows the shop's own title. The printable invoice sits outside `Layout` and names its tab itself.

## `slice/toastSlice.js`

Short messages over the page: `items` `[{id, message, type}]` (`type` `error`|`success`|`info`). `showToast` (an identical message+type already showing is not added twice: five failed requests with one cause are one toast), `dismissToast`, and the thunk `pushToast(message, type = 'info', ms = 6000)` which shows one and removes it after `ms`. `selectToasts` tolerates a store without this slice. Drawn by `common/Toaster` (in `Layout`). Used by the interceptors for a failed request that names no `section`, and by `OfflineBanner` ("You're back online."). Not persisted.

## `slice/productSlice.js`

State: product list (`items`), single `product` detail, variant selection (`selectedColor`/`selectedSize`/`mainImage`/`quantity`/`minimum_quantity`; loading a product picks its first colour and size and sets `quantity` to its minimum order, 1 when it has none; `setQuantity` clamps a wanted number between `minimum_quantity` and the exported `MAX_QUANTITY` = 10000, the backend cart's limit, and replaced `incrementQuantity`/`decrementQuantity`), search (`suggestions`), and the list's bookkeeping (the old `isSidebarOpen` / `sortType` flags are gone: the filter sheet's open state is the products page's own, and the sort lives in the address): `hasMore` (pagination flag), `count` (the backend's `count`: how many products the shop has for this list), `isLoadingMore` (`isLoading` for a page after the first, so the list stays on the screen), `listKey` (which list `items` is: the products page passes its query string as `key`, and another page's request leaves it undefined, so the page never draws a list that another page loaded), `listPage` (the last page loaded), `listRequestId` (only the latest request's answer is applied: a slow answer for an old list never lands on a new one) and `savedList` (`{key, items, page, hasMore, count, at}`: the products page's own list as it was last loaded, written whenever a request that carries a `key` is answered, **kept apart because the product page (related products), the cart (suggestions) and the home page load their own products into `items`**; `restoreProductsList` puts it back as `items`, forgets any request still on its way, and is what Back to the list uses).

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

Three near-identical slices, each with one loading flag, one data array, one error, and one thunk (`fetchBestSellingProducts`/`fetchFlashSaleProducts`/`fetchNewArrivalProducts`) calling the matching `services/productService` function, with pagination-append logic copy-pasted from `productSlice.js` — including the same `hasMore` fix (from the backend's `next` field). None are persisted. **`flashSaleSlice` also keeps `flash_window`** — the flash sale's window from `GET /products/flash-sale/`'s `flash_sale` (the shop's seconds-left turned into moments on this device's clock *as of when the answer arrived*, by `utils/flashSale.anchorFlashSale`: `{isLive, startsAt, endsAt}` in ms, `null` when the shop set no window, i.e. the sale is always on and there is no countdown). The window is set by the latest answer of the thunk, so a window the shop takes away is forgotten.

None of `FlashSale.js`/`BestSelling.js`/`NewArrival.js`/`FeaturedProducts.js` actually read `hasMore` (no load-more/infinite-scroll UI exists for these — each just renders a fixed `page_size:12`), so it's correct but currently unused outside `productSlice.items` (consumed by `Products.js`'s **Load more** and the homepage's All Products).

These three overlap conceptually with `categorySlice`'s flash-sale/new-arrival/best-selling fields, and with `contentSlice`'s per-page fetches — three different slices independently model "flash sale" (as products, as categories, and as page content), which is a lot of duplicated boilerplate for closely related concepts. Worth consolidating if this area is touched for a feature, not just a bug fix.

## Flagged issues

- **Auth persistence split**: `auth` is nested-persisted independently of the root `persistConfig.whitelist` — easy to overlook.
- **Inconsistent async client usage**: most slices lazy `import()` `api/axiosSetup` per-thunk to dodge circular deps; `authSlice`'s `logoutUser` (and the renewal in `api/session.js`, on purpose: it must not go through the interceptor it serves) use raw `axios` with manually attached headers instead — these calls skip the shared interceptor error handling.
- **Inconsistent auth-branching pattern**: `checkoutSlice` and `productSlice.searchSuggestions` branch client-by-auth-state; cart/wishlist/profile/review assume the user is always authenticated.
- **`wishlistSlice` action-type namespace bug** (`'cart/...'` prefix — see above).
- Excessive `console.log` of API responses left in nearly every thunk.
