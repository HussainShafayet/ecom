import React from "react";

// The filter groups while the shop's lists load: a heading and a few rows each, in the panel's shape
const SidebarSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 py-2" aria-hidden="true">
      {[3, 4, 2, 3].map((rows, group) => (
        <div key={group} className="space-y-2">
          <div className="h-6 w-32 rounded bg-gray-300"></div>
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="h-10 rounded bg-gray-200"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;
