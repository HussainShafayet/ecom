import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCategories } from '../../redux/slice/categorySlice';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {Loader} from '../common';
import CategorySectionSkeleton from '../common/skeleton/CategorySectionSkeleton';

const CategoriesSection = () => {
  const { isLoading, categories, error } = useSelector((state) => state.category);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["categories"]);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllCategories({page:1, page_size:12}));
  }, [dispatch]);

  if (sectionError) {
    return <div className="text-center text-red-500 font-semibold py-4">
      {sectionError} - Please try again later.
    </div>;
  }

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      top: 0,
      left: -250,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      top: 0,
      left: 250,
      behavior: 'smooth',
    });
  };

  return (
    <>
    {isLoading ? <CategorySectionSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :
      <>
      {categories?.length != 0  &&
      <div className="container mx-auto my-8">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <span className="text-sm md:text-base text-gray-600">
            Discover the latest trends with Categories.
          </span>
          <Link
            to="/categories"
            className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
            target='_blank'
          >
            View All
          </Link>
        </div>
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white h-20 w-8 rounded-sm shadow-lg hover:scale-105 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FaChevronLeft size={30} />
          </button>

          {/* Categories Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 py-2 scrollbar-custom"
          >
            {categories &&
              categories?.map((category) => (
                <div key={category.id}>
                {/* Discount Badge */}
                {category.has_discount && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                    {category.discount_amount}{category.discount_type == 'percentage'?'%':'৳'} OFF
                  </span>
                )}
                <Link to={`/products/?category=${category.slug}`} target='_blank'>
                  <div className="relative cursor-pointer min-w-[150px] hover:scale-95 transition-transform transform">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-lg font-semibold">{category.name}</span>
                    </div>
                  </div>
                </Link>
                </div>
              ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white h-20 w-8 rounded-sm shadow-lg hover:scale-105 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FaChevronRight size={30} />
          </button>
        </div>
      </div>
      }
      </>
    }
    </>
  );
};

export default CategoriesSection;


