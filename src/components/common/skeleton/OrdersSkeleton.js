import React from 'react';

// The "My orders" list while it loads: three cards of the size an order card is, so nothing jumps when they arrive.
const OrdersSkeleton = () => (
  <div className="animate-pulse space-y-3" aria-hidden="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="rounded-lg border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-300"></div>
            <div className="h-3 w-24 rounded bg-gray-300"></div>
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-300"></div>
        </div>
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 3 }).map((__, thumb) => <div key={thumb} className="h-14 w-14 rounded bg-gray-300"></div>)}
        </div>
        <div className="mt-3 flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-300"></div>
          <div className="h-4 w-16 rounded bg-gray-300"></div>
        </div>
      </div>
    ))}
  </div>
);

export default OrdersSkeleton;
