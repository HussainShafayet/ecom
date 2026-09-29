import { useEffect, useState } from 'react';
import {ProductSection, Slider} from '../common';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {fetchNewArrivalContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {SectionSkeleton} from '../common/skeleton';
import {fetchNewArrivalProducts} from '../../redux/slice/product/newArrivalSlice';

const NewArrival = ({forRoute}) => {
  const newArrivalLoading = useSelector((state) => state.new_arrival.new_arrival_Loading);
  const newArrival = useSelector((state) => state.new_arrival.new_arrival);
  const newArrivalError = useSelector((state) => state.new_arrival.new_arrival_error);

  const {image_sliders, right_banner} = useSelector((state)=> state.content);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["new-arrival"])
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

  const dispatch = useDispatch();

  useEffect(() => {
   if (forRoute) {
     dispatch(fetchNewArrivalContent());
   }
   dispatch(fetchNewArrivalProducts({page_size:12}));
  }, [dispatch,forRoute]);

  if (sectionError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {sectionError} - Please try again later.
    </div>;
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
    {newArrivalLoading ? <SectionSkeleton forRoute={forRoute} /> :
      newArrivalError ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {newArrivalError} - Please try again later.
      </div>
    ) :
      <div className="container mx-auto">

      {forRoute && 
        <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
          {/*image slider*/}
          <div className="lg:w-4/6 flex w-full">
              <Slider image_sliders={image_sliders} />
          </div>
    
          <div className="lg:w-2/6 gap-4 w-full  flex flex-col border">
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
                <Link to={getLink(right_banner)} target='_blank' className='absolute right-2 top-2 z-10 cursor-pointer text-blue-500 hover:underline'>{right_banner.caption?right_banner.caption :'Click'}</Link>
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
          title="New Arrival"
          subtitle="The newest products in our store."
          to={forRoute ? undefined : '/products/new-arrival'}
          products={newArrival}
          carousel={!forRoute}
        />

        {forRoute &&
          <ProductSection title="Recommended Products" subtitle="More you might like." products={newArrival} />
        }
      </div>
      }
    </>
  );
};

export default NewArrival;
