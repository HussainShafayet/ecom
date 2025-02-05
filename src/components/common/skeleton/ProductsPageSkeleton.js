import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

const ProductsPageSkeleton = () => {
  return (
    <div className="w-full min-h-screen animate-pulse">
        {/* Main Content Skeleton */}
          {/* Sort & Filters Skeleton */}
          <div className="flex justify-between items-center mb-4">
            {/* Show Filters Button */}
            <div className="w-24 h-8 bg-gray-300 rounded lg:hidden"></div>

            {/* Title Placeholder */}
            <div className="hidden md:block h-6 w-48 bg-gray-300 rounded"></div>

            {/* Sorting & Show Items Options */}
            <div className="flex space-x-2">
              <div className="h-8 w-16 bg-gray-300 rounded"></div>
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>

          {/* Loading More Products Message */}
          <div className="text-center mt-4 h-6 w-48 bg-gray-300 rounded mx-auto"></div>
    </div>
  );
};

export default ProductsPageSkeleton;
