import React from "react";

const SidebarSkeleton = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4 max-h-svh overflow-y-auto lg:sticky top-[100px] animate-pulse">
      {/* Mobile Close Button Skeleton */}
      <div className="flex justify-between items-center lg:hidden mb-4">
        <div className="h-6 w-24 bg-gray-300 rounded"></div>
        <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* Filters with Accordions Skeleton */}
      <div className="space-y-4">
        {/* Categories Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-32 w-full bg-gray-300 rounded"></div>

        {/* Brands Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-24 w-full bg-gray-300 rounded"></div>

        {/* Tags Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-24 w-full bg-gray-300 rounded"></div>

        {/* Price Range Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-16 w-full bg-gray-300 rounded"></div>

        {/* Color Filter Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="flex space-x-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-6 h-6 bg-gray-300 rounded-full"></div>
          ))}
        </div>

        {/* Size Filter Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-16 w-full bg-gray-300 rounded"></div>

        {/* Discount Skeleton */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
        <div className="h-24 w-full bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
