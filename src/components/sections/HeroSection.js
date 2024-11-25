import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 5;

  const slides = [
    {
      id: 1,
      image: 'https://media.istockphoto.com/id/1249219777/photo/shopping-online-concept-parcel-or-paper-cartons-with-a-shopping-cart-logo-in-a-trolley-on-a.jpg?s=612x612&w=0&k=20&c=EWKEahyVLY8iAHyirCCDESHRGW37lqUJ7In0SssNSLE=',
      heading: 'Explore the Latest Fashion Trends',
      subheading: 'Stay ahead with the best styles of the season.',
      buttonText: 'Shop Now',
      buttonLink: '/products',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31',
      heading: 'Find Your Perfect Electronics',
      subheading: 'Top gadgets and accessories at unbeatable prices.',
      buttonText: 'Explore Electronics',
      buttonLink: '/products/category/kitchen-accessories',
    },
    {
      id: 3,
      image: 'https://pargo.co.za/wp-content/uploads/2018/03/online-shopping-ecommerce-ss-1920.png',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products/category/home-decoration',
    },,
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31',
      heading: 'Find Your Perfect Electronics',
      subheading: 'Top gadgets and accessories at unbeatable prices.',
      buttonText: 'Explore Electronics',
      buttonLink: '/products/category/groceries',
    },
    {
      id: 5,
      image: 'https://framerusercontent.com/images/03p8SmPBNaVBFUbGHpqciSf8zY.jpeg',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products/category/furniture',
    },
  ];

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
      <div className="lg:w-3/5 flex h-full w-full">
          <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-300">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(currentSlide / totalSlides) * 100}%`, transition: 'width 3s' }}
              ></div>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade, Parallax]}  // Correct module imports
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop
              parallax
              className='h-full'
              onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}  // Update current slide number
            >
              {slides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <Link to={slide.buttonLink}>
                    <div
                      className="relative bg-cover bg-center h-full flex items-center justify-center text-center text-white"
                      style={{ backgroundImage: `url(${slide.image})` }}
                      data-swiper-parallax="-100"
                    >
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
          </div>
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
