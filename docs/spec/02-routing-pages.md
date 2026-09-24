# Routing & Page/User-Flow — `src/App.js`, `src/pages/`

## App shell

`BrowserRouter` → `GlobalErrorHandler` → `ScrollToTop` → `Layout` (wraps every route) → `Routes`. On mount, `App.js` dispatches `loadUserFromStorage()` (`authSlice`) to rehydrate auth from cookies. `Layout` (`src/components/layout/Layout.js`) renders `NavBar` + `<main>{children}</main>` + `BottomNav` + `Footer` + `BackToTop` around **all** routes uniformly — there is no separate "auth layout" without nav/footer chrome.

## Route table

| Path | Element | Auth | Notes |
|---|---|---|---|
| `/` | `Home` | none | Composes `HeroSection`, `FlashSale`, `NewArrival`, `CategoriesSection`, `BestSelling`, `FeaturedProducts`, `AllProducts`; `Testimonials` is commented out. |
| `/products` | `Products` | none | Reads/writes query params (`category`, `brands`, `tags`, `min_price`, `max_price`, `sizes`, `colors`, `page`, `page_size`, `ordering`, `search`); infinite scroll via `react-infinite-scroll-component`. |
| `/products/category/:category` | `Products` | none | Dead/unused route — every internal link uses `/products/?category=slug` query-string style instead (e.g. `Categories.js`, `ProductDetails.js`); nothing navigates to the `:category` param form. |
| `/products/detail/:slug` | `ProductDetails` | none | Add-to-cart/buy-now branches on `isAuthenticated` (server cart vs local cart clone); works for guests too. |
| `/cart` | `Cart` | none (not `ProtectedRoute`-wrapped) | Fetches server cart only `if (isAuthenticated)`. |
| `/checkout` | `Checkout` | none | Works for guest checkout; redirects to `/products` if cart is empty. |
| `/wishlist` | `WishList` | not enforced | Only fetches if authenticated; guest sees a permanently empty list (the redirect-to-signin path is commented out). |
| `/products/flash-sale`, `/products/new-arrival`, `/products/best-selling`, `/products/featured` | the matching homepage section component, rendered with `forRoute={true}` | none | Home-page section components reused directly as full pages. |
| `/categories` | `Categories` (`forRoute={true}`) | none | Fetches flash-sale/new-arrival/best-selling/featured categories + slider/banner content. |
| `/order-confirmation/:orderId` | `OrderConfirmation` | none | Shows the order id from the URL; the total/date come from `location.state.order` (what `POST /orders/` answered, handed over by `Checkout`); a signed-in customer's order is also read back (`fetchOrder`, so it survives a refresh) and shows items + address. Guests get a link to `/order-tracking?order_id=…`. |
| `/signin` | `SignIn` | none | Phone-only login, no password field. |
| `/signup` | `SignUp` | none | Collects name/phone/optional email, no password. |
| `/profile` | `Profile` | **yes**, via `ProtectedRoute` | Tabs for overview/address/wishlist (embeds `WishList`). |
| `/orders` | `Orders` | **yes**, via `ProtectedRoute` | My orders, newest first, 10 per page ("Newer"/"Older"); `fetchOrders` → `GET /orders/`. |
| `/orders/:orderId` | `OrderDetail` | **yes**, via `ProtectedRoute` | One order: progress (`OrderTimeline`), items, totals, address, payment, and a Cancel button while `can_cancel` (`cancelOrder` → `POST /orders/{id}/cancel/`, after `window.confirm`). |
| `/verify-otp/:token` | `VerifyOtp` | none (must be reachable pre-auth) | Submits local cart+wishlist snapshot alongside the OTP so guest cart/wishlist merges into the account on verify. |
| `/order-tracking` | `OrderTracking` (`pages/others`) | none | A guest (or anyone) follows an order with its number + phone (`+880` and 10 digits; `01712345678` is accepted and normalised): `trackOrder` → `GET /orders/track/`. Shows progress + items, never a name/address. Prefilled from `?order_id=`. |
| `/contact`, `/aboutus`, `/faq`, `privacy-policy` | static pages | none | `privacy-policy` is missing its leading slash (inconsistent with every other route). |
| `*` | `NotFound` | none | Generic 404. |

`ProtectedRoute` (`src/components/common/ProtectedRoute.js`) reads `state.auth.isAuthenticated`; if false, `<Navigate to="/signin" replace state={{from: location}} />`, else renders `<Outlet/>`. **Only `/profile`, `/orders` and `/orders/:orderId` use it** — `/wishlist`, `/cart`, `/checkout` are reachable while logged out and each page internally special-cases `isAuthenticated` instead.

## Signup / Signin / OTP flow

1. `/signup` or `/signin` — both phone-number only, no password anywhere in either UI.
2. Both dispatch `signUpUser`/`signInUser` (`authSlice`). On fulfilled, the backend returns a `token` + `message`; the slice stores `token` and `signupMessage`/`signinMessage`.
3. A `useEffect` on each page watches for that message and navigates to `/verify-otp/:token`.
4. `VerifyOtp` reads `token` from the URL param, collects the current local `cartItems` (`state.cart`) and wishlist `items` (`state.wishList`) into `formData.cart`/`formData.favorite`, and submits `{token, otp, cart, favorite}` via the `verifyOtp` thunk — verification also merges the guest's local cart/wishlist into the newly authenticated account server-side. Has a "Resend OTP" link (`resendOtp` thunk).
5. On `verifyOtp.fulfilled`, `state.auth.isAuthenticated = true`; a `useEffect` then navigates to `location.state?.from` (defaults to `/`) and clears verify state.
6. **Bug**: `SignIn`'s captured `from` location (`location.state?.from?.pathname`) is never passed into the `/verify-otp/:token` navigate call (`navigate(`/verify-otp/${token}`)` — no `state` argument), so `VerifyOtp`'s fallback to `/` fires in practice every time. "Return to intended page after login" is broken/incomplete.

## Checkout / order flow

1. Items get added to cart from `ProductDetails`/`Products`/`Cart` (guest: local `cartSlice`; authenticated: also synced to the server via `handleAddtoCart`/`handleFetchCart`).
2. `/cart` shows items, quantity controls (debounced 1s server sync when authenticated), remove/clear with confirm dialogs, subtotal, and a "Proceed to Checkout" link to `/checkout`.
3. `/checkout`: on mount dispatches `initializeCheckout()` if not already fulfilled; redirects to `/products` if the cart is empty (this guard can also fire briefly on first load before cart data arrives). Form covers name/phone/optional email, shipping type (`inside_dhaka` vs `outside_dhaka` with division/district/upazila cascade from static `src/data/location` datasets), address, and payment method — **only Cash on Delivery is wired up**; a credit-card icon is present but no card flow exists. Logged-in users additionally see `ShowAddress` (saved address picker).
4. On submit, client-side `validateForm()` checks required fields and that a delivery charge was resolved, builds `checkoutBody` (name/email/shipping fields/payment_type/items array/sub_total/delivery_charge/total), and dispatches `handleCheckout`.
5. On success (`isCheckoutFulfilled` + `order_id`), navigates to `/order-confirmation/:orderId` with `state: { order }` (the `POST /orders/` answer kept in `checkoutSlice.order`: `order_id, status, created_at, subtotal, delivery_charge, total`), then (500ms later) dispatches `clearCart()` and `resetForm()` (which also clears `order`, so the page must keep what it needs: it reads `location.state`).
6. `/order-confirmation/:orderId` shows the id, date and total from that state; for a signed-in customer it also dispatches `fetchOrder(orderId)` and shows the items and shipping address (works after a refresh). A guest, who has no account to read the order from, gets the id (also after a refresh, from the URL) and a "Track Order" link to `/order-tracking?order_id=…`.
7. Afterwards a signed-in customer finds the order under **My Orders** (NavBar profile menu, Footer → `/orders`); while it is `pending` they can cancel it (the goods go back into stock). A guest uses **Order Tracking** (Footer → `/order-tracking`) with the order id and the phone number they ordered with. What the customer sees of the status history is the status and its time only (no staff notes).

## Flagged issues

- **`/products/category/:category` route is dead** — nothing navigates to it; all internal links use the `/products/?category=slug` query-string form.
- **`privacy-policy` route has no leading slash**, inconsistent with every other route. The Footer links to it via a raw `<a href="/privacy-policy">` rather than `<Link>`, causing a full page reload unlike other footer links.
- **`user/WishList.js`** also has ~130 lines of an old commented-out implementation left above the live one.
- **`user/Profile.js`** imports `set` from `lodash` but never uses it — dead import.
- **Guest-vs-auth inconsistency**: `/wishlist`, `/cart`, `/checkout` aren't wrapped in `ProtectedRoute`, yet their internal logic silently no-ops for guests (e.g. wishlist never redirects to sign-in — that redirect is commented out — so guests just see a permanently empty wishlist).
- **Post-login redirect is broken** (see step 6 of the auth flow above).
- **No password field anywhere** in SignIn/SignUp — this is OTP/phone-based auth by design, confirm with the user before treating it as an oversight.
- Only Cash-on-Delivery is implemented in Checkout despite credit-card iconography suggesting more was planned.
- Several commented-out sections throughout (Footer newsletter block, Testimonials on Home, social icons) indicate features that were built but disabled, not necessarily bugs.
