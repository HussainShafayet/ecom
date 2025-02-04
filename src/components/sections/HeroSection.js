import React, { useEffect, useState } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import {Loader, Slider} from '../common';
import {fetchHomeContent} from '../../redux/slice/contentSlice';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import blurImage from '../../assets/images/blur.jpg';
import {HeroSectionSkeleton} from '../common/skeleton';

const HeroSection = () => {
  
  const {isLoading, image_sliders, video_sliders, left_banner, right_banner, error} = useSelector((state)=> state.content);
  const dispatch = useDispatch();

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = video_sliders?.[currentVideoIndex];
   const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded
  
  useEffect(() => {
    dispatch(fetchHomeContent());
    
   }, [dispatch]);


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
    switch (item.type) {
        case 'product':
            return `/products/detail/${item.link}`
        case 'category':
            return `/products/?category=${item.link}`
        default:
           return item?.external_link;
    }
  }

  return (
    <>
    {true? <HeroSectionSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :

    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[40vh]">
      {/*image slider*/}
      <div className="lg:w-4/6 flex h-full w-full">
          <Slider image_sliders={image_sliders} />
      </div>

      <div className="lg:w-2/6 flex flex-col space-y-4 h-full w-full">
        <div className="flex-grow h-3/5">
        <div className="relative h-full w-full">

          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-0-0 top-1/2 transform -translate-y-1/2 text-blue-500 p-1 rounded-full hover:scale-110 transition-transform z-10"
          >
            <FaChevronLeft size={50} className="text-blue-500" />
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
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-blue-500 p-1 rounded-full hover:scale-110 transition-transform z-10"
          >
            <FaChevronRight size={50} className="text-blue-500" />
          </button>
        </div>
         
        </div>
        
        <div className="flex flex-grow space-x-4 h-2/5">
          <div className="flex-grow border p-4">
            {/* Product Image */}
            <Link to={`/products/detail/${left_banner?.link}`} className="block h-full">
              {/* Main Product Image */}
              <img
                src={left_banner?.media}
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
                  className="absolute inset-0 w-full h-36 rounded-md mb-2 animate-pulse object-cover"
                />
              )}
            </Link>
          </div>
          <div className="flex-grow p-4 border">
            {/* Product Image */}
            <Link to={`/products/detail/${right_banner?.link}`} className="block h-full">
              {/* Main Product Image */}
              <img
                src={right_banner?.media}
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
                  className="absolute inset-0 w-full h-36 rounded-md mb-2 animate-pulse object-cover"
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
