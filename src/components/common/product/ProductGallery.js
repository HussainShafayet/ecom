import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FaExpand, FaPlay } from 'react-icons/fa';
import defaultImage from '../../../assets/images/default_product_image.jpg';
import useMediaQuery from '../../../hooks/useMediaQuery';
import ImageViewer from './ImageViewer';

// The Alibaba / Amazon way, for a computer: the picture itself stays where it is; a translucent square (the lens) follows the mouse over it and
// the area under the lens is shown ENLARGED in a separate pane beside the picture, over the details column. Only for a mouse (it can hover and it
// points finely) on a screen wide enough for two columns (the pane needs room): a phone has neither, so a tap goes straight to the full-screen
// viewer and nothing follows a finger.
const ZOOM = 2.5; // how many times bigger the pane shows it
const LENS = 100 / ZOOM; // the lens is this many % of the picture's width and height
const MOUSE = '(hover: hover) and (pointer: fine)';
const TWO_COLUMNS = '(min-width: 768px)';
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// One picture on the page: a button that opens the viewer (a tap or a click) and, under a mouse, the lens that follows the pointer.
// `onLens({x, y})` tells the gallery where the lens is (its top-left corner, in % of the picture) so the pane can follow, `onLens(null)` that it left.
const Picture = ({ src, alt, eager, sidePane, onOpen, onLens }) => {
  const [lens, setLens] = useState(null);

  const follow = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.width ? ((event.clientX - box.left) / box.width) * 100 : 50;
    const y = box.height ? ((event.clientY - box.top) / box.height) * 100 : 50;
    const next = { x: clamp(x - LENS / 2, 0, 100 - LENS), y: clamp(y - LENS / 2, 0, 100 - LENS) }; // centred on the pointer, never outside the picture
    setLens(next);
    onLens(next);
  };
  const leave = () => {
    setLens(null);
    onLens(null);
  };

  return (
    <button
      type="button"
      onClick={() => { leave(); onOpen(); }}
      onMouseMove={sidePane ? follow : undefined}
      onMouseLeave={sidePane ? leave : undefined}
      aria-label={`Open ${alt} full screen`}
      className={`relative block w-full overflow-hidden ${sidePane ? 'cursor-crosshair' : ''}`}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = defaultImage;
        }}
        className="aspect-square w-full object-contain"
      />
      {lens && (
        <span
          aria-hidden="true"
          data-testid="zoom-lens"
          className="pointer-events-none absolute border border-white/80 bg-white/30 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ left: `${lens.x}%`, top: `${lens.y}%`, width: `${LENS}%`, height: `${LENS}%` }}
        />
      )}
      {!sidePane && (
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
// double-tap to zoom, the video too); under a mouse a lens follows the pointer over the picture and a pane beside it shows that area enlarged.
//   media     [{ file_url, thumbnail_url, file_type: 'image' | 'video' }]
//   selected  the media item on show; onSelect(item) says which one the customer chose (a thumbnail tap or a swipe)
const ProductGallery = ({ media, selected, onSelect, name }) => {
  const items = media || [];
  const swiperRef = useRef(null);
  const mouse = useMediaQuery(MOUSE);
  const twoColumns = useMediaQuery(TWO_COLUMNS);
  const sidePane = mouse && twoColumns;
  const [zoom, setZoom] = useState(null); // while the mouse is over a picture: { src, x, y } (the lens's corner, in % of the picture)
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
    <div className="relative">
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
                  sidePane={sidePane}
                  onOpen={() => setViewerAt(index)}
                  onLens={(position) => setZoom(position && { src: item.file_url, ...position })}
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

      {sidePane && zoom && (
        <div
          aria-hidden="true"
          data-testid="zoom-pane"
          className="pointer-events-none absolute left-full top-0 z-30 ml-4 aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
        >
          {/* the picture at ZOOM times the pane's size, moved so the area under the lens fills the pane */}
          <div style={{ width: `${ZOOM * 100}%`, height: `${ZOOM * 100}%`, transform: `translate(-${zoom.x}%, -${zoom.y}%)` }}>
            <img src={zoom.src} alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      )}

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
