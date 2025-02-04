import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFlashSaleProducts} from '../../redux/slice/productSlice';
import {Loader, ProductCard, Slider} from '../common';
import {Link} from 'react-router-dom';
import {fetchFlashSaleContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';
import {FlashSaleSkeleton} from '../common/skeleton';

const FlashSale = ({forRoute}) => {
    const {flash_sale_Loading, flash_sale:products, flash_sale_error} = useSelector((state)=> state.product);
    const {image_sliders, video_sliders, left_banner, right_banner} = useSelector((state)=> state.content);

    const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

    const dispatch = useDispatch();

    useEffect(() => {
      if (forRoute) {
        dispatch(fetchFlashSaleContent());
      }
      dispatch(fetchFlashSaleProducts({page_size: 12}));
    }, [dispatch]);

    //if (flash_sale_Loading) {
    //  return <div className='container h-20 flex justify-center'><Loader message='Loading Trending' /></div>
    //}

    //if (flash_sale_error) {
    //    return <div>{flash_sale_error}</div>;
    //}

    const getLink = (item)=>{
      switch (item.type) {
          case 'product':
              return `/products/detail/${item.link}`
          case 'category':
              return `/products/?category=${item.link}`
          default:
             return item.external_link;
      }
    }

  return (
    <>
     {true? <FlashSaleSkeleton /> :
      flash_sale_error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {flash_sale_error} - Please try again later.
      </div>
    ) :
      <div className="container mx-auto">
        {forRoute && 
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[60vh]">
          {/*image slider*/}
          <div className="lg:w-3/5 flex h-full w-full">
              <Slider image_sliders={image_sliders} />
          </div>
    
          <div className="lg:w-2/5 flex flex-col space-y-4 h-full w-full border">
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
                <Link to={getLink(right_banner)} target='_blank' className='absolute right-2 top-2 z-10 text-blue-500 hover:underline text:2x'>{right_banner.caption?right_banner.caption :'Click'}</Link>
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
          {products.length === 0  ? <div className='text-center'>
            <span>Not found</span>
          </div>:

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          }
        </div>
        {forRoute && 
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
            {products.length === 0  ? <div className='text-center'>
              <span>Not found</span>
            </div>:

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            }
          </div>
        }
      </div>
     }
    </>
  );
};

export default FlashSale;
