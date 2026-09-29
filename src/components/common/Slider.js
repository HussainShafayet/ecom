import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa6';
import ContentLink from './ContentLink';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ARROW = 'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow ' +
    'opacity-0 transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 sm:flex';

// The hero's image slides (`image_sliders` of the CMS). Each slide is one link; when the admin gave it a caption it is
// the headline over the picture with a "Shop Now" button. It changes by itself every 5 s, stops while the pointer is over
// it (and not at all for someone who asked their system for less motion), and on a phone it is swiped.
const Slider = ({image_sliders}) => {
    const slides = image_sliders || [];
    if (slides.length === 0) return null;

    const several = slides.length > 1;
    const autoplay = several && !prefersReducedMotion() ? { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false } : false;

    return (
        <div className="group relative h-full w-full overflow-hidden rounded-lg">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                navigation={{
                    nextEl: ".custom-swiper-button-next",
                    prevEl: ".custom-swiper-button-prev",
                }}
                pagination={{ clickable: true }}
                autoplay={autoplay}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={several}
                className="h-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id ?? slide.order ?? index}>
                        <ContentLink item={slide} className="relative block h-full w-full">
                            <img
                                src={slide.media}
                                alt={slide.caption || 'Promotion'}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                fetchPriority={index === 0 ? 'high' : undefined}
                                className="h-full w-full object-cover"
                            />
                            {slide.caption && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pb-9 text-left sm:p-6 sm:pb-10">
                                    <p className="line-clamp-2 max-w-xl text-lg font-bold text-white drop-shadow sm:text-2xl lg:text-3xl">{slide.caption}</p>
                                    <span className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-900">Shop Now</span>
                                </div>
                            )}
                        </ContentLink>
                    </SwiperSlide>
                ))}
            </Swiper>
            {several && (
                <>
                    <button type="button" aria-label="Previous slide" className={`custom-swiper-button-prev left-2 ${ARROW}`}>
                        <FaChevronLeft aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Next slide" className={`custom-swiper-button-next right-2 ${ARROW}`}>
                        <FaChevronRight aria-hidden="true" />
                    </button>
                </>
            )}
        </div>
    )
}

export default Slider
