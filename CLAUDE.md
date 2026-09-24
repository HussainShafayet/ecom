# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For full detail beyond what's summarized here (every Redux slice, every route, the full API endpoint inventory, every component), see the module-wise spec under [`docs/spec/`](docs/spec/README.md). Keep both this file and `docs/spec/*.md` in sync with the codebase as it changes — the `spec-sync` skill (`.claude/skills/spec-sync/SKILL.md`) automates deciding what needs updating and how.

## Project overview

GoCart is a **frontend-only** e-commerce single-page app built with React 19, Vite, Redux Toolkit, and Tailwind CSS. There is no backend code in this repo — every API call goes to an external REST service reachable at `VITE_BASE_URL`, using a Django-REST-Framework-style response envelope (`{ data: {...}, message, errors }`).

## Commands

```bash
npm install        # install dependencies
npm run dev         # Vite dev server, http://localhost:3000
npm run build        # production build (outputs to build/)
npm run preview       # locally preview the production build
npm test              # vitest run — src/__tests__/orders.test.js covers the order pages (real slice, mocked orderService)
npm run lint            # eslint .
```

JSX-containing files in this repo use a `.js` extension, not `.jsx` — `vite.config.js` configures esbuild to parse `.js` under `src/` as JSX rather than requiring a rename. Keep new files consistent with that (`.js`, not `.jsx`) unless asked otherwise.

### Required environment variable

`VITE_BASE_URL` must be set (e.g. in a local, gitignored `.env`, see `.env.example`) or every API call fails with a network error.

## Architecture

### App shell & routing (`src/App.js`)
`BrowserRouter` → `GlobalErrorHandler` → `ScrollToTop` → `Layout` (NavBar + page + BottomNav + Footer + BackToTop) wraps **every** route — there is no separate auth-only layout. Only `/profile`, `/orders` and `/orders/:orderId` are wrapped in `ProtectedRoute` (redirects to `/signin` if `state.auth.isAuthenticated` is false); `/cart`, `/checkout`, `/wishlist`, `/order-confirmation/:orderId` and `/order-tracking` are reachable while logged out and each page internally branches on auth state instead.

### State management (`src/redux/`)
Redux Toolkit store (`store.js`) with `redux-persist` (localStorage). Only `cart` and `wishList` are persisted via the root `persistConfig.whitelist`; `auth` is **separately, independently** persisted with its own nested `persistReducer` whitelisting only `isAuthenticated` (tokens live in cookies via `js-cookie`, not redux-persist). All other slices (`product`, `category`, `checkout`, `content`, `profile`, `review`, `order`, `new_arrival`, `best_selling`, `flash_sale`, `globalError`) are not persisted.

One slice per domain under `src/redux/slice/` (plus `slice/product/` for `bestSellingSlice`, `flashSaleSlice`, `newArrivalSlice`). Most async thunks dynamically `import('../../api/axiosSetup')` inside the thunk body to avoid a circular dependency with the store — follow this pattern when adding new thunks that need the authenticated client. `checkoutSlice`/`productSlice.searchSuggestions` branch between the authenticated client and `publicApi` based on `isAuthenticated`; most other domains (cart, wishlist, profile, review) assume the user is authenticated.

`src/context/CartContext.js` is a leftover, unused standalone cart implementation (`useState`-based, not wired into the app anywhere) — the real cart lives in `cartSlice.js`. Do not build on `CartContext`; treat it as dead code unless asked to remove it.

### API layer (`src/api/`, `src/services/`)
Two axios instances:
- `axiosSetup.js` — authenticated client. Attaches `Authorization: Bearer <accessToken>` from Redux state; on 401 auto-refreshes via the `refresh_token` cookie and retries once, logging the user out on failure.
- `publicApi.js` — unauthenticated client, same base URL, no auth header.

Both interceptors map HTTP status → a generic message and dispatch it to `globalErrorSlice`, either as a page-wide `setGlobalError` or, if the request config sets a `section` string (`{ section: 'add-cart' }` etc.), a scoped `setSectionError` that individual components read via `state.globalError.sectionErrors[section]`. Follow this `section` convention for new calls that should show inline (not full-page) errors.

Only `categoryService.js`, `contentService.js`, `productService.js` and `orderService.js` exist under `src/services/` — auth, cart, wishlist, profile, checkout, and review calls are inlined directly inside their slices rather than going through a service module. When adding new endpoints, prefer creating/extending a `services/*.js` wrapper for consistency going forward rather than inlining further, even though most of the existing codebase inlines.

There are two independent error-reporting paths in the UI: the interceptor-driven `globalErrorSlice`/`GlobalErrorHandler` full-page overlay described above, and separate per-thunk `rejectWithValue(error.response?.data)` payloads stored on each slice (e.g. `signinError`) and rendered via the generic `ErrorDisplay` component. They don't share state — a new feature that calls the API should decide up front which of the two error surfaces it wants to use.

### Auth flow
Phone-number + OTP based — there is no password field anywhere in `SignIn`/`SignUp`. Flow: `signUpUser`/`signInUser` → returns a `token` → app navigates to `/verify-otp/:token` → `VerifyOtp` submits the OTP together with the current guest `cartItems`/wishlist `items` so they get merged into the account server-side on success.

### Components (`src/components/`)
- `common/` — generic, mostly Redux-independent UI primitives (Button, InputField, Loader, Accordion, ErrorDisplay/SuccessMessage, SearchDropdown, Slider, etc.), barrel-exported via `common/index.js`.
- `common/product/` — product-specific building blocks (ProductCard, Sidebar, SelectFilter, RatingAndReview, Breadcrum).
- `common/skeleton/` — one `animate-pulse` Tailwind skeleton per loading state, no external skeleton library.
- `sections/` — homepage/shop Redux-driven sections (HeroSection, FlashSale, BestSelling, NewArrival, FeaturedProducts, CategoriesSection, AllProducts); the sale-style sections (`FlashSale`, `BestSelling`, `NewArrival`, `FeaturedProducts`) share a `forRoute` prop that toggles between "homepage section" and "full page" rendering and are ~90% duplicated JSX — when modifying one of these, check whether the same change is needed in the other three.
- `layout/`, `checkout/`, `profile/`, `orders/` — page-shell and domain-specific composite components (`orders/`: status badge, progress timeline, item list and formatters shared by the order pages).

### Styling
Tailwind CSS, utility-first, with **no theme customization** — no semantic color/spacing tokens in `tailwind.config.js` (colors like `blue-500`/`gray-700` are hardcoded per component). `BackToTop` is the one component using CSS Modules instead of Tailwind. Match the existing per-component utility-class style rather than introducing a new styling approach unless asked.

## Known issues / landmines

These are pre-existing bugs and inconsistencies worth knowing before touching related code, so they aren't mistaken for intentional behavior or accidentally reintroduced elsewhere:

- **Pagination `hasMore` is effectively broken**: `productSlice`, `bestSellingSlice`, `flashSaleSlice`, `newArrivalSlice` all compute `hasMore` from `action.meta.arg.limit`, but the thunk argument is actually named `page_size` — so `hasMore` never reflects reality. Fix (or work around) all four if touching "load more" logic.
- **`wishlistSlice` action types are prefixed `'cart/...'`** (copy-paste leftover from `cartSlice`) instead of `'wishList/...'` — cosmetic (types are still unique) but shows up wrong in Redux DevTools.
- **Cart/wishlist "remove" endpoints use `PUT`, not `DELETE`** (`/accounts/cart/`, `/accounts/favourite/`) — intentional per the backend contract, not a bug to "fix" without checking the backend.
- **`ProductCard .js`** (under `src/components/common/product/`) has a literal trailing space in the filename, and `common/index.js` imports it with that space — copy the exact filename if touching this component.
- **Post-login redirect-to-previous-page is broken**: `SignIn` computes a `from` location but never passes it through the `/verify-otp/:token` navigation, so users always land on `/` after verifying OTP regardless of where they started.
- **`refreshToken`/`logoutUser` in `authSlice.js`** bypass both axios clients and call raw `axios` directly — they don't get the shared interceptor error handling.
- A large amount of commented-out dead code exists throughout (an old `WishList` implementation, cart/wishlist localStorage helpers, disabled middlewares) — don't assume commented code is a TODO to finish; confirm with the user before reviving it.

## Extending the app

- **New page/route**: add the component under `src/pages/` (or `src/pages/others/`, `src/pages/user/`), register it in `src/App.js` inside the existing `Routes`/`Layout` tree, and wrap in `<ProtectedRoute>` if it must require auth.
- **New piece of global state**: add a slice under `src/redux/slice/`, register its reducer in the `combineReducers` call in `src/redux/store.js`, and only add it to `persistConfig.whitelist` if it genuinely needs to survive a refresh (most slices intentionally don't).
- **New API call**: add it to (or create) a `src/services/*.js` module rather than inlining it in the slice; use `axiosSetup`'s client for authenticated calls and `publicApi` for public ones, and pass a `section` in the request config if the error should be shown inline near the relevant UI instead of as a full-page overlay.
- **New UI component**: follow the existing `common/` vs `sections/` vs domain-folder (`checkout/`, `profile/`) split, export it through that folder's `index.js` barrel, and style with inline Tailwind utility classes matching neighboring components (no shared design tokens exist to reference yet).
