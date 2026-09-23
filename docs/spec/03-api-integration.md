# API / Services / Integration — `src/api/`, `src/services/`

## Axios setup

**`axiosSetup.js`** — the authenticated client. `baseURL: import.meta.env.VITE_BASE_URL`. Request interceptor reads `accessToken` from the Redux `auth` slice and sets `Authorization: Bearer <token>`. Response interceptor:
- No `error.response` → dispatches `setGlobalError("Network error...")`.
- `401` + not already retried → reads the `refresh_token` cookie, dispatches the `refreshToken` thunk, retries the original request with the new token; on failure dispatches `Logout()` + `setGlobalError("Session expired...")`.
- Other statuses → mapped via `getErrorMessage(status)` (400/403/404/429/5xx + default) and dispatched as `setSectionError({section, error})` if `config.section` is set, else `setGlobalError`.
- Leaves a stray `console.log(section)` debug statement.

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
| GET | `/products/flash-sale?...` | `getFlashSaleProducts` | flashSaleSlice |
| GET | `/products/featured?...` | `getFeaturedProducts` | `fetchFeaturedProducts` (productSlice) |
| GET | `/products/detail/{slug}` | `getProductById` | `fetchProductById` (productSlice) |
| GET | `/products/search-suggestions/?q=` | inlined in slice | `searchSuggestions` (productSlice) — authenticated client if logged in, `publicApi` otherwise |
| POST | `/accounts/register/` | inlined | `signUpUser` (authSlice, via `publicApi`) |
| POST | `/accounts/verify-otp/` | inlined | `verifyOtp` (authSlice) |
| POST | `/accounts/resend-otp/` | inlined | `resendOtp` (authSlice) |
| POST | `/accounts/login/` | inlined | `signInUser` (authSlice) |
| POST | `{baseURL}accounts/token/refresh/` (raw `axios`, bypasses both clients) | inlined | `refreshToken` (authSlice) |
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
| GET | `/content/checkout/` | inlined | checkoutSlice |
| GET | `products/reviews/?product_id=` (no leading `/`) | inlined | reviewSlice |
| POST | `products/reviews/` (no leading `/`) | inlined | reviewSlice |
| PUT | `products/reviews/{id}/` (no leading `/`) | inlined | reviewSlice |

Response shape convention: a DRF-style envelope `{ data: { results, count, ... } | data: {...}, message, errors }` — thunks read `response.data.data.results` or `response.data.data`, and rejection paths return `error.response?.data` (typically containing `.errors`).

Only `categoryService.js`, `contentService.js`, and `productService.js` exist under `src/services/` — auth, profile, cart, wishlist, checkout, and review calls are all inlined directly in their slices rather than routed through a service module (3 of 9 domains have a service layer, the rest don't). `productService.js` also lazy-imports `axiosSetup` per-call (`await import(...)`) to dodge the same circular-dependency issue many slices work around inline.

## Error-handling pipeline

Two parallel, not-quite-connected mechanisms:

1. **HTTP-interceptor pipeline** (`globalErrorSlice` + both axios interceptors): generic status-code messages, keyed by a `config.section` string (e.g. `"categories"`, `"add-cart"`). `GlobalErrorHandler` (wraps the whole `<App>`) watches `globalError` and, if set, replaces the entire UI with a full-screen error overlay + "Retry Connection" button (`window.location.reload()`). Section-scoped errors (`sectionErrors[section]`) are read ad hoc via `useSelector` in roughly a dozen individual components — there's no shared display component for these; each renders its own error UI (or none).
2. **Per-thunk rejection state** (independent of `globalErrorSlice`): many `createAsyncThunk`s catch errors and `rejectWithValue(error.response?.data)`, storing them as e.g. `signinError`, `signupError`, `updateError`, `verifyOtpError` on their own slice. These are rendered via the generic `ErrorDisplay` component (`src/components/common/ErrorDisplay.js`), used on SignIn/SignUp/VerifyOtp/Profile/ProductDetails.

These two systems overlap in intent but don't share state or components — the same failed request can surface differently depending on which slice handled it, and a component can end up needing to read from both `sectionErrors` and a local slice error field.

## `src/data/location.js`

Pure static data — Bangladesh administrative geography: `divisionsData` (8 divisions), `districtsData` (64 districts, each with `division_id`, lat/long), `upazilasData` (hundreds of upazilas, each with `district_id`). No API involved; used for address/location dropdowns in checkout/profile (cascading division → district → upazila selects). Includes Bengali (`bn_name`) and English names. One data oddity: an upazila entry (`id: "100"`) has a corrupted `name` field (`"{{198}}''{{199}}"`), likely a bad find/replace during data import.

## Environment / config

Vite + `@vitejs/plugin-react` (migrated off Create React App), Redux Toolkit + redux-persist + redux-thunk, axios 1.7.7, js-cookie 3.0.5, Tailwind 3.4 + PostCSS/autoprefixer (standard Vite-Tailwind config, nothing unusual). `VITE_BASE_URL` is required for every API call and is documented in `.env.example` at the repo root — copy it to `.env` and fill in a real backend URL to run the app locally. Accessed in source via `import.meta.env.VITE_BASE_URL`, not `process.env`.

## Flagged issues

- **`refreshToken`/`logoutUser` in `authSlice.js`** bypass both axios clients, calling raw `axios.post(`${baseUrl}accounts/token/refresh/`...)` (no leading slash, relies on `baseUrl` ending in `/`) — inconsistent with every other call's leading-slash convention, and these calls get none of the interceptor error handling.
- **Two disconnected error systems** (see above) with no shared contract — inconsistent UX and duplicated logic.
- **`axiosSetup.js` vs `publicApi.js` duplicate ~30 lines** of interceptor/error-mapping logic almost verbatim (a candidate for extraction), and use different import styles for the store (static vs. dynamic) to work around the same circular-dependency problem.
- **Only 3 of 9 API-consuming domains have a `services/` wrapper** — auth/profile/cart/wishlist/checkout/review calls are inlined in slices instead, an inconsistent layering choice.
- **Inconsistent REST verbs**: wishlist and cart "remove" both use `PUT` rather than `DELETE`.
- A few endpoint strings are missing the leading slash (profileSlice's OTP endpoints, all of reviewSlice's endpoints) — works only because axios baseURL concatenation happens to tolerate it, but inconsistent with the rest of the codebase.
- Leftover `console.log(section)` / other debug logging left in both interceptors and most thunks.
- `location.js` has the corrupted upazila name noted above.
- Confirmed frontend-only repo — no backend/server code anywhere in the tree; every endpoint above is assumed to be served by an external API reachable at `VITE_BASE_URL`.
