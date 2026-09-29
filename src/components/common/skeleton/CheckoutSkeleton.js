// Same shape as the checkout page (the folded order summary, then the form's steps, on a phone; the form beside the summary from
// `lg`) so nothing jumps when it loads. Leaves the room the fixed Place Order bar needs.
const CheckoutSkeleton = () => {
    return (
      <div className="mx-auto animate-pulse pb-44 md:pb-28 lg:pb-0">
        <div className="mb-3 h-7 w-40 rounded bg-gray-300"></div>

        <div className="grid gap-4 lg:grid-cols-[7fr_5fr] lg:gap-6">
          {/* Order summary */}
          <div className="lg:col-start-2 lg:row-start-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 h-5 w-56 rounded bg-gray-300"></div>
              <div className="hidden space-y-3 lg:block">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-300"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The form's steps */}
          <div className="space-y-4 lg:col-start-1 lg:row-start-1">
            {[3, 4, 1].map((fields, section) => (
              <div key={section} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 h-5 w-32 rounded bg-gray-300"></div>
                <div className="space-y-3">
                  {[...Array(fields)].map((_, index) => (
                    <div key={index}>
                      <div className="mb-1 h-4 w-24 rounded bg-gray-300"></div>
                      <div className="h-12 w-full rounded-lg bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default CheckoutSkeleton;
