import { useCallback, useEffect, useState } from 'react';
import {ProductSection, Slider} from '../common';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {fetchBestSellingContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {SectionSkeleton} from '../common/skeleton';
import {fetchBestSellingProducts} from '../../redux/slice/product/bestSellingSlice';

const BestSelling = ({forRoute}) => {
  const bestSellingLoading = useSelector((state) => state.best_selling.best_selling_Loading);
  const bestSelling = useSelector((state) => state.best_selling.best_selling);
  const bestSellingError = useSelector((state) => state.best_selling.best_selling_error);


  const imageSliders = useSelector((state) => state.content.image_sliders);
  const rightBanner = useSelector((state) => state.content.right_banner);

   const sectionError = useSelector((state) => state.globalError.sectionErrors["best-sale"]);

  const [isImageLoaded, setLoadedImages] = useState(false); // Track if the image has loaded

  const dispatch = useDispatch();

  useEffect(() => {
    if (forRoute) dispatch(fetchBestSellingContent());
    dispatch(fetchBestSellingProducts({ page_size: 12 }));
  }, [dispatch, forRoute]);

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

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  if (sectionError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {sectionError} - Please try again later.
    </div>;
  }


  return (
    <>
    {bestSellingLoading ? <SectionSkeleton forRoute={forRoute} /> :
      bestSellingError ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {bestSellingError} - Please try again later.
      </div>
    ) :
      <div className="container mx-auto ">
      {forRoute && 
        <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
          {/*image slider*/}
          <div className="lg:w-4/6 w-full flex">
              <Slider image_sliders={imageSliders} />
          </div>
    
          <div className="lg:w-2/6 gap-4 w-full  flex flex-col">
            {rightBanner?.media_type === 'image' &&
              <>
                {/* Product Image */}
                <Link to={getLink(rightBanner)} target='_blank' className="block h-full">
                  {/* Main Product Image */}
                  <img
                    src={rightBanner?.media}
                    alt={rightBanner?.caption}
                    loading="lazy"
                    className={`w-full h-full object-contain rounded-md transition-opacity duration-500 ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad('rightBanner')} // Set image loaded state
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
            {rightBanner?.media_type === 'video' && 
              <div className='relative h-full'>
                <Link to={getLink(rightBanner)} target='_blank' className='absolute right-2 top-2 z-10 cursor-pointer text-blue-500 hover:underline'>{rightBanner?.caption?rightBanner?.caption :'Click'}</Link>
                {/* Video */}
                <video
                  src={rightBanner?.media}
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
          title="Best Selling"
          subtitle="What other shoppers buy the most."
          to={forRoute ? undefined : '/products/best-selling'}
          products={bestSelling}
          carousel={!forRoute}
        />

        {forRoute &&
          <ProductSection title="Recommended Products" subtitle="More you might like." products={bestSelling} />
        }
      </div>
    }
    </>
  );
};

export default BestSelling;
