
// Same shape as HeroSection (slider 16:9 on a phone, 380px beside two tiles on a computer) so nothing jumps when it loads
const HeroSectionSkeleton = () => {
  return (
    <div className="grid animate-pulse gap-3 lg:grid-cols-3 lg:gap-4">
      {/* Image Slider Placeholder */}
      <div className="aspect-[16/9] rounded-lg bg-gray-300 sm:aspect-[2/1] lg:col-span-2 lg:aspect-auto lg:h-[380px]"></div>

      {/* Promo tile placeholders (the video block is computer-only and not always there, so it has none) */}
      <div className="grid grid-cols-2 gap-3 lg:h-[380px] lg:grid-cols-1 lg:gap-4">
        <div className="aspect-[16/9] rounded-lg bg-gray-300 lg:aspect-auto"></div>
        <div className="aspect-[16/9] rounded-lg bg-gray-300 lg:aspect-auto"></div>
      </div>
    </div>
  );
};

export default HeroSectionSkeleton;
