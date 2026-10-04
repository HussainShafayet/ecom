import { useEffect, useState } from 'react';
import { FaChevronRight, FaChevronLeft, FaPlay } from 'react-icons/fa6';
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

// The video box. A computer plays it at once (muted, looping, with controls). A phone does not even ask for the file until the customer
// taps Play: over mobile data it would be downloaded into a box they may never look at. The tap is a gesture, so it plays with sound,
// once; moving to another video goes back to its Play tile (nothing is downloaded that was not asked for).
const VideoPanel = ({ videos, tapToPlay }) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = videos[index] || videos[0];
  const go = (next) => { setIndex(next); setPlaying(false); };
  const handleNext = () => go(index < videos.length - 1 ? index + 1 : 0);
  const handlePrevious = () => go(index > 0 ? index - 1 : videos.length - 1);
  const arrow = 'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow transition-opacity hover:bg-white focus-visible:opacity-100 lg:h-9 lg:w-9 lg:opacity-0 lg:group-hover:opacity-100';

  return (
    <div className="group relative order-2 aspect-video min-h-0 flex-none overflow-hidden rounded-lg bg-black lg:order-1 lg:aspect-auto lg:flex-[3]">
      {tapToPlay && !playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video${current.caption ? `: ${current.caption}` : ''}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white"
        >
          {/* decoration only, the same look as the account page's band */}
          <span aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-white/10" />
          <span aria-hidden="true" className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-2xl text-indigo-700 shadow-lg"><FaPlay className="ml-1" /></span>
          <span aria-hidden="true" className="relative text-xs font-semibold">Tap to play</span>
        </button>
      ) : (
        <video
          key={current.media}
          src={current.media}
          controls
          autoPlay
          muted={!tapToPlay}
          loop={!tapToPlay}
          playsInline
          preload={tapToPlay ? 'auto' : 'metadata'}
          className="h-full w-full object-cover"
        />
      )}
      {current.caption && (
        <ContentLink item={current} className="absolute left-2 top-2 z-10 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white">
          {current.caption}
        </ContentLink>
      )}
      {videos.length > 1 && (
        <>
          <button type="button" onClick={handlePrevious} aria-label="Previous video" className={`${arrow} left-2`}>
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={handleNext} aria-label="Next video" className={`${arrow} right-2`}>
            <FaChevronRight aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};

const HeroSection = () => {

  const {isLoading, image_sliders, video_sliders, left_banner, right_banner, error} = useSelector((state)=> state.content);
  const dispatch = useDispatch();
  const sectionError = useSelector((state) => state.globalError.sectionErrors["home-content"]);
  // A computer plays the video at once; a phone only on a tap (see VideoPanel), and its promo tiles that are videos are left out
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const videos = (video_sliders || []).filter((video) => video?.media);

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

  const hasVideo = videos.length > 0;
  const banners = [left_banner, right_banner].filter((banner) => banner?.media && (isDesktop || banner.media_type !== 'video'));
  const hasSlides = (image_sliders || []).length > 0;
  const hasSide = hasVideo || banners.length > 0;

  return (
    <>
    {isLoading ? <HeroSectionSkeleton /> :
      error ? (
      <SectionError message={error} onRetry={retry} />
    ) :
    !hasSlides && !hasSide ? null :

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
      {/* One column that may not grow past the page: the default `auto` column is as wide as its content wants, and the
          slider's slides are as wide as their box, so below `lg` the box grew with every Swiper resize (past 33 million px). */}
      {/* image slider: 16:9 on a phone, a fixed height beside the tiles on a computer */}
      {hasSlides && (
        <div className={`aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto ${HERO_HEIGHT} ${hasSide ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Slider image_sliders={image_sliders} />
        </div>
      )}

      {hasSide && (
        <div className={`flex flex-col gap-3 lg:gap-4 ${HERO_HEIGHT} ${hasSlides ? '' : 'lg:col-span-3'}`}>
          {/* on a phone the promo tiles come first (they lead somewhere), the video after them */}
          {hasVideo && <VideoPanel videos={videos} tapToPlay={!isDesktop} />}

          {banners.length > 0 && (
            <div className={`order-1 grid min-h-0 gap-3 lg:order-2 lg:gap-4 ${banners.length > 1 ? (hasVideo ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-1') : 'grid-cols-1'} ${hasVideo ? 'lg:flex-[2]' : 'lg:flex-1'}`}>
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
