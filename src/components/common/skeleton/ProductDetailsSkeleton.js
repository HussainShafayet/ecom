import React from "react";

// Same shape as the product page (one column on a phone, gallery beside the details from `md`) so nothing jumps when it loads
const ProductDetailsSkeleton = () => {
  return (
    <div className="container mx-auto my-4 animate-pulse md:my-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
        {/* Gallery: the square picture and its thumbnails */}
        <div>
          <div className="aspect-square w-full rounded-lg bg-gray-300"></div>
          <div className="mt-2 flex gap-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-14 w-14 shrink-0 rounded-lg bg-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Details: title, rating, price, choices, quantity, buttons */}
        <div className="space-y-4">
          <div className="h-7 w-3/4 rounded bg-gray-300"></div>
          <div className="h-5 w-1/2 rounded bg-gray-300"></div>
          <div className="h-8 w-1/3 rounded bg-gray-300"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-10 w-10 rounded-full bg-gray-300"></div>
            ))}
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-10 w-12 rounded-lg bg-gray-300"></div>
            ))}
          </div>
          <div className="h-10 w-40 rounded-lg bg-gray-300"></div>
          <div className="flex gap-2">
            <div className="h-11 w-40 rounded-lg bg-gray-300"></div>
            <div className="h-11 w-28 rounded-lg bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-12 rounded-lg bg-gray-300"></div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
