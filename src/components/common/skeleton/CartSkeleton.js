
const CartSkeleton = () => {
    return (
      <div className="mx-auto">
        {/* Cart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2 max-h-screen overflow-y-auto scrollbar-custom">
            <div className="text-2xl font-bold mb-4 animate-pulse bg-gray-300 h-6 w-48 rounded"></div>
  
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm p-3 bg-white flex flex-col md:flex-row items-center gap-3 animate-pulse"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-lg"></div>
  
                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
  
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="w-10 h-8 bg-gray-300 rounded"></div>
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
  
                  {/* Remove Button */}
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Order Summary Skeleton */}
          <div className="sticky top-24 bg-white shadow-lg rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
  
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div><div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
  
            <hr className="my-4" />
  
            <div className="flex justify-between font-bold text-lg">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
  
            <div className="mt-4 h-10 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
  
        {/* Related Products Skeleton */}
        {/*<div className="mx-auto my-12">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>*/}
      </div>
    );
  };
  
  export default CartSkeleton;
  