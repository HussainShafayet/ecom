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

      {/* Banner Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="aspect-[4/3] bg-gray-200 rounded-xl"></div>
          ))}
      </div>
    </div>
  );
};

export default CategorySectionSkeleton;
