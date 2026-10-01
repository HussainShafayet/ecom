# API / Services / Integration — `src/api/`, `src/services/`

## Axios setup

**`axiosSetup.js`** — the authenticated client. `baseURL: import.meta.env.VITE_BASE_URL`. Request interceptor reads `accessToken` from the Redux `auth` slice and sets `Authorization: Bearer <token>`. Response interceptor:
- First: a GET that failed with no answer or a 502/503/504 and has been tried fewer than twice is repeated after 400 ms, then 1.2 s (`api/retry.js`, `canRetry`/`retryRequest`; never a POST/PUT/DELETE, asking twice could order twice). Nobody hears of a failure the next try fixes.
- No `error.response` → `reportFailure` (below); Sentry only if `navigator.onLine` (offline is not a bug).
- `401` + not already retried → gets a new access token and retries once. The renewal (`api/session.js` `refreshSession()`, raw `axios.post` to `accounts/token/refresh/`) is **single-flight**: the backend's access token lives minutes and its refresh token is single-use (rotation + blacklist), so every request that finds the token expired waits for the same one renewal (the homepage alone sends five at once; each doing its own renewal signed valid customers out). A request whose token was already renewed by someone else while it was in flight just retries with the current one. Only the server refusing the refresh token (401) or there being none ends the session: `endSession()` (signs out, keeps no account cart, sets `auth.sessionExpired`, **no** page-wide error; `SessionExpiredBanner` offers to sign in). A dropped connection, a 5xx or a 429 during the renewal proves nothing about the session: it stays, the request fails with its 401 and (if it has a `section`) a section error. A freshly renewed token that is refused again also ends the session. A request sent with `optionalAuth: true` (every public read: the product lists, product detail, search suggestions, reviews, checkout content) is retried through `publicApi` as a guest when the session is over, instead of failing.
- Other statuses → `reportFailure(store, error)` (`api/report.js`): `setSectionError({section, error})` if `config.section` is set, else `pushToast(message, 'error')`. **There is no page-wide error any more.** The sentence is `apiErrorMessage(error)` (`api/errors.js`, shared by both clients): the backend's `errors[0]`/`error` for a 4xx it explained ("Only 1 of Kettle left in stock."), else a general one per status; 5xx is always "Something went wrong on our side…" (never the server's text); 429 says how long to wait, `retryAfterSeconds(error)` (the `Retry-After` header, readable cross-origin because the backend lists it in `CORS_EXPOSE_HEADERS`; else the seconds in DRF's own sentence; else "in a moment") said by `formatWait` ("15 seconds", "25 minutes", "2 hours"); the sign-in/sign-up/code pages count it down instead (see 04); no answer = "Could not reach the server. Check your connection…".
- Success → `clearFailure`: a section's old error is removed once one of its requests works (they used to stay until a page-wide error wiped them).

**`publicApi.js`** — unauthenticated client, same `baseURL`, `Content-Type: application/json`. No request interceptor (no auth header ever attached, by design). The response interceptor duplicates the same status→message logic and global/section dispatch pattern, but does it via a dynamic `import("../redux/store")` (to dodge a circular import) instead of the static import `axiosSetup.js` uses — an inconsistent pattern between two files that otherwise do the same job. Same leftover `console.log(section)`.

Both files derive `errorMessage` from HTTP status only — the backend error body/message itself is discarded for this generic pipeline (see "Error-handling pipeline" below).

## Endpoint inventory

| Method | Endpoint | Service fn (file) | Calling thunk / slice |
|---|---|---|---|
| GET | `/products/categories?...` | `getAllCategories` (categoryService) | `fetchAllCategories` (categorySlice) |
| GET | `/products/categories/flash-sale/?...` | `getFlashSaleCategories` | `fetchFlashSaleCategories` (categorySlice) |
| GET | `/products/categories/new-arrival/?...` | `getNewArrivalCategories` | `fetchNewArrivalCategories` (categorySlice) |
| GET | `/products/categories/best-selling/?...` | `getBestSellingCategories` | `fetchBestSellingCategories` (categorySlice) |
| GET | `/products/categories/feature/?...` | `getFeaturedCategories` | (categorySlice, featured) |
| GET | `/content/pages/home` | `getHomeContent` (contentService) | `fetchHomeContent` (contentSlice) |
| GET | `/content/pages/newarrival/` | `getNewArrivalContent` | `fetchNewArrivalContent` |
| GET | `/content/pages/flashsale` | `getFlashSaleContent` | `fetchFlashSaleContent` |
| GET | `/content/pages/best_selling` | `getBestSellingContent` | `fetchBestSellingContent` |
| GET | `/content/pages/feature` | `getFeaturedContent` | (contentSlice) |
| GET | `/content/shop` | `getShopContent` | (contentSlice) |
| GET | `/content/pages/category` | `getCategoriesContent` | (contentSlice) |
| GET | `/products?...` (page/page_size/ordering/category/brands/tags/price/sizes/colors/discount/search) | `getAllProducts` (productService) | `fetchAllProducts` (productSlice) |
| GET | `/products/new-arrivals?...` | `getNewArrivalProducts` | newArrivalSlice |
| GET | `/products/best-selling?...` | `getBestSellingProducts` | bestSellingSlice |
| GET | `/products/flash-sale?...` | `getFlashSaleProducts` | flashSaleSlice (reads `data.flash_sale`: `{starts_at, ends_at, is_live, starts_in_seconds, ends_in_seconds}` or `null`, the window measured on the server; `results` is empty while the sale is not live) |
| GET | `/products/featured?...` | `getFeaturedProducts` | `fetchFeaturedProducts` (productSlice) |
| GET | `/products/detail/{slug}` | `getProductById` | `fetchProductById` (productSlice) |
| GET | `/products/search-suggestions/?q=` | inlined in slice | `searchSuggestions` (productSlice) — authenticated client if logged in, `publicApi` otherwise |
| POST | `/accounts/register/` | inlined | `signUpUser` (authSlice, via `publicApi`) |
| POST | `/accounts/verify-otp/` | inlined | `verifyOtp` (authSlice) |
| POST | `/accounts/resend-otp/` | inlined | `resendOtp` (authSlice) |
| POST | `/accounts/login/` | inlined | `signInUser` (authSlice) |
| POST | `{baseURL}accounts/token/refresh/` (raw `axios`, bypasses both clients on purpose) | `api/session.js` `refreshSession()` | the axios interceptor (single-flight) |
| POST | `{baseURL}accounts/logout/` (raw `axios`, bypasses both clients) | inlined | `logoutUser` (authSlice) |
| GET | `/accounts/profile/` | inlined | profileSlice |
| PUT | `/accounts/profile/` | inlined | profileSlice |
| GET | `/accounts/addresses/` | inlined | profileSlice |
| POST | `/accounts/addresses/` | inlined | profileSlice |
| PUT | `/accounts/addresses/{id}/` | inlined | profileSlice |
| DELETE | `/accounts/addresses/{id}/` | inlined | profileSlice |
| POST | `accounts/request-otp/` (no leading `/`) | inlined | profileSlice |
| POST | `accounts/verify-otp-for-profile/` (no leading `/`) | inlined | profileSlice |
| POST | `/accounts/favourite/` | inlined | wishlistSlice (add) |
| GET | `/accounts/favourite/` | inlined | wishlistSlice (fetch) |
| PUT | `/accounts/favourite/` | inlined | wishlistSlice (remove — `PUT`, not `DELETE`) |
| POST | `/accounts/cart/` | inlined | cartSlice (add) |
| GET | `/accounts/cart/` | inlined | cartSlice (fetch) |
| PUT | `/accounts/cart/` | inlined | cartSlice (remove — `PUT`, not `DELETE`) |
| POST | `/orders/` | inlined | checkoutSlice (authenticated client if logged in, `publicApi` otherwise) |
| GET | `/orders/?page=&page_size=` | `getOrders` (orderService) | `fetchOrders` (orderSlice) |
| GET | `/orders/{orderId}/` | `getOrder` | `fetchOrder` (orderSlice; also the confirmation page) |
| POST | `/orders/{orderId}/cancel/` | `cancelOrder` | `cancelOrder` (orderSlice) |
| GET | `/orders/track/?order_id=&phone_number=` | `trackOrder` (uses `publicApi`) | `trackOrder` (orderSlice) |
| GET | `/content/checkout/` | inlined | checkoutSlice |
| POST | `/coupons/validate/` | `validateCoupon` (couponService, `publicApi`) | `handleApplyCoupon` (checkoutSlice) |
| GET | `/coupons/available/?subtotal=` | `getAvailableOffers` (couponService, `publicApi`, section `checkout-offers`) | `handleGetOffers` (checkoutSlice) |
| GET | `/site/` | `getSite` (siteService, `publicApi`) | `handleFetchSite` (siteSlice, dispatched once by `Layout`) |
| GET | `/site/pages/{slug}/` | `getSitePage` | none: `StaticPage` reads it into local state |
| GET | `/site/faq/` | `getFaqs` | none: `FAQPage` reads it into local state |
| POST | `/site/contact/` | `sendContactMessage` | none: `Contact` (local state) |
| POST | `/site/newsletter/` | `subscribeToNewsletter` | none: `NewsletterForm` (local state) |
| GET | `products/reviews/?product_id=` (no leading `/`) | inlined | reviewSlice |
| POST | `products/reviews/` (no leading `/`) | inlined | reviewSlice |
| PUT | `products/reviews/{id}/` (no leading `/`) | inlined | reviewSlice |

Response shape convention: a DRF-style envelope `{ data: { results, count, ... } | data: {...}, message, errors }` — thunks read `response.data.data.results` or `response.data.data`, and rejection paths return `error.response?.data` (typically containing `.errors`).

Only `categoryService.js`, `contentService.js`, `productService.js`, `orderService.js`, `siteService.js` and `couponService.js` exist under `src/services/` — auth, profile, cart, wishlist, checkout (except the coupon preview), and review calls are all inlined directly in their slices rather than routed through a service module. `productService.js`/`couponService.js` also lazy-import `axiosSetup`/`publicApi` per-call (`await import(...)`) to dodge the same circular-dependency issue many slices work around inline.

## Error-handling pipeline

Two parallel, not-quite-connected mechanisms:

1. **HTTP-interceptor pipeline** (`globalErrorSlice` + `toastSlice` + both axios interceptors): a sentence per failure (`api/errors.js`), keyed by a `config.section` string (e.g. `"categories"`, `"add-cart"`). The part of the page that owns the section reads `sectionErrors[section]` and draws `common/SectionError` (message + **Try again**; the seven homepage sections re-request just themselves, the pages without their own retry offer "Reload page"); a request without a section becomes a toast. Nothing replaces the whole page. Where a `sectionErrors` entry is set but no component reads it (e.g. `add-wishlist`), the failure is invisible — that was true before too and is not solved here.
2. **Per-thunk rejection state** (independent of `globalErrorSlice`): many `createAsyncThunk`s catch errors and `rejectWithValue(error.response?.data)`, storing them as e.g. `signinError`, `signupError`, `updateError`, `verifyOtpError` on their own slice. These are rendered via the generic `ErrorDisplay` component (`src/components/common/ErrorDisplay.js`), used on SignIn/SignUp/VerifyOtp/Profile/ProductDetails.

These two systems overlap in intent but don't share state or components — the same failed request can surface differently depending on which slice handled it, and a component can end up needing to read from both `sectionErrors` and a local slice error field.

A third, separate mechanism reports to Sentry (not the UI): both axios interceptors call `Sentry.captureException` on a network error or a 5xx response only (4xx is expected/validation, not reported), and `src/index.js` wraps `<App>` in a `Sentry.ErrorBoundary` that catches uncaught render exceptions the two systems above never see (the only full-page error left). Off unless `VITE_SENTRY_DSN` is set.

## `src/data/location.js`

Pure static data — Bangladesh administrative geography: `divisionsData` (8 divisions), `districtsData` (64 districts, each with `division_id`, lat/long), `upazilasData` (hundreds of upazilas, each with `district_id`). No API involved; used for address/location dropdowns in checkout/profile (cascading division → district → upazila selects). Includes Bengali (`bn_name`) and English names. One data oddity: an upazila entry (`id: "100"`) has a corrupted `name` field (`"{{198}}''{{199}}"`), likely a bad find/replace during data import.

## Environment / config

Vite + `@vitejs/plugin-react` (migrated off Create React App), Redux Toolkit + redux-persist + redux-thunk, axios 1.7.7, js-cookie 3.0.5, Tailwind 3.4 + PostCSS/autoprefixer (standard Vite-Tailwind config, nothing unusual). `VITE_BASE_URL` is required for every API call and is documented in `.env.example` at the repo root — copy it to `.env` and fill in a real backend URL to run the app locally. Accessed in source via `import.meta.env.VITE_BASE_URL`, not `process.env`.

## Flagged issues

- **`logoutUser` in `authSlice.js`** and the renewal in `api/session.js` bypass both axios clients, calling raw `axios.post(`${baseUrl}accounts/...`)` (no leading slash, relies on `baseUrl` ending in `/`) — inconsistent with every other call's leading-slash convention. The renewal must (it serves the interceptor); `logoutUser` gets none of the interceptor error handling.
- **Two disconnected error systems** (see above) with no shared contract — inconsistent UX and duplicated logic.
- **`axiosSetup.js` vs `publicApi.js` duplicate ~30 lines** of interceptor/error-mapping logic almost verbatim (a candidate for extraction), and use different import styles for the store (static vs. dynamic) to work around the same circular-dependency problem.
- **Only 3 of 9 API-consuming domains have a `services/` wrapper** — auth/profile/cart/wishlist/checkout/review calls are inlined in slices instead, an inconsistent layering choice.
- **Inconsistent REST verbs**: wishlist and cart "remove" both use `PUT` rather than `DELETE`.
- A few endpoint strings are missing the leading slash (profileSlice's OTP endpoints, all of reviewSlice's endpoints) — works only because axios baseURL concatenation happens to tolerate it, but inconsistent with the rest of the codebase.
- Leftover `console.log(section)` / other debug logging left in both interceptors and most thunks.
- `location.js` has the corrupted upazila name noted above.
- Confirmed frontend-only repo — no backend/server code anywhere in the tree; every endpoint above is assumed to be served by an external API reachable at `VITE_BASE_URL`.
