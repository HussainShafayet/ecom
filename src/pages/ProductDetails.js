import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AddedToCartSheet, BrandProducts, CollapsibleSection, DeliveryCard, OffersCard, PriceTag, ProductBreadcrumb, ProductGallery, ProductOptions, ProductSection, PurchaseBar,
  QuantitySelector, RatingAndReview, SaveButton, SectionTabs, StockLeft,
  LazySection, RatingStars, RichTextToHTML, SectionError, ShareMenu, TrustPoints,
} from '../components/common/';
import {useDispatch, useSelector} from 'react-redux';
import {setMainImage, setQuantity, fetchProductById, fetchAllProducts, setSelectedColor, setSelectedSize} from '../redux/slice/productSlice';
import {addToCart, handleAddtoCart, handleClonedProduct} from '../redux/slice/cartSlice';
import {recordViewed} from '../redux/slice/recentlyViewedSlice';
import {ProductDetailsSkeleton, SectionSkeleton} from '../components/common/skeleton';
import {discountLabel, formatPrice} from '../utils/formatPrice';
import usePageTitle from '../hooks/usePageTitle';
import {GALLERY_COLUMN, PRODUCT_GRID, PRODUCT_PAGE} from '../components/common/product/layout';
import {RecentlyViewed} from '../components/sections';

const RELATED_COUNT = 12;

// A row of the Specifications / Return & Warranty lists: the name in bold, the value(s) after it, wrapping on a phone.
const Fact = ({ label, children }) => (
  <div className="flex flex-wrap gap-x-2">
    <dt className="font-semibold text-gray-800">{label}:</dt>
    <dd className="break-words text-gray-700">{children}</dd>
  </div>
);

const ProductLinks = ({ items, to }) => items.map((item, index) => (
  <React.Fragment key={item.slug || item.name}>
    {index > 0 && ', '}
    <Link to={to(item)} className="text-blue-600 underline">{item.name}</Link>
  </React.Fragment>
));

// Mobile first: one column, a swipe gallery, 40 px choices, the buy buttons in a bar fixed above the bottom navigation, and the
// long text folded into sections you open. From `md` up: gallery beside the details, the buttons inline, the sections open.
const ProductDetails = () => {
  const { slug } = useParams();
  const {isLoading, product, error, mainImage, items:products, quantity, minimum_quantity: minimumQuantity, relatedProductsLoading, selectedColor, selectedSize} = useSelector((state)=> state.product);
  const {isAuthenticated} = useSelector((state)=> state.auth);
  usePageTitle(product?.name);

  const [busy, setBusy] = useState(false); // this page is talking to the server
  const [addedLine, setAddedLine] = useState(null); // the cart line the last Add to Cart put in the cart: the sheet that says so is open while it is set
  const [message, setMessage] = useState(null); // why the shop said no
  const reviewsRef = useRef(null);
  const [openSections, setOpenSections] = useState({ description: true, specs: false, policy: false }); // the folded sections of a phone

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const asked = useRef(false); // the product has been asked for (before that an `error` in the store is an old one, from another page)
  useEffect(() => {
    asked.current = true;
    dispatch(fetchProductById(slug));
    setMessage(null);
    setAddedLine(null);
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?.category) {
      dispatch(fetchAllProducts({category: product?.category, page_size: RELATED_COUNT + 1})) // one more: the product itself is in its category
    }
  }, [dispatch, product]);

  useEffect(() => {
    if (product?.id) {
      const snapshot = dispatch(handleClonedProduct(product, null, null, 1));
      dispatch(recordViewed(snapshot));
    }
  }, [dispatch, product]); // a new answer for the same product refreshes its snapshot; recordViewed moves it to the front, never duplicates it

  const handleSelectColor = (color) => {
    dispatch(setSelectedColor(color));
    dispatch(setMainImage(color?.media_files[0]));
    dispatch(setSelectedSize(color?.sizes[0]));
    setMessage(null);
  };

  const handleSelectSize = (variant) => {
    dispatch(setSelectedSize(variant));
    setMessage(null);
  };

  // Puts what is on the page in the cart (the account's on the server, a guest's here); the cart line when the shop took it, else false
  const putInCart = async () => {
    setMessage(null);
    setBusy(true);
    try {
      let clonedProduct;
      if (isAuthenticated) {
        const cartBody = {
          product_id: product?.id,
          quantity,
          variant_id: selectedSize?.variant_id || selectedColor?.variant_id,
          action: 'increase'
        };
        const response = await dispatch(handleAddtoCart(cartBody)).unwrap();
        if (response.success) {
          clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
        }
      } else {
        clonedProduct = dispatch(handleClonedProduct(product, selectedSize, selectedColor, quantity));
      }

      if (!clonedProduct) return false;
      dispatch(addToCart(clonedProduct));
      return clonedProduct;
    } catch (failure) {
      setMessage(failure?.errors?.[0] || failure?.error || 'Could not add this item. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAddToCart = async () => {
    const line = await putInCart();
    if (line) setAddedLine(line);
  };

  const handleBuyNow = async () => {
    if (await putInCart()) navigate('/checkout');
  };

  // The skeleton and the error are for a page that has NO product to show yet: the very first render (nothing asked yet), the wait for the answer, and a
  // move to another product while the store still holds the previous one (it was drawn for a frame under the new address). `isLoading` and `error` are
  // shared with the products LIST, which this page also asks for (the related products): the list's pending turned `isLoading` on and brought the
  // skeleton back over a page that was already there (the page blinked twice), and a failed list replaced the whole product with its error.
  const showsAnother = product && product.slug && slug && String(product.slug).toLowerCase() !== String(slug).toLowerCase();
  const noProductYet = !product || showsAnother;
  if (noProductYet && isLoading) return <ProductDetailsSkeleton />;
  if (noProductYet && error && asked.current) return <SectionError message={error} onRetry={() => dispatch(fetchProductById(slug))} />;
  if (noProductYet) return <ProductDetailsSkeleton />;

  const hasOptions = product.colors?.length > 0 || product.sizes?.length > 0;
  // A product with colours/sizes is bought as the chosen variant; a plain one as itself
  // What is bought: the chosen size, or the colour itself when it is sold without sizes (then it carries its own variant_id, price,
  // availability and stock_left, and there is no size to choose)
  const chosen = selectedSize || (selectedColor?.sizes?.length ? null : selectedColor);
  const canBuy = hasOptions ? Boolean(chosen?.availability_status) : Boolean(product.availability_status);
  const priced = chosen || product;
  const stockLeft = hasOptions ? chosen?.stock_left : product.stock_left; // "Only 3 left": of what is chosen, or of the product
  const price = formatPrice(product.has_discount ? priced.discount_price : priced.base_price);
  const oldPrice = product.has_discount ? formatPrice(priced.base_price) : null;
  const saving = product.has_discount ? Number(priced.base_price) - Number(priced.discount_price) : 0; // what the discount takes off one unit

  const related = (products || []).filter((item) => item?.id !== product.id).slice(0, RELATED_COUNT);
  const dimension = product.dimension && [product.dimension.width, product.dimension.height, product.dimension.depth].some(Boolean)
    ? `${product.dimension.width || '-'} x ${product.dimension.height || '-'} x ${product.dimension.depth || '-'} cm`
    : null;
  const hasSpecs = product.categories?.length > 0 || product.brand?.name || product.tags?.length > 0 || product.model || product.weight || dimension || product.material || product.features;
  const hasPolicies = product.warranty_information || product.shipping_information || product.return_policy;

  // The category in the breadcrumb: the product's main one
  const category = product.categories?.find((item) => item.slug === product.category) || product.categories?.[0] || null;
  const unitPrice = Number(product.has_discount ? priced.discount_price : priced.base_price) || 0;

  // The page's table of contents: only the parts this product has
  const hasReturnPolicy = Boolean(product.return_policy);
  const tabs = [
    product.long_description && { id: 'section-description', label: 'Description' },
    hasSpecs && { id: 'section-specs', label: 'Specifications' },
    (hasPolicies || product.qrcode_image_url) && { id: 'section-policy', label: 'Returns' },
    { id: 'section-reviews', label: `Reviews${product.total_reviews > 0 ? ` (${product.total_reviews})` : ''}` },
    related.length > 0 && { id: 'section-related', label: 'Related' },
  ].filter(Boolean);
  const openFolded = (id) => {
    const key = { 'section-description': 'description', 'section-specs': 'specs', 'section-policy': 'policy' }[id];
    key && setOpenSections((current) => ({ ...current, [key]: true }));
  };
  const toggleFolded = (key) => setOpenSections((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className={`${PRODUCT_PAGE} pb-40 motion-safe:animate-fade-in md:pb-0 short:pb-16`}>{/* phone: room for the fixed buy bar (64 px) and the bottom nav (56 px); sideways only the nav */}
      <ProductBreadcrumb category={category} name={product.name} />

      <div className={PRODUCT_GRID}>
        {/* From md the gallery stays in view while the details scroll, when the screen is tall enough to hold it (a taller gallery than the
            screen would hide its thumbnails behind the end of the column) */}
        <div className={GALLERY_COLUMN}>
          <ProductGallery
            media={(selectedColor ? selectedColor : product)?.media_files}
            selected={mainImage}
            onSelect={(media) => dispatch(setMainImage(media))}
            name={product.name}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            {product.brand?.name ? (
              <Link to={`/products?brands=${encodeURIComponent(product.brand.name)}`} className="rounded py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 hover:underline">
                {product.brand.name}
              </Link>
            ) : <span />}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${canBuy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {canBuy ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{product.name}</h1>

          {(product.avg_rating > 0 || product.total_orders > 0 || product.sku) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {product.avg_rating > 0 && (
                <button
                  type="button"
                  onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="rounded py-1 text-left"
                >
                  <RatingStars rating={product.avg_rating} reviews={product.total_reviews} iconClass="h-4 w-4" className="text-sm text-gray-700" />
                </button>
              )}
              {product.total_orders > 0 && <span className="text-sm text-gray-500">{product.total_orders} orders</span>}
              {product.sku && <span className="hidden text-sm text-gray-400 sm:inline">SKU: {product.sku}</span>}
            </div>
          )}

          <PriceTag price={price} oldPrice={oldPrice} discount={oldPrice ? discountLabel(product.discount_value, product.discount_type) : null} saving={saving > 0 ? formatPrice(saving) : null} />

          <RichTextToHTML content={product.short_description} />

          <ProductOptions
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={handleSelectColor}
            onSelectSize={handleSelectSize}
          />

          {canBuy && <StockLeft count={stockLeft} />}

          {canBuy && <QuantitySelector quantity={quantity} minimum={minimumQuantity} onChange={(value) => dispatch(setQuantity(value))} />}

          <PurchaseBar
            price={price}
            oldPrice={oldPrice}
            canBuy={canBuy}
            busy={busy}
            message={message}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          <div className="flex flex-wrap items-center gap-2">
            <SaveButton key={product.id} product={product} />
            <ShareMenu name={product.name} />
          </div>

          <DeliveryCard
            hasReturnPolicy={hasReturnPolicy}
            onShowReturns={() => {
              openFolded('section-policy');
              requestAnimationFrame(() => document.getElementById('section-policy')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            }}
          />

          <OffersCard subtotal={unitPrice * quantity} />

          <TrustPoints />
        </div>
      </div>

      <SectionTabs tabs={tabs} onSelect={openFolded} />

      <div className="mt-6 space-y-3">
        {product.long_description && (
          <CollapsibleSection sectionId="section-description" title="Description" open={openSections.description} onToggle={() => toggleFolded('description')}>
            <RichTextToHTML content={product.long_description} />
          </CollapsibleSection>
        )}

        {hasSpecs && (
          <CollapsibleSection sectionId="section-specs" title="Specifications" open={openSections.specs} onToggle={() => toggleFolded('specs')}>
            <dl className="space-y-2 text-sm">
              {product.categories?.length > 0 && <Fact label="Category"><ProductLinks items={product.categories} to={(item) => `/products/?category=${item.slug}`} /></Fact>}
              {product.brand?.name && <Fact label="Brand"><ProductLinks items={[product.brand]} to={(item) => `/products/?brands=${item.name}`} /></Fact>}
              {product.tags?.length > 0 && <Fact label="Tags"><ProductLinks items={product.tags} to={(item) => `/products/?tags=${item.name}`} /></Fact>}
              {product.model && <Fact label="Model">{product.model}</Fact>}
              {product.weight && <Fact label="Weight">{product.weight}</Fact>}
              {dimension && <Fact label="Dimensions">{dimension}</Fact>}
              {product.material && <Fact label="Materials">{product.material}</Fact>}
              {product.features && <Fact label="Other features">{product.features}</Fact>}
            </dl>
          </CollapsibleSection>
        )}

        {(hasPolicies || product.qrcode_image_url) && (
          <CollapsibleSection sectionId="section-policy" title="Return & Warranty" open={openSections.policy} onToggle={() => toggleFolded('policy')}>
            <div className="flex gap-4">
              <dl className="flex-1 space-y-2 text-sm">
                {product.warranty_information && <Fact label="Warranty">{product.warranty_information}</Fact>}
                {product.shipping_information && <Fact label="Shipping">{product.shipping_information}</Fact>}
                {product.return_policy && <Fact label="Return policy">{product.return_policy}</Fact>}
              </dl>
              {product.qrcode_image_url && (
                <div className="hidden shrink-0 md:block">{/* a code to scan with a phone is for a computer's screen */}
                  <p className="mb-1 text-sm font-semibold text-gray-800">Scan with your phone</p>
                  <img src={product.qrcode_image_url} alt="QR code of this page" className="h-32 w-32" />
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>

      <section id="section-reviews" className="mt-6 scroll-mt-32 md:scroll-mt-40" ref={reviewsRef}>
        <RatingAndReview product={product} />
      </section>

      <div id="section-related" className="scroll-mt-32 md:scroll-mt-40">
        {relatedProductsLoading ? <SectionSkeleton /> : (
          <ProductSection className="my-10" title="Related Products" products={related} carousel />
        )}
      </div>

      {/* Somewhere to go next, so a shopper who is not sold on this one stays: the brand's other products (asked for only when they are about to
          be reached) and what they looked at before (kept on their device, this product left out) */}
      {product.brand?.name && (
        <LazySection placeholder={<div aria-hidden="true" className="h-10" />}>
          <BrandProducts brand={product.brand.name} excludeId={product.id} />
        </LazySection>
      )}
      <RecentlyViewed exclude={product.id} />

      {addedLine && <AddedToCartSheet line={addedLine} suggestions={related} onClose={() => setAddedLine(null)} />}
    </div>
  );
};

export default ProductDetails;
