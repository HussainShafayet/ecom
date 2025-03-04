const CheckoutSkeleton = () => {
    return (
      <div className="mx-auto px-1 lg:flex lg:space-x-3 mb-3 animate-pulse">
        {/* Order Summary Skeleton */}
        <div className="lg:w-7/12 mt-12 lg:mt-0">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="bg-gray-100 rounded-lg shadow-md p-4">
            {/* Cart Items Skeleton */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-2 mb-2 border p-2 rounded-md bg-gray-200">
                <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                <div className="flex-grow min-w-0">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
            {/* Price Summary Skeleton */}
            <div className="h-4 bg-gray-300 rounded w-full my-3"></div>
            <div className="h-4 bg-gray-300 rounded w-full my-3"></div>
            <div className="h-6 bg-gray-400 rounded w-full my-3"></div>
          </div>
        </div>
  
        {/* Checkout Form Skeleton */}
        <div className="lg:w-5/12">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-2">
            {/* Personal Info Skeleton */}
            <div className="p-2 bg-gray-100 rounded-lg">
              <div className="h-6 w-40 bg-gray-300 rounded mb-3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-10 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
  
            {/* Shipping Info Skeleton */}
            <div className="p-2 bg-gray-100 rounded-lg">
              <div className="h-6 w-40 bg-gray-300 rounded mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-full mb-3"></div>
              <div className="grid grid-cols-1 gap-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-10 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
  
            {/* Payment Method Skeleton */}
            <div className="p-2 bg-gray-100 rounded-lg">
              <div className="h-6 w-40 bg-gray-300 rounded mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-full mb-3"></div>
            </div>
  
            {/* Submit Button Skeleton */}
            <div className="h-10 bg-blue-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default CheckoutSkeleton;
  