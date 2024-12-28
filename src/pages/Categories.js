import React, {useEffect, useRef} from 'react'
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {Loader} from '../components/common';
import {Link} from 'react-router-dom';
import {fetchFlashSaleCategories} from '../redux/slice/categorySlice';

const Categories = () => {
    const { isLoading, flash_sale:categories, error } = useSelector((state) => state.category);
    const dispatch = useDispatch();
    const scrollRef = useRef(null);
  
    useEffect(() => {
      dispatch(fetchFlashSaleCategories({page:1, page_size:12}));
    }, [dispatch]);
  
    if (isLoading) {
      return <div className='container h-20 flex justify-center'><Loader message='Loading Categories' /></div>
    }
  
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
  
    
  return (
    <div>
        <div className="container mx-auto my-8">
            <h2 className="text-3xl font-bold">Flash Sale Categories</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
                Discover the latest trends with Categories.
            </span>
            </div>
            <div className="relative">
           
    
            {/* Categories Container */}
            
            {categories.length === 0  ? <div className='text-center'>
                <span>Not found</span>
            </div>:

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                    <>
                    {/* Discount Badge */}
                    {category.has_discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                        {category.discount_amount}{category.discount_type == 'percentage'?'%':'৳'} OFF
                    </span>
                    )}
                    <Link to={`/products/category/${category.slug}`} key={category.id}>
                    <div className="relative group cursor-pointer min-w-[150px]">
                        <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-36 object-cover rounded-lg transition-transform transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-lg font-semibold">{category.name}</span>
                        </div>
                    </div>
                    </Link>
                    </>
                ))}
            </div>
            }
          
            </div>
        </div>
    </div>
  )
}

export default Categories;