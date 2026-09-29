import {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux';
import {ContentLink, Slider} from '../components/common';
import {Link} from 'react-router-dom';
import {fetchFlashSaleCategories, fetchNewArrivalCategories, fetchBestSellingCategories, fetchFeaturedCategories} from '../redux/slice/categorySlice';
import {fetchCategoriesContent} from '../redux/slice/contentSlice';
import blurImage from '../assets/images/blur.jpg';
import {HeroSectionSkeleton, SectionSkeleton} from '../components/common/skeleton';
import {SectionError} from '../components/common';
import {discountLabel} from '../utils/formatPrice';

const Categories = () => {
    const { flash_sale_loading,new_arrival_loading,best_selling_loading,featured_loading,flash_sale, new_arrival, best_selling,featured, flash_sale_error,new_arrival_error,best_selling_error,featured_error } = useSelector((state) => state.category);
    const {isLoading, image_sliders, right_banner, error} = useSelector((state)=> state.content);
    const dispatch = useDispatch();
    const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if the image has loaded
  
    useEffect(() => {
      dispatch(fetchCategoriesContent());
      dispatch(fetchFlashSaleCategories({page:1, page_size:12}));
      dispatch(fetchNewArrivalCategories({page:1, page_size:12}));
      dispatch(fetchBestSellingCategories({page:1, page_size:12}));
      dispatch(fetchFeaturedCategories({page:1, page_size:12}));
    }, [dispatch]);
  
    //if (isLoading) {
    //  return <div className='container h-20 flex justify-center'><Loader message='Loading Categories' /></div>
    //}
  
    //if (error) {
    //  return <div className="text-center text-red-500">{error}</div>;
    //}

  return (
    <div>

        {isLoading ? <HeroSectionSkeleton /> :
        error ? (
        <SectionError message={error} />
        ) :
        
        <div className="flex flex-col lg:flex-row gap-4 min-h-[30vh] lg:max-h-[40vh]">
            {/*image slider*/}
            <div className="lg:w-4/6 w-full flex">
                <Slider image_sliders={image_sliders} />
            </div>
    
            <div className="lg:w-2/6 gap-4 w-full  flex flex-col">
            {right_banner?.media_type === 'image' &&
                <>
                {/* Product Image */}
                <ContentLink item={right_banner} className="block h-full">
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
                </ContentLink>
                </>
            }
            {right_banner?.media_type === 'video' && 
                <div className='relative h-full'>
                <ContentLink item={right_banner} className='absolute right-2 top-2 z-10 text-blue-500 hover:underline text:2x'>{right_banner?.caption?right_banner?.caption :'Click'}</ContentLink>
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

        {/*flash sale*/}
         {flash_sale_loading ? <SectionSkeleton /> :
              flash_sale_error ? (
              <SectionError message={flash_sale_error} />
            ) :
            <div className="container mx-auto my-8">
                <h2 className="text-3xl font-bold">Flash Sale Categories</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <span className="text-sm md:text-base text-gray-600">
                    Discover the latest trends with Categories.
                </span>
                </div>
                <div className="relative">
            
        
                {/* Categories Container */}
                
                {flash_sale.length === 0  ? <div className='text-center'>
                    <span>Not found</span>
                </div>:

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {flash_sale?.map((category) => (
                        <>
                        {/* Discount Badge */}
                        {category?.has_discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                            {discountLabel(category?.discount_amount, category?.discount_type)}
                        </span>
                        )}
                        <Link to={`/products/?category=${category?.slug}`} key={category?.id}>
                        <div className="relative group cursor-pointer min-w-[150px]">
                            <img
                            src={category?.image}
                            alt={category?.name}
                            className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-lg font-semibold">{category?.name}</span>
                            </div>
                        </div>
                        </Link>
                        </>
                    ))}
                </div>
                }
            
                </div>
            </div>
         }

        {/*New Arrival*/}
         {new_arrival_loading ? <HeroSectionSkeleton /> :
              new_arrival_error ? (
              <SectionError message={new_arrival_error} />
            ) :
        <div className="container mx-auto my-8">
            <h2 className="text-3xl font-bold">New Arrival Categories</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
                Discover the latest trends with Categories.
            </span>
            </div>
            <div className="relative">
           
    
            {/* Categories Container */}
            
            {new_arrival?.length === 0  ? <div className='text-center'>
                <span>Not found</span>
            </div>:

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {new_arrival?.map((category) => (
                    <>
                    {/* Discount Badge */}
                    {category?.has_discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                        {discountLabel(category?.discount_amount, category?.discount_type)}
                    </span>
                    )}
                    <Link to={`/products/?category=${category?.slug}`} key={category?.id}>
                    <div className="relative group cursor-pointer min-w-[150px]">
                        <img
                        src={category?.image}
                        alt={category?.name}
                        className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-lg font-semibold">{category?.name}</span>
                        </div>
                    </div>
                    </Link>
                    </>
                ))}
            </div>
            }
          
            </div>
        </div>
         }

        {/*Best Selling*/}
         {best_selling_loading ? <HeroSectionSkeleton /> :
              best_selling_error ? (
              <SectionError message={best_selling_error} />
            ) :
        <div className="container mx-auto my-8">
            <h2 className="text-3xl font-bold">Best Selling Categories</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
                Discover the latest trends with Categories.
            </span>
            </div>
            <div className="relative">
           
    
            {/* Categories Container */}
            
            {best_selling?.length === 0  ? <div className='text-center'>
                <span>Not found</span>
            </div>:

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {best_selling?.map((category) => (
                    <>
                    {/* Discount Badge */}
                    {category?.has_discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                        {discountLabel(category?.discount_amount, category?.discount_type)}
                    </span>
                    )}
                    <Link to={`/products/?category=${category?.slug}`} key={category?.id}>
                    <div className="relative group cursor-pointer min-w-[150px]">
                        <img
                        src={category?.image}
                        alt={category?.name}
                        className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-lg font-semibold">{category?.name}</span>
                        </div>
                    </div>
                    </Link>
                    </>
                ))}
            </div>
            }
          
            </div>
        </div>
         }

        {/*Featrued*/}
         {featured_loading ? <SectionSkeleton /> :
              featured_error ? (
              <SectionError message={featured_error} />
            ) :
            <div className="container mx-auto my-8">
                <h2 className="text-3xl font-bold">Best Featured Categories</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <span className="text-sm md:text-base text-gray-600">
                    Discover the latest trends with Categories.
                </span>
                </div>
                <div className="relative">
            
        
                {/* Categories Container */}
                
                {featured?.length === 0  ? <div className='text-center'>
                    <span>Not found</span>
                </div>:

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {featured?.map((category) => (
                        <div key={category?.id}>
                        {/* Discount Badge */}
                        {category?.has_discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                            {discountLabel(category?.discount_amount, category?.discount_type)}
                        </span>
                        )}
                        <Link to={`/products/?category=${category?.slug}`}>
                        <div className="relative group cursor-pointer min-w-[150px]">
                            <img
                            src={category?.image}
                            alt={category?.name}
                            className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-lg font-semibold">{category?.name}</span>
                            </div>
                        </div>
                        </Link>
                        </div>
                    ))}
                </div>
                }
            
                </div>
            </div>
         }
    </div>
  )
}

export default Categories;