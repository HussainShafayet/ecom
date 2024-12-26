import React, { useState } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';
import {Slider} from '../common';

const HeroSection = () => {
  const videos = [
    {
      id: 1,
      video: 'https://www.w3schools.com/html/mov_bbb.mp4',
      heading: 'Explore the Latest Fashion Trends',
      subheading: 'Stay ahead with the best styles of the season.',
      buttonText: 'Shop Now',
      buttonLink: '/products',
    },
    {
      id: 2,
      video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      heading: 'Find Your Perfect Electronics',
      subheading: 'Top gadgets and accessories at unbeatable prices.',
      buttonText: 'Explore Electronics',
      buttonLink: '/products?category=electronics',
    },
    {
      id: 3,
      video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products?category=home-decor',
    },
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos[currentVideoIndex];


  const handleNext = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex < videos.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrevious = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : videos.length - 1
    );
  };

  return (
    <>
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[60vh]">
      {/*image slider*/}
      <div className="lg:w-3/5 flex h-full w-full">
          <Slider />
      </div>

      <div className="lg:w-2/5 flex flex-col space-y-4 h-full w-full">
        <div className="flex-grow h-3/5">
        <div className="relative h-full w-full">

          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-0-0 top-1/2 transform -translate-y-1/2 text-blue-500 p-1 rounded-full hover:scale-110 transition-transform z-10"
          >
            <FaChevronLeft size={50} className="text-blue-500" />
          </button>

          {/* Video */}
          <video
            src={currentVideo.video}
            controls
            autoPlay
            muted
            loop
            preload='true'
            className="w-full h-full object-cover rounded-sm"
          />

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
          <div className="flex-grow bg-yellow-200 p-4">
            Lower left content
          </div>
          <div className="flex-grow bg-red-200 p-4">
            Lower right content
          </div>
        </div>
      </div>
    </div>


    </>
   
  );
};

export default HeroSection;
