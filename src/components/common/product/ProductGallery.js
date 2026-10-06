import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FaExpand, FaPlay } from 'react-icons/fa';
import defaultImage from '../../../assets/images/default_product_image.jpg';
import useMediaQuery from '../../../hooks/useMediaQuery';
import ImageViewer from './ImageViewer';

// How much the picture grows under a mouse (a computer only), and what "a mouse" means: it can hover and it points finely. A phone has
// neither, so a tap goes straight to the full-screen viewer and nothing grows under a finger.
const HOVER_ZOOM = 2.5;
const MOUSE = '(hover: hover) and (pointer: fine)';

// One picture on the page: a button that opens the viewer (a tap or a click), and, under a mouse, a magnifier: the picture grows around the
// pointer while it moves over it, and goes back when it leaves.
const Picture = ({ src, alt, eager, hoverZoom, onOpen }) => {
  const [origin, setOrigin] = useState(null); // where the pointer is on the picture, in %

  const follow = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: box.width ? ((event.clientX - box.left) / box.width) * 100 : 50,
      y: box.height ? ((event.clientY - box.top) / box.height) * 100 : 50,
    });
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseMove={hoverZoom ? follow : undefined}
      onMouseLeave={hoverZoom ? () => setOrigin(null) : undefined}
      aria-label={`Open ${alt} full screen`}
      className={`relative block w-full overflow-hidden ${hoverZoom ? 'cursor-zoom-in' : ''}`}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = defaultImage;
        }}
        style={origin ? { transform: `scale(${HOVER_ZOOM})`, transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
        className="aspect-square w-full object-contain transition-transform duration-150 ease-out"
      />
      {!hoverZoom && (
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-xs text-white">
          <FaExpand />
        </span>
      )}
    </button>
  );
};

// The product's pictures and videos, phone first: one full-width square you swipe, a "2/5" counter, and a row of small
// thumbnails under it (56 px, easy to tap). A thumbnail is a picture, never a <video>, and a video only loads when it is played,
// so opening a product does not pull every clip over mobile data. Tapping a picture opens it full screen (`ImageViewer`: swipe, pinch and
// double-tap to zoom, the video too); under a mouse the picture also grows around the pointer.
//   media     [{ file_url, thumbnail_url, file_type: 'image' | 'video' }]
//   selected  the media item on show; onSelect(item) says which one the customer chose (a thumbnail tap or a swipe)
const ProductGallery = ({ media, selected, onSelect, name }) => {
  const items = media || [];
  const swiperRef = useRef(null);
  const hoverZoom = useMediaQuery(MOUSE);
  const [viewerAt, setViewerAt] = useState(null); // the picture the full-screen viewer was opened on, or null while it is closed
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
          simulateTouch={false}
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
                <Picture
                  src={item.file_url}
                  alt={`${name} (${index + 1} of ${items.length})`}
                  eager={index === 0}
                  hoverZoom={hoverZoom}
                  onOpen={() => setViewerAt(index)}
                />
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

      {viewerAt !== null && (
        <ImageViewer
          media={items}
          startIndex={viewerAt}
          name={name}
          onClose={(shown) => {
            setViewerAt(null);
            const item = items[shown];
            if (item && item.file_url !== selected?.file_url) onSelect(item); // the page shows the picture they ended on
          }}
        />
      )}

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
