
const HeroSectionSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh] animate-pulse">
      {/* Image Slider Placeholder */}
      <div className="lg:w-4/6 w-full flex bg-gray-300 rounded-md"></div>

      <div className="lg:w-2/6 gap-4 w-full  flex flex-col">
        {/* Video Slide Placeholder */}
        <div className="flex-grow h-3/5 bg-gray-300 rounded-md"></div>

        {/* Product Image Placeholders */}
        <div className="flex flex-grow space-x-4 h-2/5">
          <div className="flex-grow border p-4 bg-gray-300 rounded-md"></div>
          <div className="flex-grow p-4 border bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionSkeleton;
