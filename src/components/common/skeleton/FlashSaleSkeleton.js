import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

const FlashSaleSkeleton = ({forRoute}) => {
  return (
    <div className="container mx-auto animate-pulse">
    {forRoute &&
      <>
        {/* Hero Section Skeleton */}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[60vh]">
          {/* Image Slider Skeleton */}
          <div className="lg:w-3/5 h-full w-full bg-gray-200 rounded-md"></div>

          {/* Right Banner Skeleton */}
          <div className="lg:w-2/5 flex flex-col space-y-4 h-full w-full border p-4">
            <div className="h-full bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </>
      }
      {/* Flash Sale Section Skeleton */}
      <div className="my-5">
        <div className="h-8 bg-gray-200 w-48 rounded-md mb-4"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <div className="h-4 bg-gray-200 w-64 rounded"></div>
          <div className="h-4 bg-gray-200 w-20 rounded hidden md:block"></div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
        </div>
      </div>
      {forRoute && 
      <>
      {/* Recommended Products Skeleton */}
      <div className="my-5">
        <div className="h-8 bg-gray-200 w-64 rounded-md mb-4"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <div className="h-4 bg-gray-200 w-64 rounded"></div>
          <div className="h-4 bg-gray-200 w-20 rounded hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
        </div>
      </div>
      </>
      }
    </div>
  );
};

export default FlashSaleSkeleton;
