import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';
import { FaChevronLeft, FaChevronRight, FaPlay, FaTimes } from 'react-icons/fa';
import useDialog from '../../../hooks/useDialog';
import defaultImage from '../../../assets/images/default_product_image.jpg';

const ARROW = 'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-lg text-white hover:bg-white/30 disabled:opacity-30 md:flex';

// The product's pictures full screen (opened by a tap or click on the gallery): swipe between them, pinch or double-tap to zoom in and drag to
// look around (Swiper's Zoom, up to 4x), the arrow keys and two arrow buttons on a computer, a "2 / 5" counter, a row of thumbnails, a 44 px
// Close button and Esc. A video plays here too (no zoom on it) and stops when you leave it. A dialog like the filter sheet (`useDialog`: focus
// inside and back, Tab kept inside, Esc closes) drawn in the body, so the page behind, which scrolls in its own box, cannot scroll under it.
//   media       [{ file_url, thumbnail_url, file_type: 'image' | 'video' }]
//   startIndex  the one to open on;  onClose(index)  says which one was on show, so the page can show it too
const ImageViewer = ({ media, startIndex = 0, name, onClose }) => {
  const dialog = useRef(null);
  const swiperRef = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const last = media.length - 1;
  useDialog(dialog, () => onClose(index));

  const pauseVideos = () => dialog.current?.querySelectorAll('video').forEach((video) => video.pause());
  const go = (target) => {
    setIndex(target);
    swiperRef.current?.slideTo(target);
  };

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${name}: pictures`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white outline-none"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span aria-live="polite" className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">{index + 1} / {media.length}</span>
        <button
          type="button"
          onClick={() => onClose(index)}
          aria-label="Close pictures"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/25"
        >
          <FaTimes aria-hidden="true" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Swiper
          modules={[Zoom, Keyboard]}
          zoom={{ maxRatio: 4 }}
          keyboard={{ enabled: true }}
          initialSlide={startIndex}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => {
            setIndex(swiper.activeIndex);
            pauseVideos();
          }}
          className="h-full w-full"
        >
          {media.map((item, position) => (
            <SwiperSlide key={item.file_url}>
              {item.file_type === 'video' ? (
                <div className="flex h-full items-center justify-center">
                  <video
                    src={item.file_url}
                    poster={item.thumbnail_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-full max-w-full"
                  />
                </div>
              ) : (
                <div className="swiper-zoom-container">
                  <img
                    src={item.file_url}
                    alt={`${name} (${position + 1} of ${media.length})`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultImage;
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {media.length > 1 && (
          <>
            <button type="button" onClick={() => go(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous picture" className={`${ARROW} left-3`}>
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(Math.min(last, index + 1))} disabled={index === last} aria-label="Next picture" className={`${ARROW} right-3`}>
              <FaChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {media[index]?.file_type !== 'video' && (
        <p className="px-3 pt-1 text-center text-xs text-white/60 md:hidden">Pinch or double-tap to zoom</p>
      )}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
          {media.map((item, position) => (
            <button
              key={item.file_url}
              type="button"
              onClick={() => go(position)}
              aria-label={`Show ${item.file_type === 'video' ? 'video' : 'picture'} ${position + 1}`}
              aria-current={position === index}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white/10 ${position === index ? 'border-white' : 'border-transparent opacity-70'}`}
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
    </div>,
    document.body
  );
};

export default ImageViewer;
