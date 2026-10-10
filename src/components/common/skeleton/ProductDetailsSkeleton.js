import React from "react";
import { GALLERY_COLUMN, PICTURE_CAP, PRODUCT_GRID, PRODUCT_PAGE } from "../product/layout";

// The product page while it loads, in the page's own shape (`product/layout.js` is shared with the page and the gallery): the breadcrumb, the picture at the
// size the page will draw it, the details column block by block (brand and stock chip, name, rating, the price, choices, buttons, the delivery card),
// the tab bar and the sections. The blocks have the heights of what replaces them, so nothing jumps when the page arrives.
const Block = ({ className = "" }) => <div className={`rounded bg-gray-300 ${className}`} />;

const ProductDetailsSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading the product" className={`${PRODUCT_PAGE} animate-pulse`}>
    <Block className="mb-3 h-4 w-56 max-w-full sm:h-5" />{/* breadcrumb */}

    <div className={PRODUCT_GRID}>
      <div className={GALLERY_COLUMN}>
        <div className={PICTURE_CAP}>
          <div className="aspect-square w-full rounded-lg bg-gray-300" />{/* the picture */}
          <div className="mt-2 flex gap-2">
            {[...Array(4)].map((_, index) => <Block key={index} className="h-14 w-14 shrink-0 rounded-lg" />)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Block className="h-5 w-24" />{/* brand */}
          <Block className="h-6 w-20 rounded-full" />{/* In stock */}
        </div>
        <Block className="h-8 w-3/4 sm:h-9" />{/* name */}
        <Block className="h-7 w-2/3 max-w-xs" />{/* rating, orders */}
        <Block className="h-[60px] w-56 max-w-full rounded-lg" />{/* the price and what it saves */}
        <div className="space-y-2">
          <Block className="h-4 w-full" />
          <Block className="h-4 w-5/6" />
        </div>
        <div className="flex gap-3">{/* the choices (a product may have none, or a row of sizes more) */}
          {[...Array(4)].map((_, index) => <Block key={index} className="h-10 w-10 rounded-full" />)}
        </div>
        <Block className="h-10 w-40 rounded-lg" />{/* quantity */}
        <div className="hidden gap-2 md:flex short:flex">{/* the buy buttons: in the page from md, in a bar over the navigation on a phone */}
          <Block className="h-11 w-36 rounded-lg" />
          <Block className="h-11 w-28 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Block className="h-10 w-24 rounded-lg" />
          <Block className="h-10 w-24 rounded-lg" />
        </div>
        <Block className="h-[204px] w-full rounded-2xl" />{/* delivery & returns */}
      </div>
    </div>

    {/* the buy bar on a phone: price and the two buttons, over the bottom navigation, as the page has it */}
    <div className="fixed inset-x-0 bottom-14 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-3 py-2 md:hidden short:hidden">
      <Block className="h-10 w-20" />
      <Block className="h-11 flex-1 rounded-lg" />
      <Block className="h-11 w-24 rounded-lg" />
    </div>

    <Block className="mt-6 h-12 w-full rounded-none" />{/* the tab bar */}
    <div className="mt-6 space-y-3">
      {[...Array(3)].map((_, index) => <Block key={index} className="h-12 w-full rounded-lg" />)}
    </div>
  </div>
);

export default ProductDetailsSkeleton;
