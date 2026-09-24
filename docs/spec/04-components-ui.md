# Components & UI/Styling Conventions — `src/components/`

## Styling conventions

`tailwind.config.js` is almost stock default Tailwind — `content` scans `src/**/*.{js,jsx,ts,tsx}`, and the only `theme.extend` is an unused `spinning-cube` keyframe/animation (zero usages anywhere in `src` — dead config). There are **no custom color tokens, spacing scale, fonts, or design-system primitives** defined; every component uses raw Tailwind utility classes with hardcoded palette values (`blue-500`, `green-500`, `red-500`, `gray-700`, etc.) chosen ad hoc per component rather than semantic tokens. `src/tailwind.css` is just the three `@tailwind` directives. `src/index.css` is generic boilerplate (font stack only). `src/App.css` holds two global custom-CSS additions used repeatedly: removing number-input spinners, and a `.scrollbar-custom` gradient scrollbar class (used in `Layout.js`, the category scroller, and the cart skeleton). `BackToTop` is the one component that breaks from Tailwind entirely, using CSS Modules (`BackToTop.module.css`) with hardcoded hex colors (`#4299e1`) instead of Tailwind's `blue-500`. `GlobalErrorHandler.js` mixes in full inline `style={{...}}` objects instead of Tailwind (the only fully inline-styled component), while `Slider.js` and `SelectFilter.js` use small inline `style` only for dynamic values (progress width, swatch hex color) alongside Tailwind classes — reasonable, not systemic. Layout containers repeat `"container mx-auto"` manually (13 occurrences) with no centralized `Container` component. Loading states consistently use `animate-pulse` gray-box skeletons (Tailwind's built-in utility), not a skeleton library.

## `common/` (top-level)

- **Accordion.js** — collapsible section; props: `title`, `children`, `icon`; defaults **open** (slightly unusual default).
- **BackToTop.js** — floating scroll-to-top button with a circular SVG progress ring; prop: `scrollContainerRef`; CSS Modules, not Tailwind.
- **BottomNav.js** — mobile-only (`md:hidden`) bottom tab bar (Home/Shop/Cart/Wishlist/Account); reads Redux cart/auth state directly, no props.
- **Button.js** — generic button; props: `label`, `onClick`, `type` (default `"button"`), `styleClass` (extra classes appended); hardcoded blue background, no `variant`/`color` prop.
- **ErrorDisplay.js** — red bordered box listing an `errors` array prop; returns `null` if empty.
- **GlobalErrorHandler.js** — wraps `children`; shows a full-page inline-styled error overlay with a retry button when Redux `globalError` is set.
- **InputField.js** — labeled text input; props: `label`, `value`, `onChange`, `type`, `className`, `...rest`. Note: `className` is applied to both the wrapper `div` and the `<input>` — likely unintended duplication.
- **Loader.js** — small inline spinner + `message` prop (default `"Loading"`).
- **ProtectedRoute.js** — route guard using `react-router`'s `Outlet`; redirects to `/signin` if `!isAuthenticated`.
- **RichTextToHTML.js** — renders a `content` prop via `dangerouslySetInnerHTML` (XSS risk if the content isn't sanitized upstream by the backend — worth a security review before trusting this with user-generated content).
- **ScrollToTop.js** — no-render effect component; scrolls `scrollContainerRef` to top on route change.
- **SearchDropdown.js** — debounced (lodash, 1000ms) product search-suggestions dropdown with keyboard nav; pulls from the Redux `product` slice.
- **Slider.js** — Swiper-based hero image carousel; prop `image_sliders`; custom nav arrows, fade effect, links out by slide `type` (product/category/external).
- **SuccessMessage.js** — green bordered box for a `message` prop; mirrors `ErrorDisplay`'s styling pattern.
- **common/index.js** — barrel file re-exporting all of the above plus the `product/` subfolder components.

## `common/product/`

- **Breadcrum.js** — auto-generated breadcrumb from `location.pathname`. Filename is misspelled `Breadcrum.js` but the component (and its default export, imported as `Breadcrum`) is named `Breadcrumb` — a file/component naming inconsistency.
- **`ProductCard .js`** — filename genuinely contains a trailing space before the extension (verified with `ls -la`), and `common/index.js` imports it as `'./product/ProductCard '` (the literal space is in the import path too). Component: full product tile (image, badges, price/discount, rating, add-to-cart/buy-now/wishlist), wrapped in `React.memo`; props `product`, `cardForTrending`.
- **RatingAndReview.js** — product-detail reviews list + review submission form (rating, comment, file/video upload); prop `product`. When the signed-in customer can not review, a file-local `ReviewEligibility` says why from `review_status`: `reviewed` ("use the edit icon"), `waiting_for_delivery` ("once your order has been delivered" + a *View my order* link to `/orders/{review_order_id}`), anything else the general rule. Minor bug: `dispatch(dispatch(updateReviewFormData(...)))` — a double-dispatch nesting around lines ~82–85, likely a copy-paste error.
- **SelectFilter.js** — generic checkbox filter list synced to URL search params; props `items`, `type` (special-cased rendering for `type === 'colors'`).
- **Sidebar.js** — shop filter sidebar (categories tree, brand/tag/color/size checkboxes via `SelectFilter`, price range, discount radio), wrapped in `Accordion`s; prop `onClose` (mobile close button).

## `common/skeleton/`

Consistent pattern: plain functional components using Tailwind's `animate-pulse` + gray placeholder `div`s (no external skeleton library). Barrel-exported via `skeleton/index.js`: `HeroSectionSkeleton`, `ProductCardSkeleton`, `SectionSkeleton` (used generically by Flash Sale/Best Selling/New Arrival/Featured/AllProducts, toggled via `forRoute`; note its internal component is misspelled `Sectionkeleton`, though the export/usage is unaffected), `ProductDetailsSkeleton`, `ProductsPageSkeleton` (composes `ProductCardSkeleton`), `SidebarSkeleton`, `ProfileSkeleton`, `CartSkeleton`, `CategorySectionSkeleton`, `CheckoutSkeleton`.

## `sections/` (homepage/shop sections, all Redux-driven)

- **HeroSection.js** — top banner: image `Slider` + rotating video + two promo banners; needs the `content` slice (`image_sliders`, `video_sliders`, `left_banner`, `right_banner`).
- **CategoriesSection.js** — horizontally scrollable category cards; needs the `category` slice.
- **FlashSale.js** — flash-sale banner + product grid; prop `forRoute` (toggles hero-style banner + "Recommended" duplicate block); needs `flash_sale` + `content` slices.
- **BestSelling.js** — same pattern for best-sellers; needs `best_selling` + `content` slices.
- **NewArrival.js** — same pattern for new arrivals; needs `new_arrival` + `content` slices.
- **FeaturedProducts.js** — same pattern for featured products; needs `product.featured` + `content` slices.
- **AllProducts.js** — simple "All Products" grid linking to `/products`; needs the `product` slice.
- **Testomonials.js** — static/hardcoded customer testimonials (demo data with `placeholder.com` photo URLs, not Redux-backed); internally named `Testimonials` (correct spelling) but the file is misspelled `Testomonials.js`, and it's imported-but-commented-out in `src/pages/Home.js` — effectively dead/unused.

`FlashSale`/`BestSelling`/`NewArrival`/`FeaturedProducts` share ~90% duplicated JSX structure (banner + grid + "Recomendent Products" block, including a shared typo "Recomendent") — a strong candidate for extraction into one shared component if any of the four needs a structural change.

## `layout/`

- **Layout.js** — page shell: `NavBar` + `main` + `BottomNav` + `Footer` + `BackToTop`; prop `scrollContainerRef`.
- **NavBar.js** — desktop nav (logo, `SearchDropdown`, cart/wishlist icons, auth/profile dropdowns; the profile menu has Profile, My Orders, Wishlist, Logout); internal component named `Navbar` (casing differs from the filename `NavBar.js`).
- **Footer.js** — site footer with company/customer-service/account links and social icons; several sections commented out (newsletter signup, app download links).
- **layout/index.js** — barrel exporting `Layout`, `Footer`, `NavBar`.

## `checkout/`

- **ShowAddress.js** — selectable grid of saved shipping addresses; updates the Redux `checkout` slice's form data and cascades division→district→upazila lookups from the static `data/location` datasets.
- **CheckoutErrors.js** — why the shop refused the order: the backend's sentences (`checkoutSlice.responseError`, an array) in an `ErrorDisplay`, "Nothing was ordered" and a link back to `/cart`; scrolls itself into view; renders nothing without errors. Placed right above the *Place Order* button in `Checkout.js`.
- **checkout/index.js** — barrel exporting `ShowAddress` and `CheckoutErrors`.

## `orders/`

Shared by `Orders`, `OrderDetail`, `OrderConfirmation` and `OrderTracking`.

- **OrderStatusBadge.js** — coloured pill for a status (`status` picks the colour, `label` is the backend's `status_display`; an unknown status is grey). The backend's statuses: `pending, confirmed, paid, shipped, delivered, returned, cancelled, refunded`.
- **OrderTimeline.js** — progress from the backend's `history` (`[{status, status_display, created_at}]`): placed → (confirmed, only if staff confirmed) → (paid, only if it happened) → shipped → delivered, unreached steps grey ("Not yet"); an order that ended without delivery (cancelled, a parcel that came back = returned, or refunded) ends in a red step and drops the steps that never happened.
- **OrderItems.js** — the order's lines (picture, name linking to the product when its slug is known, variant, quantity × unit price, line total).
- **format.js** — `formatMoney` (`৳1060.00`), `formatDate`, `formatDateTime`, `addressLines(order)`.
- **orders/index.js** — barrel exporting all of the above.

## `profile/`

- **AddressItem.js** — single address card with an inline edit form (title/address/shipping type/division/district/thana cascading selects) and a delete confirmation modal; props `address`, `onUpdate` (declared but appears unused in the body).
- **profile/index.js** — barrel exporting `AddressItem` only.

## Flagged issues

1. **Confirmed filename with a literal space**: `src/components/common/product/ProductCard .js` (also referenced with the space in `common/index.js`'s import path) — fragile, breaks on case/space-sensitive tooling.
2. **Dead/unused code**: `Testomonials.js`/`Testimonials` uses hardcoded demo data and is commented out in `Home.js`; the `spinning-cube` Tailwind animation is defined but never referenced.
3. **Filename/component naming mismatches**: `Breadcrum.js` → component `Breadcrumb`; `Testomonials.js` → component `Testimonials`; `SectionSkeleton.js` → internal fn `Sectionkeleton`; `NavBar.js` → internal fn `Navbar`.
4. **Heavy duplication**: FlashSale/BestSelling/NewArrival/FeaturedProducts are near-identical (~150 lines each) with copy-pasted banner/grid/"Recomendent Products" logic — not componentized/DRY.
5. **Styling inconsistency**: `BackToTop` uses CSS Modules with hardcoded hex colors; `GlobalErrorHandler` is fully inline-styled; no shared color/spacing tokens exist despite Tailwind being used everywhere else.
6. **Potential bugs**: `InputField` applies `className` to both wrapper and `<input>` (duplicate/conflicting classes); `RatingAndReview.handleCanEdited` double-wraps `dispatch(dispatch(...))`; `RichTextToHTML` uses raw `dangerouslySetInnerHTML` with no visible sanitization.
7. No Tailwind theme customization (colors/fonts/spacing) exists — all "design system" values are inlined per-component, so there's no single source of truth for brand colors. Worth defining `theme.extend.colors` if this project's visual design is meant to scale.
