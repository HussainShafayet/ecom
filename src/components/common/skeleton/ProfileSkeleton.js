import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 animate-pulse">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="h-10 w-40 bg-gray-300 rounded mb-2"></div>
          <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
        </div>

        {/*Tabs Skeleton*/}
        {/*<div className="flex flex-wrap justify-around md:justify-start bg-white border-b text-gray-700 overflow-x-auto">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-12 w-32 bg-gray-300 rounded"></div>
          ))}
        </div>*/}

        {/* Content Section */}
        <div className="p-6">
          {/* Profile Overview Skeleton */}
          <div className="rounded-lg bg-gray-100 p-6 shadow-md flex flex-col md:flex-row gap-6">
            {/* Profile Image Skeleton */}
            <div className="flex-shrink-0 w-32 h-32 bg-gray-300 rounded-full"></div>

            {/* Personal Info Skeleton */}
            <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="h-6 w-1/2 bg-gray-300 rounded mb-4"></div>
              
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-5 w-3/4 bg-gray-300 rounded mb-3"></div>
              ))}

              <div className="h-10 w-full bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Address Skeleton */}
          {/*<div className="mt-6">
            <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>*/}

          {/* Wishlist Skeleton */}
          {/*<div className="mt-6">
            <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-40 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
