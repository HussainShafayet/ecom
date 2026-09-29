import React from "react";

// The account page while it loads, in the shape of the page (the band with the picture on its edge, the orders row, the tabs, the
// details) so nothing jumps when it arrives.
const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3 sm:space-y-4" aria-hidden="true">
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="h-28 bg-gray-300 sm:h-36"></div>
        <div className="flex flex-col items-center px-4 pb-5">
          <div className="-mt-12 h-24 w-24 rounded-full bg-gray-400 ring-4 ring-white sm:-mt-14 sm:h-28 sm:w-28"></div>
          <div className="mt-3 h-5 w-40 rounded bg-gray-300"></div>
          <div className="mt-2 h-4 w-28 rounded bg-gray-300"></div>
        </div>
      </div>

      <div className="h-[4.5rem] rounded-2xl border bg-white"></div>

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-12 rounded-xl bg-gray-300"></div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border bg-white p-4">
        <div className="h-5 w-44 rounded bg-gray-300"></div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-24 rounded bg-gray-300"></div>
            <div className="h-5 w-3/4 rounded bg-gray-300"></div>
          </div>
        ))}
        <div className="h-12 rounded-lg bg-gray-300"></div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
