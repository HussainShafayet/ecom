import { useEffect, useState } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import {ContentLink, Slider} from '../common';
import {fetchHomeContent} from '../../redux/slice/contentSlice';
import {useDispatch, useSelector} from 'react-redux';
import {HeroSectionSkeleton} from '../common/skeleton';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';
import useMediaQuery from '../../hooks/useMediaQuery';

const HERO_HEIGHT = 'lg:h-[380px]';

// A promo tile beside the slider: a picture (or, on a computer, a video) that leads where the admin chose.
const Banner = ({ item }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <ContentLink item={item} className={`relative block overflow-hidden rounded-lg bg-gray-100 aspect-[16/9] lg:aspect-auto lg:h-full`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      {item.media_type === 'video' ? (
        <video src={item.media} autoPlay muted loop playsInline preload="metadata" onLoadedData={() => setLoaded(true)} className="h-full w-full object-cover" />
      ) : (
        <img
          src={item.media}
          alt={item.caption || 'Promotion'}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </ContentLink>
  );
};

const HeroSection = () => {

  const {isLoading, image_sliders, video_sliders, left_banner, right_banner, error} = useSelector((state)=> state.content);
  const dispatch = useDispatch();
  const sectionError = useSelector((state) => state.globalError.sectionErrors["home-content"]);
  // Video is for a computer: a phone would download it over mobile data into a box too small to watch it in
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = (video_sliders || []).filter((video) => video?.media);
  const currentVideo = videos[currentVideoIndex];

  useEffect(() => {
    dispatch(fetchHomeContent());

   }, [dispatch]);

   // "Try again" on the error card: forget the error and ask for this part again
   const retry = () => {
     ['home-content'].forEach((section) => dispatch(clearSectionError(section)));
     dispatch(fetchHomeContent());
   };

   if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }

  const handleNext = () => setCurrentVideoIndex((index) => (index < videos.length - 1 ? index + 1 : 0));
  const handlePrevious = () => setCurrentVideoIndex((index) => (index > 0 ? index - 1 : videos.length - 1));

  const showVideo = isDesktop && Boolean(currentVideo);
  const banners = [left_banner, right_banner].filter((banner) => banner?.media && (isDesktop || banner.media_type !== 'video'));
  const hasSlides = (image_sliders || []).length > 0;
  const hasSide = showVideo || banners.length > 0;

  return (
    <>
    {isLoading ? <HeroSectionSkeleton /> :
      error ? (
      <SectionError message={error} onRetry={retry} />
    ) :
    !hasSlides && !hasSide ? null :

    <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
      {/* image slider: 16:9 on a phone, a fixed height beside the tiles on a computer */}
      {hasSlides && (
        <div className={`aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto ${HERO_HEIGHT} ${hasSide ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Slider image_sliders={image_sliders} />
        </div>
      )}

      {hasSide && (
        <div className={`flex flex-col gap-3 lg:gap-4 ${HERO_HEIGHT} ${hasSlides ? '' : 'lg:col-span-3'}`}>
          {showVideo && (
            <div className="group relative min-h-0 flex-[3] overflow-hidden rounded-lg bg-black">
              <video
                key={currentVideo.media}
                src={currentVideo.media}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              {currentVideo.caption && (
                <ContentLink item={currentVideo} className="absolute left-2 top-2 z-10 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white">
                  {currentVideo.caption}
                </ContentLink>
              )}
              {videos.length > 1 && (
                <>
                  <button type="button" onClick={handlePrevious} aria-label="Previous video" className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 opacity-0 shadow transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100">
                    <FaChevronLeft aria-hidden="true" />
                  </button>
                  <button type="button" onClick={handleNext} aria-label="Next video" className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 opacity-0 shadow transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100">
                    <FaChevronRight aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          )}

          {banners.length > 0 && (
            <div className={`grid min-h-0 gap-3 lg:gap-4 ${banners.length > 1 ? (showVideo ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-1') : 'grid-cols-1'} ${showVideo ? 'lg:flex-[2]' : 'lg:flex-1'}`}>
              {banners.map((banner) => (
                <Banner key={banner.id ?? banner.placement ?? banner.media} item={banner} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    }

    </>

  );
};

export default HeroSection;
