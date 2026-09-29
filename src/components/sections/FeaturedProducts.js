import { useEffect, useState } from 'react';
import {ProductSection, Slider} from '../common';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFeaturedProducts} from '../../redux/slice/productSlice';
import {Link} from 'react-router-dom';
import {fetchFeaturedContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {SectionSkeleton} from '../common/skeleton';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const FeaturedProducts = ({forRoute}) => {
  const {featured_Loading, featured:products, featured_error} = useSelector((state)=> state.product);
  const {image_sliders, right_banner} = useSelector((state)=> state.content);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["featured"]);

  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded


  const dispatch = useDispatch();

  useEffect(() => {
    if (forRoute) {
      dispatch(fetchFeaturedContent());
    }
   dispatch(fetchFeaturedProducts({page_size:12}));
  }, [dispatch, forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['featured', 'featured-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchFeaturedContent());
    dispatch(fetchFeaturedProducts({page_size:12}));
  };

  if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }


  const getLink = (item)=>{
    switch (item?.type) {
        case 'product':
          return `/products/detail/${item?.link}`
        case 'category':
            return `/products/?category=${item?.link}`
        default:
           return item?.external_link;
    }
  }

  return (
    <>
    {featured_Loading ? <SectionSkeleton forRoute={forRoute} /> :
      featured_error ? (
      <SectionError message={featured_error} onRetry={retry} />
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
                <Link to={getLink(right_banner)} target='_blank' className='absolute right-2 top-2 z-10 cursor-pointer text-blue-500 hover:underline'>{right_banner?.caption?right_banner?.caption :'Click'}</Link>
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
          title="Featured Products"
          subtitle="Products we recommend."
          to={forRoute ? undefined : '/products/featured'}
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

export default FeaturedProducts;
