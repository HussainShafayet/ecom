import React, { useEffect, useState } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import {Loader, Slider} from '../common';
import {fetchHomeContent} from '../../redux/slice/contentSlice';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import blurImage from '../../assets/images/blur.jpg';
import {HeroSectionSkeleton} from '../common/skeleton';
import defaultImage from '../../assets/images/default_product_image.jpg';

const HeroSection = () => {
  
  const {isLoading, image_sliders, video_sliders, left_banner, right_banner, error} = useSelector((state)=> state.content);
  const dispatch = useDispatch();
  const sectionError = useSelector((state) => state.globalError.sectionErrors["home-content"]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = video_sliders?.[currentVideoIndex];
   const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded
  
  useEffect(() => {
    dispatch(fetchHomeContent());
    
   }, [dispatch]);

   if (sectionError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {sectionError} - Please try again later.
    </div>;
  }


  const handleNext = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex < video_sliders?.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrevious = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : video_sliders?.length - 1
    );
  };

  const getLink = (item)=>{
    switch (item?.type) {
        case 'product':
            return `/products/detail/${item?.link}`
        case 'category':
            return `/products/?category=${item?.link}`
        default:
           return item?.external_link;
    }
  }

  return (
    <>
    {isLoading ? <HeroSectionSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :

    <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
      {/*image slider*/}
      <div className="lg:w-4/6 w-full flex">
          <Slider image_sliders={image_sliders} />
      </div>

      
      <div className="lg:w-2/6 gap-4 w-full  flex flex-col">

        
          <div className="relative w-full border h-3/5 group">
            {/* left Arrow */}
            <button
                onClick={handlePrevious}
                className="absolute left-0-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white h-24 w-8 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 z-10"
            >
                <FaChevronLeft size={30} />
            </button>
            <div className='relative h-full'>
              <Link to={currentVideo && getLink(currentVideo)} target='_blank' className='absolute right-2 top-2 z-10 cursor-pointer text-blue-500 hover:underline'>{currentVideo?.caption?currentVideo?.caption :'Click'}</Link>
                      
              {/* Video */}
              <video
                src={currentVideo?.media}
                controls
                autoPlay
                muted
                loop
                preload='true'
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
            {/* Right Arrow */}
            <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-gray-400 to-gray-600 text-white h-24 w-8 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 z-10"
            >
                <FaChevronRight size={30} />
            </button>
          </div>

          
          <div className="flex flex-grow gap-4 h-1/5">
            <div className="flex-grow border p-2 relative bg-white rounded-md">
              {/* Product Image */}
              <Link to={`/products/detail/${left_banner?.link}`} className="block h-full">
                {/* Main Product Image */}
                <img
                  src={left_banner?.media || defaultImage}
                  alt={left_banner?.caption}
                  loading="lazy"
                  className={`w-full h-full object-contain rounded-md transition-opacity duration-500 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)} // Set image loaded state
                />

                {/* Blurred Placeholder */}
                {!isImageLoaded && (
                  <img
                    src={blurImage}
                    alt="Loading"
                    className="absolute inset-0 w-full h-full rounded-md mb-2 animate-pulse object-cover"
                  />
                )}
              </Link>
            </div>
            <div className="flex-grow border p-2 relative bg-white rounded-md">
              {/* Product Image */}
              <Link to={`/products/detail/${right_banner?.link}`} className="block h-full">
                {/* Main Product Image */}
                <img
                  src={right_banner?.media || defaultImage}
                  alt={right_banner?.caption}
                  loading="lazy"
                  className={`w-full h-full object-contain rounded-md transition-opacity duration-500 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)} // Set image loaded state
                />

                {/* Blurred Placeholder */}
                {!isImageLoaded && (
                  <img
                    src={blurImage}
                    alt="Loading"
                    className="absolute inset-0 w-full h-full rounded-md mb-2 animate-pulse object-cover"
                  />
                )}
              </Link>
            </div>
          </div>

      </div>
    </div>
    }

    </>
   
  );
};

export default HeroSection;
