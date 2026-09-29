import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, handleAddtoCart, handleClonedProduct } from '../../../redux/slice/cartSlice';
import { FaBolt, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import {addToWishlist, handleAddtoWishlist, handleRemovetoWishlist, removeFromWishlist} from '../../../redux/slice/wishlistSlice';
import {minimumOf} from '../../../utils/minimumOrder';
import {discountLabel, formatPrice} from '../../../utils/formatPrice';
import defaultImage from '../../../assets/images/default_product_image.jpg';

// These are declared here, not inside ProductCard: a component declared in a render is a new component every render,
// so React would remount its DOM (the image would flash) each time the card updated.

const DiscountBadge = ({ discountValue, discountType }) => (
  <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
    {discountLabel(discountValue, discountType)}
  </span>
);

const TrendingBadge = ({ isHot }) => (
  <span className="absolute left-2 top-8 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
    {isHot ? 'Hot Picks' : 'Trending'}
  </span>
);

// Over the image, not under the buttons: a line under the buttons makes this card taller than its neighbours, and the
// buttons of one row stop lining up.
const MinimumOrderBadge = ({ quantity }) => (
  <span className="absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] truncate rounded bg-gray-900/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
    Minimum order: {quantity}
  </span>
);

const WishlistButton = ({ isFavourite, onAdd, onRemove }) => (
  <button
    type="button"
    onClick={isFavourite ? onRemove : onAdd}
    aria-label={isFavourite ? 'Remove from wishlist' : 'Add to wishlist'}
    aria-pressed={isFavourite}
    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
  >
    {isFavourite ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
  </button>
);

const ProductImage = ({ src, alt, isImageLoaded, onLoad, inStock }) => (
  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
    {!isImageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
    <img
      src={src || defaultImage}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={(event) => {
        event.currentTarget.onerror = null; // the fallback must not loop if it fails too
        event.currentTarget.src = defaultImage;
      }}
      className={`h-full w-full object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'} ${inStock ? '' : 'grayscale'}`}
    />
  </div>
);

// Five stars, rounded to the nearest half, plus the exact average and the number of reviews.
const Rating = ({ rating, reviews }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div
      role="img"
      aria-label={`Rated ${Number(rating).toFixed(1)} out of 5 from ${reviews} reviews`}
      className="flex items-center gap-1 text-xs text-gray-600"
    >
      <span className="flex text-yellow-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) =>
          rounded >= n ? <FaStar key={n} className="h-3 w-3" />
            : rounded >= n - 0.5 ? <FaStarHalfAlt key={n} className="h-3 w-3" />
              : <FaRegStar key={n} className="h-3 w-3" />
        )}
      </span>
      <span aria-hidden="true">{Number(rating).toFixed(1)}</span>
      <span aria-hidden="true" className="text-gray-400">({reviews})</span>
    </div>
  );
};

const Price = ({ hasDiscount, discountPrice, basePrice }) => (
  hasDiscount ? (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-base font-bold text-gray-900 sm:text-lg">{formatPrice(discountPrice)}</span>
      <span className="text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>
    </div>
  ) : (
    <span className="text-base font-bold text-gray-900 sm:text-lg">{formatPrice(basePrice)}</span>
  )
);

// Every state of the action area (two buttons, Choose Options, Out of Stock) is ONE row of the same height (h-9), so in a
// row of cards the prices and the buttons line up whichever cards can be bought, need options or are sold out.
const BUTTON = 'flex h-9 items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const PRIMARY = `${BUTTON} min-w-0 flex-1 bg-blue-600 px-2 text-white hover:bg-blue-700`;
// Buy Now is always just its icon (label in the tooltip and for screen readers): how wide a card is depends on the grid
// it sits in (2 to 6 columns, with or without a sidebar), not on the screen, so a label would wrap "Add to Cart" in the
// narrow ones.
const SECONDARY = `${BUTTON} w-9 shrink-0 border border-blue-600 text-blue-600 hover:bg-blue-50`;

// A product with variants cannot be added from here (which size/colour?), so its one button opens the product page.
const ActionButtons = ({ hasVariants, busy, onAddToCart, onBuyNow }) => (
  <div className="flex gap-1.5">
    {hasVariants ? (
      <button type="button" onClick={onBuyNow} className={PRIMARY}>Choose Options</button>
    ) : (
      <>
        <button type="button" onClick={onAddToCart} disabled={busy} className={PRIMARY}>
          {busy ? 'Adding...' : 'Add to Cart'}
        </button>
        <button type="button" onClick={onBuyNow} disabled={busy} title="Buy Now" className={SECONDARY}>
          <FaBolt aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">Buy Now</span>
        </button>
      </>
    )}
  </div>
);

const OutOfStock = () => (
  <div className="flex h-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-red-500">Out of Stock</div>
);

const ProductCard = ({ product, cardForTrending }) => {
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const {favouriteIds} = useSelector ((state) => state.wishList);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded
  const [productFavourite, setProductFavourite] = useState(product?.is_favourite || false);
  const [cartMessage, setCartMessage] = useState(null); // why the shop did not take it (stock, ...)
  const [busy, setBusy] = useState(false); // this card is talking to the server; the other cards stay usable
  const startQuantity = minimumOf(product); // a product with a minimum order goes into the cart with that many


  const handleAddToCart = async () => {
    setBusy(true);
    try {
      let clonedProduct;
      if (isAuthenticated) {
        const cartBody = {
          product_id: product.id,
          quantity: startQuantity,
          variant_id: product.variant_id,
          action: 'increase'
        };
        const response = await dispatch(handleAddtoCart(cartBody)).unwrap();
        if (response.success) {
          clonedProduct = dispatch(handleClonedProduct(product, null, null, startQuantity));
        }
      }else{
        clonedProduct = dispatch(handleClonedProduct(product, null, null, startQuantity));
      }

      clonedProduct && dispatch(addToCart(clonedProduct));
      setCartMessage(null);
    } catch (error) {
      console.log('handle add to cart error: ', error)
      setCartMessage(error?.errors?.[0] || error?.error || 'Could not add this item. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async() => {
    if (product.has_variants) {
      navigate(`/products/detail/${product.slug}`);
      return;
    }
    setBusy(true);
    try {
      let clonedProduct;
      if (isAuthenticated) {
        const cartBody = {
          product_id: product.id,
          quantity: startQuantity,
          variant_id: product.variant_id,
          action: 'increase'
        };
        const response = await dispatch(handleAddtoCart(cartBody)).unwrap();
        if (response.success) {
          clonedProduct = dispatch(handleClonedProduct(product, null, null, startQuantity));
        }

      }else{
        clonedProduct = dispatch(handleClonedProduct(product, null, null, startQuantity));
      }

      if (clonedProduct) {
        dispatch(addToCart(clonedProduct));
        navigate(`/checkout`);
      }
    } catch (error) {
      console.log('handle buy now error: ', error);
      setCartMessage(error?.errors?.[0] || error?.error || 'Could not order this item. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddToWishlist = () =>{
    if (isAuthenticated) {
       dispatch(handleAddtoWishlist({product_id: product.id}));
    } else {
      dispatch(addToWishlist(product));
    }

  }
  const handleRemoveToWishlist = async () =>{
    try {
      if (isAuthenticated) {
          const response = await dispatch(handleRemovetoWishlist({ product_id: product.id })).unwrap();
          response.success && setProductFavourite(false);
      }
      dispatch(removeFromWishlist(product.id));
    } catch (error) {
        console.error("Error removing from wishlist:", error);
    }
  }

  const isFavourite = Boolean((favouriteIds && favouriteIds[product.id]) || productFavourite);

  return (
    <div className="group relative flex h-full w-full flex-col rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition duration-200 hover:shadow-md">
      {/* Wishlist Button - Separate from <Link> */}
      <WishlistButton
        isFavourite={isFavourite}
        onAdd={handleAddToWishlist}
        onRemove={handleRemoveToWishlist}
      />

      {/* Clickable Card Content */}
      <Link to={`/products/detail/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative">
          {product.has_discount && (
            <DiscountBadge
              discountValue={product.discount_value}
              discountType={product.discount_type}
            />
          )}
          {cardForTrending && <TrendingBadge isHot={product.isHot} />}
          <ProductImage
            src={product.image}
            alt={product.name}
            isImageLoaded={isImageLoaded}
            onLoad={() => setIsImageLoaded(true)}
            inStock={product.availability_status}
          />
          {product.availability_status && startQuantity > 1 && <MinimumOrderBadge quantity={startQuantity} />}
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-1">
          {product.brand_name && (
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">{product.brand_name}</p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-gray-900 group-hover:text-blue-600" title={product.name}>
            {product.name}
          </h3>
          {product.avg_rating > 0 && <Rating rating={product.avg_rating} reviews={product.total_reviews} />}
          <div className="mt-auto pt-1">
            <Price
              hasDiscount={product.has_discount}
              discountPrice={product.discount_price}
              basePrice={product.base_price}
            />
          </div>
        </div>
      </Link>

      {/* Stock & Action Buttons */}
      <div className="mt-2">
        {product.availability_status ? (
          <>
          <ActionButtons
            hasVariants={product.has_variants}
            busy={busy}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
          {cartMessage && <p role="alert" className="mt-1 text-xs text-red-500">{cartMessage}</p>}
          </>
        ) : (
          <OutOfStock />
        )}
      </div>
    </div>

  );
};

export default React.memo(ProductCard);
