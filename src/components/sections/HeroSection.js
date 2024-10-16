import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
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
      image: 'https://images.unsplash.com/photo-1567016545219-d03b237921b1',
      heading: 'Upgrade Your Home Decor',
      subheading: 'Stylish and affordable pieces to transform your home.',
      buttonText: 'Shop Home Decor',
      buttonLink: '/products?category=home-decor',
    },
  ];

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-300">
        <div
          className="bg-blue-500 h-full"
          style={{ width: `${(currentSlide / totalSlides) * 100}%`, transition: 'width 3s' }}
        ></div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-2 right-2 text-white z-20">
        <span>{currentSlide} / {totalSlides}</span>
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

              {/* Lower the parallax values and remove opacity to ensure visibility */}
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

                {/* Primary CTA button */}
                <Link
                  to={slide.buttonLink}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-700 ease-in-out delay-700"
                >
                  {slide.buttonText}
                </Link>

                {/* Secondary CTA button */}
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
    </div>
  );
};

export default HeroSection;
