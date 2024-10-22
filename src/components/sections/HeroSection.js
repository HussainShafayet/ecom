import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 5;
  const [muted, setMuted] = useState(true); // State to control mute/unmute

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
      buttonLink: '/products?category=electronics',
    },
    {
      id: 3,
      image: 'https://pargo.co.za/wp-content/uploads/2018/03/online-shopping-ecommerce-ss-1920.png',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products?category=home-decor',
    },,
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31',
      heading: 'Find Your Perfect Electronics',
      subheading: 'Top gadgets and accessories at unbeatable prices.',
      buttonText: 'Explore Electronics',
      buttonLink: '/products?category=electronics',
    },
    {
      id: 5,
      image: 'https://framerusercontent.com/images/03p8SmPBNaVBFUbGHpqciSf8zY.jpeg',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products?category=home-decor',
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
      video: 'https://videos.pexels.com/video-files/5644237/5644237-sd_960_506_25fps.mp4',
      heading: 'Find Your Perfect Electronics',
      subheading: 'Top gadgets and accessories at unbeatable prices.',
      buttonText: 'Explore Electronics',
      buttonLink: '/products?category=electronics',
    },
    {
      id: 3,
      video: 'https://videos.pexels.com/video-files/5644234/5644234-sd_960_506_25fps.mp4',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products?category=home-decor',
    },
  ];

   // Toggle mute/unmute
   const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <>
       {/*<div className="relative">
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
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}  // Update current slide number
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative bg-cover bg-center h-screen flex items-center justify-center text-center text-white"
              style={{ backgroundImage: `url(${slide.image})` }}
              data-swiper-parallax="-100"
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div
                className="relative z-10 px-4"
                data-swiper-parallax="-50"
              >
                <h1
                  className="text-4xl md:text-6xl font-bold mb-4 transition-all duration-700 ease-in-out delay-300"
                >
                  {slide.heading}
                </h1>
                <p
                  className="text-lg md:text-2xl mb-8 transition-all duration-700 ease-in-out delay-500"
                >
                  {slide.subheading}
                </p>

                
                <Link
                  to={slide.buttonLink}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-700 ease-in-out delay-700"
                >
                  {slide.buttonText}
                </Link>

               
                <Link
                  to={slide.buttonLink}
                  className="text-white hover:text-blue-500 font-semibold py-2 px-4 mt-4 inline-block transition-all duration-700 ease-in-out delay-1000"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>*/}

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
          <div className="relative w-full h-full">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-300">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(currentSlide / totalSlides) * 100}%`, transition: 'width 3s' }}
              ></div>
            </div>

            {/* Swiper Slider */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade, Parallax]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop
              parallax
              className="h-full"
              onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}
            >
              {videos.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative h-full flex items-center justify-center text-center text-white">
                  <Link to={slide.buttonLink}>
                    {/* Video Background */}
                    <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={slide.video}
                        autoPlay
                        muted={muted}
                        loop
                      ></video>
                  </Link>
                  
                    {/* Sound Toggle Button */}
                    <button
                      onClick={toggleMute}
                      className="absolute top-3 right-4 z-20 text-white bg-gray-700 p-2 rounded-full hover:bg-gray-800 transition"
                    >
                      {muted ? <FaVolumeMute className="h-6 w-6" /> : <FaVolumeUp className="h-6 w-6" />}
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
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
