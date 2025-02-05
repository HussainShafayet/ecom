import React from "react";

const ProductDetailsSkeleton = () => {
  return (
    <div className="container mx-auto my-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Gallery Skeleton */}
        <div className="flex gap-2">
          <div className="flex flex-col space-y-1 h-full">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-20 h-20 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
          <div className="relative w-full h-full">
            <div className="w-full h-96 bg-gray-300 rounded-md shadow-md"></div>
          </div>
        </div>

        {/* Product Information Skeleton */}
        <div>
          <div className="h-8 w-3/4 bg-gray-300 rounded mb-3"></div>
          <div className="h-6 w-1/2 bg-gray-300 rounded mb-3"></div>

          {/* Price Skeleton */}
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-20 bg-gray-300 rounded"></div>
          </div>

          {/* Color Selector Skeleton */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>

          {/* Size Selector Skeleton */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="h-8 w-12 bg-gray-300 rounded"></div>
            <div className="h-8 w-12 bg-gray-300 rounded"></div>
            <div className="h-8 w-12 bg-gray-300 rounded"></div>
          </div>

          {/* Quantity Selector Skeleton */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-8 w-12 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
          </div>

          {/* Buttons Skeleton */}
          <div className="mt-4 flex space-x-4">
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Specifications Skeleton */}
      <section className="mt-4 bg-white shadow-md p-6 rounded-lg border border-gray-200">
        <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
        <ul className="text-sm space-y-3">
          {[...Array(6)].map((_, index) => (
            <li key={index} className="h-6 w-full bg-gray-300 rounded"></li>
          ))}
        </ul>
      </section>

      {/* Return & Warranty Skeleton */}
      <section className="mt-4 bg-white shadow-md p-6 rounded-lg border border-gray-200">
        <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
        <ul className="text-sm space-y-3">
          {[...Array(3)].map((_, index) => (
            <li key={index} className="h-6 w-full bg-gray-300 rounded"></li>
          ))}
        </ul>
      </section>

      {/* Related Products Skeleton */}
      <div className="my-12">
        <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-60 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
