import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import {useState} from 'react';
import {useSelector} from 'react-redux';


const Slider = () => {
    const {isLoading, image_sliders, video_sliders, left_banner, right_banner, error} = useSelector((state)=> state.content);
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
    const getLink = (slide)=>{
        switch (slide.type) {
            case 'product':
                return `products/detail/${slide.link}`
            case 'category':
                return `category/${slide.link}`
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
                    <Link to={getLink(slide)}>
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
