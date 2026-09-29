import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {ProductSection, Slider} from '../common';
import {Link} from 'react-router-dom';
import {fetchFlashSaleContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {SectionSkeleton} from '../common/skeleton';
import {fetchFlashSaleProducts} from '../../redux/slice/product/flashSaleSlice';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const FlashSale = ({forRoute}) => {
  const dispatch = useDispatch();
  const {
    flash_sale_Loading,
    flash_sale: products,
    flash_sale_error,
  } = useSelector((state) => state.flash_sale, shallowEqual);

  const {
    image_sliders,
    right_banner,
  } = useSelector((state) => state.content, shallowEqual);

  const sectionError = useSelector(
    (state) => state.globalError.sectionErrors["flash-sale"]
  );

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ✅ Prevent function recreation
  const getLink = useCallback((item) => {
    switch (item?.type) {
      case "product":
        return `/products/detail/${item?.link}`;
      case "category":
        return `/products/?category=${item?.link}`;
      default:
        return item?.external_link;
    }
  }, []);

  // ✅ useEffect dependency fix
  useEffect(() => {
    if (forRoute) {
      dispatch(fetchFlashSaleContent());
    }
    dispatch(fetchFlashSaleProducts({ page_size: 12 }));
  }, [dispatch, forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['flash-sale', 'flash-sale-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchFlashSaleContent());
    dispatch(fetchFlashSaleProducts({ page_size: 12 }));
  };

  if (sectionError) {
    return (
      <SectionError message={sectionError} onRetry={retry} />
    );
  }

  return (
    <>
     {flash_sale_Loading ? <SectionSkeleton forRoute={forRoute} /> :
      flash_sale_error ? (
      <SectionError message={flash_sale_error} onRetry={retry} />
    ) :
      <div className="container mx-auto">
        {forRoute && 
        <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
          {/*image slider*/}
          <div className="lg:w-4/6 w-full flex">
              <Slider image_sliders={image_sliders} />
          </div>
    
          <div className="lg:w-2/6 gap-4 w-full  flex flex-col">
            {right_banner?.media_type === 'image' &&
              <>
                {/* Product Image */}
                <Link to={getLink(right_banner)} target='_blank' className="block h-full">
                  {/* Main Product Image */}
                  <img
                    src={right_banner?.media}
                    alt={right_banner?.caption}
                    loading="lazy"
                    className={`w-full h-full object-contain rounded-md transition-opacity duration-500 ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsImageLoaded(true)} // Set image loaded state
                  />

                  {/* Blurred Placeholder */}
                  {!isImageLoaded && (
                    <img
                      src={blurImage}
                      alt="Loading"
                      className="absolute inset-0 w-full h-36 rounded-md mb-2 animate-pulse object-cover"
                    />
                  )}
                </Link>
              </>
            }
            {right_banner?.media_type === 'video' && 
              <div className='relative h-full'>
                <Link to={getLink(right_banner)} target='_blank' className='absolute right-2 top-2 z-10 text-blue-500 hover:underline text:2x'>{right_banner?.caption?right_banner?.caption :'Click'}</Link>
                {/* Video */}
                <video
                  src={right_banner?.media}
                  controls
                  autoPlay
                  muted
                  loop
                  preload='true'
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            }
          </div>
        </div>
        }
       
         
        <ProductSection
          title="Flash Sale"
          subtitle="Limited-time deals on popular products."
          to={forRoute ? undefined : '/products/flash-sale'}
          products={products}
          carousel={!forRoute}
        />

        {forRoute &&
          <ProductSection title="Recommended Products" subtitle="More you might like." products={products} />
        }
      </div>
     }
    </>
  );
};

export default FlashSale;
