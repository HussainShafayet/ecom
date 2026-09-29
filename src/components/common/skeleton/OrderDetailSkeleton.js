import React from 'react';

// One order (detail page, and a tracking lookup) while it loads: the header, the progress, the items and the sums, in one column.
const OrderDetailSkeleton = () => (
  <div className="animate-pulse space-y-4" aria-hidden="true">
    <div className="rounded-lg border bg-white p-4">
      <div className="flex justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-gray-300"></div>
          <div className="h-3 w-28 rounded bg-gray-300"></div>
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-300"></div>
      </div>
    </div>
    <div className="space-y-4 rounded-lg border bg-white p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-300"></div>
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-300"></div>
            <div className="h-3 w-20 rounded bg-gray-300"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="space-y-3 rounded-lg border bg-white p-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 rounded bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-300"></div>
            <div className="h-3 w-1/3 rounded bg-gray-300"></div>
          </div>
          <div className="h-4 w-14 rounded bg-gray-300"></div>
        </div>
      ))}
      <div className="h-5 w-full rounded bg-gray-300"></div>
    </div>
  </div>
);

export default OrderDetailSkeleton;
