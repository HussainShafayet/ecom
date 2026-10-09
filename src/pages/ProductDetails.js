import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CollapsibleSection, ProductGallery, ProductOptions, ProductSection, PurchaseBar, QuantitySelector, RatingAndReview, StockLeft,
  RatingStars, RichTextToHTML, SectionError, ShareMenu, TrustPoints,
} from '../components/common/';
import {useDispatch, useSelector} from 'react-redux';
import {setMainImage, setQuantity, fetchProductById, fetchAllProducts, setSelectedColor, setSelectedSize} from '../redux/slice/productSlice';
import {addToCart, handleAddtoCart, handleClonedProduct} from '../redux/slice/cartSlice';
import {recordViewed} from '../redux/slice/recentlyViewedSlice';
import {ProductDetailsSkeleton, SectionSkeleton} from '../components/common/skeleton';
import {discountLabel, formatPrice} from '../utils/formatPrice';
import usePageTitle from '../hooks/usePageTitle';

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
  const [added, setAdded] = useState(false); // the last Add to Cart worked (for a moment)
  const [message, setMessage] = useState(null); // why the shop said no
  const reviewsRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProductById(slug));
    setMessage(null);
    setAdded(false);
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
  }, [dispatch, product?.id]);

  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), 4000);
    return () => clearTimeout(timer);
  }, [added]);

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

  // Puts what is on the page in the cart (the account's on the server, a guest's here); true when the shop took it
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
      return true;
    } catch (failure) {
      setMessage(failure?.errors?.[0] || failure?.error || 'Could not add this item. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAddToCart = async () => {
    if (await putInCart()) setAdded(true);
  };

  const handleBuyNow = async () => {
    if (await putInCart()) navigate('/checkout');
  };

  if (isLoading) return <ProductDetailsSkeleton />;
  if (error) return <SectionError message={error} onRetry={() => dispatch(fetchProductById(slug))} />;
  if (!product) return null;

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

  return (
    <div className="container mx-auto my-4 pb-40 md:my-6 md:pb-0">{/* phone: room for the fixed buy bar (64 px) and the bottom nav (56 px) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
        <ProductGallery
          media={(selectedColor ? selectedColor : product)?.media_files}
          selected={mainImage}
          onSelect={(media) => dispatch(setMainImage(media))}
          name={product.name}
        />

        <div className="space-y-4">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{product.name}</h1>

          {(product.avg_rating > 0 || product.total_orders > 0) && (
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
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-bold text-gray-900">{price}</span>
            {oldPrice && <span className="text-base text-gray-400 line-through">{oldPrice}</span>}
            {oldPrice && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {discountLabel(product.discount_value, product.discount_type)}
              </span>
            )}
          </div>

          {saving > 0 && <p className="-mt-2 text-sm font-medium text-green-700">You save {formatPrice(saving)}</p>}

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
            added={added}
            message={message}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          <TrustPoints />

          <ShareMenu name={product.name} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {product.long_description && (
          <CollapsibleSection title="Description" defaultOpen>
            <RichTextToHTML content={product.long_description} />
          </CollapsibleSection>
        )}

        {hasSpecs && (
          <CollapsibleSection title="Specifications">
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
          <CollapsibleSection title="Return & Warranty">
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

      <section className="mt-6" ref={reviewsRef}>
        <RatingAndReview product={product} />
      </section>

      {relatedProductsLoading ? <SectionSkeleton /> : (
        <ProductSection className="my-10" title="Related Products" products={related} carousel />
      )}
    </div>
  );
};

export default ProductDetails;
