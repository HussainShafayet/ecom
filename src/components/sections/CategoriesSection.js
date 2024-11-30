import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCategories } from '../../redux/slice/categorySlice';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {Loader} from '../common';

const CategoriesSection = () => {
  const { isLoading, categories, error } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  if (isLoading) {
    return <div className='container h-20 flex justify-center'><Loader message='Loading Categories' /></div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
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
    <div className="container mx-auto my-8">
      <h2 className="text-3xl font-bold">Shop by Category</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Discover the latest trends with Categories.
        </span>
        <Link
          to="/products"
          className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
        >
          View All
        </Link>
      </div>
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white p-3 h-20 w-8 rounded-sm shadow-lg hover:scale-105 transition-transform z-10"
        >
          <FaChevronLeft size={16} />
        </button>

        {/* Categories Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 py-2 scrollbar-custom"
        >
          {categories &&
            categories.map((category) => (
              <Link to={`/products/category/${category.slug}`} key={category.id}>
                <div className="relative group cursor-pointer min-w-[150px]">
                  <img
                    src={'https://images.freeimages.com/images/large-previews/d4f/www-1242368.jpg?fmt=webp&h=250'}
                    alt={category.name}
                    className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-lg font-semibold">{category.name}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-600 text-white p-3 h-20 w-8 rounded-sm shadow-lg hover:scale-105 transition-transform z-10"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CategoriesSection;


