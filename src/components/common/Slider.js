import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import {useState} from 'react';


const Slider = ({image_sliders}) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const totalSlides = image_sliders?.length;

   
    const getLink = (slide)=>{
        switch (slide.type) {
            case 'product':
                return `/products/detail/${slide.link}`
            case 'category':
                return `/category/${slide.link}`
            default:
               return slide.external_link;
        }
    }
  return (
    <>
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
                {image_sliders.map((slide) => (
                <SwiperSlide key={slide.order}>
                    <Link to={getLink(slide)} target='_blank'>
                    <div
                        className="relative bg-cover bg-center h-full flex items-center justify-center text-center text-white"
                        style={{ backgroundImage: `url(${slide.media})` }}
                        data-swiper-parallax="-100"
                    >
                    </div>
                    </Link>
                </SwiperSlide>
                ))}
            </Swiper>
        </div>
    </>
  )
}

export default Slider
