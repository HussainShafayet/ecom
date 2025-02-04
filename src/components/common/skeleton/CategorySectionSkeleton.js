import React from "react";

const CategorySectionSkeleton = () => {
  return (
    <div className="container mx-auto my-8 animate-pulse">
      {/* Heading Skeleton */}
      <div className="h-8 bg-gray-200 w-48 rounded-md mb-4"></div>

      {/* Description and View All Link Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="h-4 bg-gray-200 w-64 rounded"></div>
        <div className="h-4 bg-gray-200 w-20 rounded hidden md:block"></div>
      </div>

      <div className="relative">
        {/* Left Arrow Skeleton */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-3 h-20 w-8 rounded-sm shadow-lg"></div>

        {/* Categories Container Skeleton */}
        <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hidden">
          {Array(9)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="relative group cursor-pointer min-w-[150px]">
                <div className="w-full h-36 bg-gray-200 rounded-lg"></div>
                <div className="absolute inset-0 bg-gray-300 opacity-50"></div>
              </div>
            ))}
        </div>

        {/* Right Arrow Skeleton */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-3 h-20 w-8 rounded-sm shadow-lg"></div>
      </div>
    </div>
  );
};

export default CategorySectionSkeleton;
