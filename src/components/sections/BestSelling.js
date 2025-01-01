import React, { useEffect, useState } from 'react';
import {Loader, ProductCard, Slider} from '../common'; // Assuming you have a ProductCard component
import {useDispatch, useSelector} from 'react-redux';
import {fetchBestSellingProducts} from '../../redux/slice/productSlice';
import {Link} from 'react-router-dom';
import {fetchBestSellingContent, fetchFeaturedContent} from '../../redux/slice/contentSlice';
import blurImage from '../../assets/images/blur.jpg';

const BestSelling = ({forRoute}) => {
  const {isLoading, best_selling:products, error} = useSelector((state)=> state.product);
   const {image_sliders, video_sliders, left_banner, right_banner} = useSelector((state)=> state.content);

  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded

  const dispatch = useDispatch();

  useEffect(() => {
    if (forRoute) {
      dispatch(fetchFeaturedContent());
    }
   dispatch(fetchBestSellingProducts({page_size:12}));
  }, [dispatch]);

  if (isLoading) {
    return <div className='container h-20 flex justify-center'><Loader message='Loading Best Selling' /></div>
  }

  if (error) {
    return <div>{error}</div>;
  }

  const getLink = (item)=>{
    switch (item.type) {
        case 'product':
            return `products/detail/${item.link}`
        case 'category':
            return `category/${item.link}`
        default:
           return item.external_link;
    }
  }

  return (
    <div className="container mx-auto ">
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
              <Link to={`/products/detail/${right_banner?.link}`} className="block h-full">
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
            <>
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
            </>
          }
        </div>
      </div>
      }

      <div className='my-5'>
        <h2 className="text-3xl font-bold">Best Selling</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <span className="text-sm md:text-base text-gray-600">
            Discover the latest trends with our Best Selling Products.
          </span>
          {!forRoute && !isLoading&&
              <Link
                to="/products/best-selling"
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



      {forRoute && 
        <div className='my-5'>
          <h2 className="text-3xl font-bold">Recomendent Products</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
              Discover the latest trends with our Best Selling Products.
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
  );
};

export default BestSelling;
