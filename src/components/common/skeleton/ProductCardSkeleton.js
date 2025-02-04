import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="border rounded-lg shadow-md bg-white hover:shadow-lg transition duration-200 relative p-3 animate-pulse">
      {/* Product Image Skeleton */}
      <div className="block h-36 bg-gray-200 rounded-md"></div>

      <div className="p-2">
        {/* Product Title Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* Product Brand Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>

        {/* View Count and Order Count Skeleton */}
        <div className="flex items-center text-xs text-gray-600 mb-2 space-x-4">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* Product Price Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>

        {/* Product Rating Skeleton */}
        <div className="flex items-center mb-2">
          <div className="flex space-x-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
              ))}
          </div>
        </div>

        {/* Button Group Skeleton */}
        <div className="flex space-x-2 mt-2">
          <div className="h-8 bg-gray-200 rounded flex-grow"></div>
          <div className="h-8 bg-gray-200 rounded flex-grow"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
