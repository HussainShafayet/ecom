// Same shape as the cart page (lines in one column, the page's own scroll; the order summary beside them from `lg`) so nothing
// jumps when it loads. Keeps the room the fixed bars need at the bottom on a phone.
const CartSkeleton = () => {
    return (
      <div className="mx-auto animate-pulse pb-44 md:pb-28 lg:pb-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2">
            <div className="mb-3 h-6 w-48 rounded bg-gray-300"></div>

            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-lg border bg-white p-3">
                  {/* Product Image */}
                  <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-lg bg-gray-300 sm:h-24 sm:w-24"></div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-300"></div>
                    <div className="h-4 w-1/4 rounded bg-gray-300"></div>

                    {/* Quantity + line total */}
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-32 rounded-lg bg-gray-300"></div>
                      <div className="h-5 w-16 rounded bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 h-6 w-48 rounded bg-gray-300"></div>

            <div className="mb-2 flex justify-between">
              <div className="h-4 w-20 rounded bg-gray-300"></div>
              <div className="h-4 w-16 rounded bg-gray-300"></div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-300"></div>
              <div className="h-4 w-16 rounded bg-gray-300"></div>
            </div>

            <div className="mt-4 hidden h-10 w-full rounded bg-gray-300 lg:block"></div>
          </div>
        </div>
      </div>
    );
  };

  export default CartSkeleton;
