# Routing & Page/User-Flow — `src/App.js`, `src/pages/`

## App shell

`BrowserRouter` → `ScrollToTop` → `Layout` (wraps every route) → `Routes`. On mount, `App.js` dispatches `restoreSession()` (`authActions`) to rehydrate auth from cookies (a persisted signed-in flag with no refresh cookie behind it becomes a guest, quietly). `Layout` (`src/components/layout/Layout.js`) renders `NavBar` + `<main>{children}</main>` + `BottomNav` + `Footer` + `BackToTop` around **all** routes uniformly — there is no separate "auth layout" without nav/footer chrome.

## Route table

| Path | Element | Auth | Notes |
|---|---|---|---|
| `/` | `Home` | none | Composes `HeroSection`, `FlashSale`, `NewArrival`, `CategoriesSection`, `BestSelling`, `FeaturedProducts`, `AllProducts`; `Testimonials` is commented out. |
| `/products` | `Products` | none | Reads/writes query params (`category`, `brands`, `tags`, `min_price`, `max_price`, `sizes`, `colors`, `page`, `page_size`, `ordering`, `search`); infinite scroll via `react-infinite-scroll-component`. |
| `/products/detail/:slug` | `ProductDetails` | none | Add-to-cart/buy-now branches on `isAuthenticated` (server cart vs local cart clone); works for guests too. |
| `/cart` | `Cart` | none (not `ProtectedRoute`-wrapped) | Fetches server cart only `if (isAuthenticated)`. |
| `/checkout` | `Checkout` | none | Works for guest checkout; redirects to `/products` if cart is empty. |
| `/wishlist` | `WishList` | not enforced, by design | Guests see their locally persisted wishlist (`state.wishList.items`, redux-persist); only fetches the server copy `if (isAuthenticated)`. |
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
| `/contact` | `Contact` (`pages/others`) | none | The shop's own details (address, phone, e-mail, opening hours, social links, an OpenStreetMap/Google map iframe) come from `state.site`; a detail the admin left empty is not drawn. The form (name, e-mail, optional phone and subject, message) → `sendContactMessage` → `POST /site/contact/`: the backend's sentences are shown when it refuses, a connection failure says so, the form empties on success, and it cannot be sent twice while a send is on its way. |
| `/faq` | `FAQPage` (`pages/others`) | none | The admin's questions (`GET /site/faq/`) grouped by category in the admin's order, one answer open at a time, searched by question and answer; empty and failed states are said. |
| `/pages/:slug` | `StaticPage` (`pages/others`) | none | A page the admin wrote (About us, Privacy policy, Terms, ...): `GET /site/pages/{slug}/`, title + the backend's already-cleaned HTML (rendered with `RichTextToHTML`, styled by arbitrary-variant classes on the wrapper). A 404 says the page does not exist; any other failure says it could not be loaded. Reloads when the slug changes. |
| `/aboutus`, `/privacy-policy` | `<Navigate replace>` | none | The old addresses redirect to `/pages/about-us` and `/pages/privacy-policy` (the two pages the storefront used to hardcode). |
| `*` | `NotFound` | none | Generic 404. |

`ProtectedRoute` (`src/components/common/ProtectedRoute.js`) reads `state.auth.isAuthenticated`; if false, `<Navigate to="/signin" replace state={{from: location}} />`, else renders `<Outlet/>`. **Only `/profile`, `/orders` and `/orders/:orderId` use it** — `/wishlist`, `/cart`, `/checkout` are reachable while logged out and each page internally special-cases `isAuthenticated` instead.

## Signup / Signin / OTP flow

1. `/signup` or `/signin` — both phone-number only, no password anywhere in either UI.
2. Both dispatch `signUpUser`/`signInUser` (`authSlice`). On fulfilled, the backend returns a `token` + `message`; the slice stores `token` and `signupMessage`/`signinMessage`.
3. A `useEffect` on each page watches for that message and navigates to `/verify-otp/:token`.
4. `VerifyOtp` reads `token` from the URL param, collects the current local `cartItems` (`state.cart`) and wishlist `items` (`state.wishList`) into `formData.cart`/`formData.favorite`, and submits `{token, otp, cart, favorite}` via the `verifyOtp` thunk — verification also merges the guest's local cart/wishlist into the newly authenticated account server-side. Has a "Resend OTP" link (`resendOtp` thunk).
5. On `verifyOtp.fulfilled`, `state.auth.isAuthenticated = true`; a `useEffect` then navigates to `location.state?.from` (defaults to `/`) and clears verify state.
6. `SignIn` captures `from` (`location.state?.from?.pathname`, set by `ProtectedRoute`'s redirect) and passes it through the `/verify-otp/:token` navigate call as `state: { from }`, so `VerifyOtp`'s `location.state?.from` picks it up and step 5's navigate sends the customer back to the page they were on before signing in, not always `/`.

## Checkout / order flow

1. Items get added to cart from `ProductDetails`/`Products`/`Cart` (guest: local `cartSlice`; authenticated: also synced to the server via `handleAddtoCart`/`handleFetchCart`).
2. `/cart` shows items, quantity controls (debounced 1s server sync when authenticated), remove/clear with confirm dialogs, subtotal, and a "Proceed to Checkout" link to `/checkout`. A product's **minimum order** (`minimum_order_quantity` on the card, 1 unless the shop set more) is respected: the `-` button stops at it, a line below it (an older cart) is marked in red, and while any line is below its minimum the checkout link is greyed out with the sentences (`The minimum order for X is N.`). A quantity the shop refuses (stock) is shown as the backend's sentence above the cart and the quantity the server really holds is fetched back. Adding from a product card puts the product's minimum in the cart (not 1); if the shop refuses, the card shows the reason.
3. `/checkout`: on mount dispatches `initializeCheckout()` if not already fulfilled; redirects to `/products` if the cart is empty (this guard can also fire briefly on first load before cart data arrives). Form covers name/phone/optional email, shipping type (`inside_dhaka` vs `outside_dhaka` with division/district/upazila cascade from static `src/data/location` datasets), address, payment method — **only Cash on Delivery is wired up**; a credit-card icon is present but no card flow exists — and a **promo code** box in the order summary (`handleApplyCoupon` → `POST /coupons/validate/`; shows the discount and an uppercased code once applied, or the backend's one-sentence refusal; "Remove" or any cart-quantity change clears it, since the preview is only against the subtotal at the moment it was applied). Logged-in users additionally see `ShowAddress` (saved address picker).
4. On submit, client-side `validateForm()` checks required fields and that a delivery charge was resolved, builds `checkoutBody` (name/email/shipping fields/payment_type/`coupon_code` (`""` if none applied)/items array/sub_total/delivery_charge/total, the last already net of any discount), and dispatches `handleCheckout`. When the backend refuses the order (`400`: a minimum order, not enough stock, a product that is gone, delivery not available, a coupon that is no longer valid: every problem at once, nothing ordered) `checkoutSlice.responseError` holds its sentences and the `CheckoutErrors` box shows them right above the *Place Order* button (scrolled into view, with a link back to the cart); a new attempt, and arriving at the page, clear them.
5. On success (`isCheckoutFulfilled` + `order_id`), navigates to `/order-confirmation/:orderId` with `state: { order }` (the `POST /orders/` answer kept in `checkoutSlice.order`: `order_id, status, created_at, subtotal, delivery_charge, discount_amount, coupon_code, total`), then (500ms later) dispatches `clearCart()` and `resetForm()` (which also clears `order`, so the page must keep what it needs: it reads `location.state`).
6. `/order-confirmation/:orderId` shows the id, date and total from that state; for a signed-in customer it also dispatches `fetchOrder(orderId)` and shows the items and shipping address (works after a refresh). A guest, who has no account to read the order from, gets the id (also after a refresh, from the URL) and a "Track Order" link to `/order-tracking?order_id=…`.
7. Afterwards a signed-in customer finds the order under **My Orders** (NavBar profile menu, Footer → `/orders`); while it is `pending` they can cancel it (the goods go back into stock). A guest uses **Order Tracking** (Footer → `/order-tracking`) with the order id and the phone number they ordered with. What the customer sees of the status history is the status and its time only (no staff notes).

## Flagged issues

- **Guest-vs-auth inconsistency**: `/wishlist`, `/cart`, `/checkout` aren't wrapped in `ProtectedRoute`; each branches on `isAuthenticated` internally instead (by design — see the route table above for `/wishlist`'s guest behavior).
- **No password field anywhere** in SignIn/SignUp — this is OTP/phone-based auth by design, confirm with the user before treating it as an oversight.
- Only Cash-on-Delivery is implemented in Checkout despite credit-card iconography suggesting more was planned; the Facebook/Google buttons on SignIn are decorative (no `onClick`) — both are known gaps, not yet decided how to resolve.
- Several commented-out sections throughout (Footer newsletter block, Testimonials on Home, social icons) indicate features that were built but disabled, not necessarily bugs.
