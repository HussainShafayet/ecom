import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {ContentLink, Slider} from '../common';
import blurImage from '../../assets/images/blur.jpg';

// The top of a sale page (/products/flash-sale, /products/new-arrival, /products/best-selling, /products/featured): the page's slider with the
// right banner beside it (from `state.content`, which the page fetches for its own route). The banner is a picture, with a blurred
// placeholder until it has loaded, or a muted looping video with its caption as a link; with neither it is just the slider. One copy, drawn by
// all four pages (each had its own, identical but for a stray border and a few classes).
const RouteBanner = () => {
  const imageSliders = useSelector((state) => state.content.image_sliders);
  const rightBanner = useSelector((state) => state.content.right_banner);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
      <div className="lg:w-4/6 w-full flex">
        <Slider image_sliders={imageSliders} />
      </div>

      <div className="lg:w-2/6 gap-4 w-full flex flex-col">
        {rightBanner?.media_type === 'image' && (
          <ContentLink item={rightBanner} className="block h-full">
            <img
              src={rightBanner.media}
              alt={rightBanner.caption}
              loading="lazy"
              className={`w-full h-full object-contain rounded-md transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && (
              <img src={blurImage} alt="Loading" className="absolute inset-0 w-full h-36 rounded-md mb-2 animate-pulse object-cover" />
            )}
          </ContentLink>
        )}
        {rightBanner?.media_type === 'video' && (
          <div className="relative h-full">
            <ContentLink item={rightBanner} className="absolute right-2 top-2 z-10 cursor-pointer text-blue-500 hover:underline">
              {rightBanner.caption ? rightBanner.caption : 'Click'}
            </ContentLink>
            <video src={rightBanner.media} controls autoPlay muted loop preload="true" className="w-full h-full object-cover rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteBanner;
