import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {ProductCard, Slider} from '../common';
import {Link} from 'react-router-dom';
import {fetchFlashSaleContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {SectionSkeleton} from '../common/skeleton';
import {fetchFlashSaleProducts} from '../../redux/slice/product/flashSaleSlice';

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

  if (sectionError) {
    return (
      <div className="text-center text-red-500 font-semibold py-4">
        {sectionError} - Please try again later.
      </div>
    );
  }

  return (
    <>
     {flash_sale_Loading ? <SectionSkeleton forRoute={forRoute} /> :
      flash_sale_error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {flash_sale_error} - Please try again later.
      </div>
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
       
         
          {products?.length !== 0 &&
          <div className='my-5'>
            <h2 className="text-3xl font-bold">Flash Sale</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
              <span className="text-sm md:text-base text-gray-600">
                Discover the latest trends with our Flash Sale Products.
              </span>
              {!forRoute && 
              <Link
                to="/products/flash-sale"
                className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
                target='_blank'
              >
                View All
              </Link>
              }
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {products?.map((product) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>
          </div>
          }
        
        {forRoute && 
          <>
          {products?.length !== 0  &&
            <div className='my-5'>
              <h2 className="text-3xl font-bold">Recomendent Products</h2>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <span className="text-sm md:text-base text-gray-600">
                  Discover the latest trends with our Flash Sale Products.
                </span>
                {!forRoute && 
                <Link
                  to="/products/flash-sale"
                  className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
                >
                  View All
                </Link>
                }
              </div>
              

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {products?.map((product) => (
                  <ProductCard key={product?.id} product={product} />
                ))}
              </div>
            </div>
          }
          </>
        }
      </div>
     }
    </>
  );
};

export default FlashSale;
