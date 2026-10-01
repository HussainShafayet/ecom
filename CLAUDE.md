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
npm test              # vitest run — src/__tests__: the order pages, reviews, checkout/cart error handling, the site (footer, contact, static pages, FAQ); real slices, mocked services
npm run lint            # eslint .
```

JSX-containing files in this repo use a `.js` extension, not `.jsx` — `vite.config.js` configures esbuild to parse `.js` under `src/` as JSX rather than requiring a rename. Keep new files consistent with that (`.js`, not `.jsx`) unless asked otherwise.

### Required environment variable

`VITE_BASE_URL` must be set (e.g. in a local, gitignored `.env`, see `.env.example`) or every API call fails with a network error.

### Optional environment variable

`VITE_SENTRY_DSN` turns on Sentry error tracking (`src/index.js`). Empty (the default) = off, so local dev, tests
and CI stay silent. A Sentry alert rule (Sentry dashboard, not this repo) opens a GitHub issue on this repo
automatically when a new error shows up.

## Architecture

### App shell & routing (`src/App.js`)
`BrowserRouter` → `ScrollToTop` → `Layout` (NavBar + offline/session banners + page + BottomNav + Footer + BackToTop + toasts) wraps **every** route — there is no separate auth-only layout. Only `/profile`, `/orders` and `/orders/:orderId` are wrapped in `ProtectedRoute` (redirects to `/signin` if `state.auth.isAuthenticated` is false); `/cart`, `/checkout`, `/wishlist`, `/order-confirmation/:orderId` and `/order-tracking` are reachable while logged out and each page internally branches on auth state instead.

`src/index.js` wraps the whole tree (outside the Redux `Provider`) in a `Sentry.ErrorBoundary`, which is a
different mechanism from the API error handling below: it catches uncaught **render** exceptions (a component
throwing while rendering) and is the ONLY thing that replaces the whole page; it reports to Sentry (if
`VITE_SENTRY_DSN` is set) and offers just a reload. A failed API request never takes the whole shop away.

### State management (`src/redux/`)
Redux Toolkit store (`store.js`) with `redux-persist` (localStorage). Only `cart`, `wishList` and `recentlyViewed` are persisted via the root `persistConfig.whitelist`; `auth` is **separately, independently** persisted with its own nested `persistReducer` whitelisting only `isAuthenticated` (tokens live in cookies via `js-cookie`, not redux-persist). All other slices (`product`, `category`, `checkout`, `content`, `profile`, `review`, `order`, `site`, `new_arrival`, `best_selling`, `flash_sale`, `globalError`) are not persisted.

One slice per domain under `src/redux/slice/` (plus `slice/product/` for `bestSellingSlice`, `flashSaleSlice`, `newArrivalSlice`). Most async thunks dynamically `import('../../api/axiosSetup')` inside the thunk body to avoid a circular dependency with the store — follow this pattern when adding new thunks that need the authenticated client. `checkoutSlice`/`productSlice.searchSuggestions` branch between the authenticated client and `publicApi` based on `isAuthenticated`; most other domains (cart, wishlist, profile, review) assume the user is authenticated.

### API layer (`src/api/`, `src/services/`)
Two axios instances:
- `axiosSetup.js` — authenticated client. Attaches `Authorization: Bearer <accessToken>` from Redux state; on 401 renews the access token (`api/session.js`, **one shared renewal** however many requests need it, because the backend's refresh token is single-use) and retries once. Only the server refusing the refresh token ends the session (quietly: `auth.sessionExpired` + `SessionExpiredBanner`, never a page-wide error); a dropped connection or a 5xx during the renewal keeps it. A request with `optionalAuth: true` (public reads) falls back to a guest request when the session is over.
- `publicApi.js` — unauthenticated client, same base URL, no auth header.

Both interceptors share `api/errors.js` (the sentence: the backend's own `errors[0]`/`error` for a refusal it explained, a general one otherwise, "our side" for 5xx, `Retry-After` for 429, exposed to the browser by the backend's `CORS_EXPOSE_HEADERS`), `api/report.js` (where it goes) and `api/retry.js`. A failed request is reported **in the part of the page that made it**: pass a `section` string (`{ section: 'add-cart' }`), which that part reads from `state.globalError.sectionErrors[section]` and draws as `common/SectionError` ("We couldn't load this" + **Try again**, `clearSectionError(section)` + the fetch again); a request naming no section becomes a **toast** (`pushToast`). A success of a section clears its old error. A GET that failed on the connection or a 502/503/504 is tried again twice, quietly, before anyone hears of it (never a write). Both interceptors call `Sentry.captureException` on a network error (unless the browser is offline) or a 5xx response (a bug, not something the customer did) — 4xx responses are expected/validation errors and are not reported.

Only `categoryService.js`, `contentService.js`, `productService.js`, `orderService.js`, `siteService.js` and `couponService.js` exist under `src/services/` — auth, cart, wishlist, profile, checkout, and review calls are inlined directly inside their slices rather than going through a service module. When adding new endpoints, prefer creating/extending a `services/*.js` wrapper for consistency going forward rather than inlining further, even though most of the existing codebase inlines.

There are two independent error-reporting paths in the UI: the interceptor-driven section errors/toasts described above, and separate per-thunk `rejectWithValue(error.response?.data)` payloads stored on each slice (e.g. `signinError`) and rendered via the generic `ErrorDisplay` component. They don't share state — a new feature that calls the API should decide up front which of the two error surfaces it wants to use.

### Auth flow
Phone-number + OTP based — there is no password field anywhere in `SignIn`/`SignUp`. Flow: `signUpUser`/`signInUser` → returns a `token` → app navigates to `/verify-otp/:token` → `VerifyOtp` submits the OTP together with the current guest `cartItems`/wishlist `items` so they get merged into the account server-side on success. The backend's answer to "send a code" also carries `resend_after`, `expires_in` and `length` (seconds, seconds, digits): `authSlice` keeps them as `otpTiming` and `VerifyOtp` counts, draws and validates from them (60 s / 6 digits when absent), so the numbers live in the backend's settings only. A 429 on any of the four auth calls becomes a countdown (`signinWait` …, `WaitNotice`, `useCountdown`), never DRF's raw "Request was throttled" sentence.

### Components (`src/components/`)
- `common/` — generic, mostly Redux-independent UI primitives (Button, InputField, Loader, ErrorDisplay/SuccessMessage, SearchDropdown, Slider, etc.), barrel-exported via `common/index.js`.
- `common/product/` — product-specific building blocks (ProductCard, RatingAndReview, Breadcrum).
- `common/skeleton/` — one `animate-pulse` Tailwind skeleton per loading state, no external skeleton library. The product page is built from small `common/product/` pieces (`ProductGallery`, `ProductOptions`, `QuantitySelector`, `PurchaseBar`, `CollapsibleSection`, `ShareMenu`, `RatingStars`), phone layout first.
- `sections/` — homepage/shop Redux-driven sections (HeroSection, CategoryStrip, FlashSale, BestSelling, NewArrival, FeaturedProducts, RecentlyViewed, AllProducts); the sale-style sections (`FlashSale`, `BestSelling`, `NewArrival`, `FeaturedProducts`) share a `forRoute` prop that toggles between "homepage section" and "full page" rendering; their product lists are the shared `common/ProductSection` (title row `SectionHeader` + `ProductCard`s), but the `forRoute` banner block is still copy-pasted in each — when modifying that block, check whether the same change is needed in the other three.
- `hooks/` (`useMediaQuery`, `useInView`, `useOutsideClick`, `useCountdown`, `useCountdownTo` (time left to a moment, read from the clock: the flash sale's countdown), `useDialog`: focus in/out, Tab inside, Esc and no scrolling behind a modal sheet) and `utils/` (`formatPrice`/`discountLabel`: prices are plain numbers from the backend, show them as `৳3,579` through these — unit prices AND sums (cart, checkout, orders), never `toFixed(2)` in a component; the numbers sent to the backend are the only place for that —, `minimumOrder`, `flashSale` (the flash sale's window: the server's seconds-left anchored to this clock), `productFilters`: the products page keeps what the shopper chose in its address and any change of it is a new list from page 1, see `docs/spec/02-routing-pages.md`, ...). A CMS slide/banner/video link always goes through `common/ContentLink` (product/category stay in the tab, an external address opens a new one).
- `products/` (`FilterPanel`, `FilterSheet`, `FilterSidebar`, `ActiveFilters`: the products page's filters; a bottom sheet with a draft on a phone, the same panel beside the list from `lg`), `layout/`, `cart/` (cart line, checkout bar, undo snackbar), `checkout/` (`CheckoutSummary`, `CouponOffers` (the shop's suggested coupons, tap to apply), `PlaceOrderBar`, `ShowAddress`, `CheckoutErrors`; the shared form pieces `Field`, `PhoneInput`, `OtpInput`, `AuthLayout` are in `common/`; the form's rules live in `utils/checkoutValidation.js`: phone is `+880` + 10 digits, the backend's rule, in `utils/phone.js`), `profile/` (`ProfileHeader`, `PersonalInfo`, `VerifySheet`, `AddressesTab`, `AddressForm`, `AddressItem`: the account page in the sign-in pages' look; a new phone/e-mail is verified in a bottom sheet, one `AddressForm` adds AND changes an address and closes only after the shop took it, Delete asks in the card, nothing speaks through `alert()`/`confirm()`; the places come from `utils/location.js` (`districtsOf`, `upazilasOf`, by name)), `orders/` — page-shell and domain-specific composite components (`orders/`: status badge, small progress timeline, item list, `OrderTotals` (the sums, a coupon's discount included), copy-order-ID button and formatters shared by the four order pages; money there is `formatPrice`, Cancel asks in the page, and "My orders" is a "Load more" list).

### Styling
Tailwind CSS, utility-first, with **no theme customization** — no semantic color/spacing tokens in `tailwind.config.js` (colors like `blue-500`/`gray-700` are hardcoded per component). `BackToTop` is the one component using CSS Modules instead of Tailwind. Match the existing per-component utility-class style rather than introducing a new styling approach unless asked.

## Known issues / landmines

These are pre-existing bugs and inconsistencies worth knowing before touching related code, so they aren't mistaken for intentional behavior or accidentally reintroduced elsewhere:

- **`wishlistSlice` action types are prefixed `'cart/...'`** (copy-paste leftover from `cartSlice`) instead of `'wishList/...'` — cosmetic (types are still unique) but shows up wrong in Redux DevTools.
- **Cart/wishlist "remove" endpoints use `PUT`, not `DELETE`** (`/accounts/cart/`, `/accounts/favourite/`) — intentional per the backend contract, not a bug to "fix" without checking the backend.
- **`ProductCard .js`** (under `src/components/common/product/`) has a literal trailing space in the filename, and `common/index.js` imports it with that space — copy the exact filename if touching this component.
- **`logoutUser` in `authSlice.js`** (and the token renewal in `api/session.js`, deliberately) bypass both axios clients and call raw `axios` directly — no shared interceptor error handling.

## Extending the app

- **New page/route**: add the component under `src/pages/` (or `src/pages/others/`, `src/pages/user/`), register it in `src/App.js` inside the existing `Routes`/`Layout` tree, and wrap in `<ProtectedRoute>` if it must require auth.
- **New piece of global state**: add a slice under `src/redux/slice/`, register its reducer in the `combineReducers` call in `src/redux/store.js`, and only add it to `persistConfig.whitelist` if it genuinely needs to survive a refresh (most slices intentionally don't).
- **New API call**: add it to (or create) a `src/services/*.js` module rather than inlining it in the slice; use `axiosSetup`'s client for authenticated calls and `publicApi` for public ones, and pass a `section` in the request config so a failure is shown where that part of the page would have been (`common/SectionError`, give it an `onRetry` that clears the section and asks again); without one it becomes a toast. Mark a read the shop shows to everyone `optionalAuth: true` so it survives an expired session as a guest.
- **A customer action the shop may refuse** (placing an order, a cart quantity, add to cart): show the backend's `errors` sentences where the customer acted (`CheckoutErrors` above *Place Order*, the Cart's quantity message, the product card's message) and put the state back to what the server holds; never leave it at a `console.log`. `minimum_order_quantity` on a card/cart line is the product's smallest order (`src/utils/minimumOrder.js`).
- **Anything the shop owner should be able to change** (the shop's name, logo, contact details, social links, the announcement bar, the text of About / Privacy / Terms, the FAQ) comes from the backend, never from the code: `state.site` (`selectSite`, read once by `Layout` from `GET /site/`) and `/pages/:slug` (`GET /site/pages/{slug}/`). Draw nothing for what the admin left empty. The static pages are written in Django admin > Site > Static pages, not in a component.
- **New UI component**: follow the existing `common/` vs `sections/` vs domain-folder (`checkout/`, `profile/`) split, export it through that folder's `index.js` barrel, and style with inline Tailwind utility classes matching neighboring components (no shared design tokens exist to reference yet).
