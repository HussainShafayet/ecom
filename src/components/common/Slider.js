import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import {useState} from 'react';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa6';

const Slider = ({image_sliders}) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const totalSlides = image_sliders?.length;

   
    const getLink = (slide)=>{
        switch (slide.type) {
            case 'product':
                return `/products/detail/${slide.link}`
            case 'category':
                return `/products/?category=${slide.link}`
            default:
               return slide.external_link;
        }
    }
  return (
    <>
    <div className="relative h-full w-full border rounded-sm">
        {/*<div className="absolute top-0 left-0 w-full h-1 bg-gray-300">
            <div
                className="bg-blue-500 h-full"
                style={{ width: `${(currentSlide / totalSlides) * 100}%`, transition: 'width 3s' }}
            ></div>
        </div>*/}

        <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade, Parallax]}
            navigation={{
                nextEl: ".custom-swiper-button-next",
                prevEl: ".custom-swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            parallax
            className="h-full"
            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex + 1)}
        >
            {image_sliders.map((slide) => (
                <SwiperSlide key={slide.order}>
                    <Link to={getLink(slide)} target="_blank">
                        <div className="relative flex items-center justify-center text-center text-white h-full">
                            <img
                                src={slide.media}
                                alt="Slide"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
            {/* Custom Navigation Buttons */}
            {/* left Arrow */}
             <button
                className="custom-swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white  h-24 w-8 rounded-sm shadow-lg hover:scale-105 transition-transform z-10"
            >
                <FaChevronLeft size={30} />
            </button>
            {/* Right Arrow */}
            <button
                className="custom-swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white h-24 w-8 rounded-sm shadow-lg hover:scale-105 transition-transform z-10"
            >
                <FaChevronRight size={30} />
            </button>
        </Swiper>

    </div>
    </>
  )
}

export default Slider
