import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { FaPlay } from 'react-icons/fa';
import defaultImage from '../../../assets/images/default_product_image.jpg';

// The product's pictures and videos, phone first: one full-width square you swipe, a "2/5" counter, and a row of small
// thumbnails under it (56 px, easy to tap). A thumbnail is a picture, never a <video>, and a video only loads when it is played,
// so opening a product does not pull every clip over mobile data. Tapping a picture zooms it.
//   media     [{ file_url, thumbnail_url, file_type: 'image' | 'video' }]
//   selected  the media item on show; onSelect(item) says which one the customer chose (a thumbnail tap or a swipe)
const ProductGallery = ({ media, selected, onSelect, name }) => {
  const items = media || [];
  const swiperRef = useRef(null);
  const selectedIndex = Math.max(0, items.findIndex((item) => item?.file_url === selected?.file_url));
  // Another colour has other pictures: a new set starts a new slider
  const setKey = items.map((item) => item?.file_url).join('|');

  // A thumbnail was tapped (or a colour picked): bring that slide to the front
  useEffect(() => {
    const swiper = swiperRef.current;
    if (swiper && swiper.activeIndex !== selectedIndex) swiper.slideTo(selectedIndex);
  }, [selectedIndex]);

  if (items.length === 0) {
    return <img src={defaultImage} alt={name} className="aspect-square w-full rounded-lg bg-gray-50 object-contain" />;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg bg-gray-50">
        <Swiper
          key={setKey}
          initialSlide={selectedIndex}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => {
            const item = items[swiper.activeIndex];
            if (item && item.file_url !== selected?.file_url) onSelect(item);
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.file_url}>
              {item.file_type === 'video' ? (
                <video
                  src={item.file_url}
                  poster={item.thumbnail_url}
                  controls
                  playsInline
                  preload="none"
                  className="aspect-square w-full bg-black object-contain"
                />
              ) : (
                <Zoom>
                  <img
                    src={item.file_url}
                    alt={`${name} (${index + 1} of ${items.length})`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultImage;
                    }}
                    className="aspect-square w-full object-contain"
                  />
                </Zoom>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {items.length > 1 && (
          <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {selectedIndex + 1}/{items.length}
          </span>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => (
            <button
              key={item.file_url}
              type="button"
              onClick={() => onSelect(item)}
              aria-label={`Show ${item.file_type === 'video' ? 'video' : 'picture'} ${index + 1}`}
              aria-current={index === selectedIndex}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 ${index === selectedIndex ? 'border-blue-600' : 'border-gray-200'}`}
            >
              <img src={item.thumbnail_url || item.file_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              {item.file_type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <FaPlay aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
