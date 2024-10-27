import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
//import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard, Sidebar} from '../components/common';  // Reusable ProductCard component
import { FaHome, FaMobileAlt,FaTshirt, FaCouch, FaGamepad, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../redux/slice/productSlice';

const Products = () => {
  const {isLoading, products, error} = useSelector((state)=> state.product)
  const {category} = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const sortBy = searchParams.get('sortBy');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const order = searchParams.get('order');
    console.log(category, 'category');
    
    if (category) {
      dispatch(fetchAllProducts({category: category, limit}))
    } else {
      dispatch(fetchAllProducts({limit:limit, sortBy, order}));
    }
  }, [dispatch, searchParams]);  // Fetch new products whenever the query parameter changes

  if (isLoading) {
    return <div className="text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    const limit = searchParams.get('limit');
    if (limit) {
      setSearchParams({limit, sortBy:'price' , order: selectedSort });
    }else{
      setSearchParams({sortBy:'price' , order: selectedSort });
    }
    
  };
  const handleItemsToShowChange = (e) => {
    const itemShow = e.target.value;
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    if (sortBy && order) {
      setSearchParams({limit: itemShow, sortBy:'price' , order, });
    }else{
      setSearchParams({limit:itemShow});
    }

  };

  return (
    <div className="min-h-screen">


    {/* Responsive Breadcrumb Path */}
    <div className="text-gray-600 text-xs sm:text-sm mb-4 truncate">
      <span className="text-blue-500 hover:underline cursor-pointer">Home</span>
      <span className="mx-1 hidden sm:inline"> &gt; </span>
      <span className="text-blue-500 hover:underline cursor-pointer mx-1 hidden sm:inline">Shop</span>
      <span className="mx-1 sm:hidden"> &gt; ... &gt; </span>
      <span className="text-gray-700 font-semibold">Products</span>
    </div>
  
      {/* Mobile Toggle Button for Sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="block lg:hidden bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 z-10 relative"
      >
      Show Filters
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar (Sliding from below the Navbar on mobile) */}
        <div
          className={`lg:col-span-1 fixed lg:sticky top-0 left-0 h-full bg-white z-20 transform ${
            isSidebarOpen ? 'translate-x-0 mt-[100px]' : '-translate-x-full'
          } transition-transform duration-300 lg:translate-x-0`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      

      <div className='lg:col-span-4'>
        {/* Sort and Show Items Options Above Product List */}
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className='flex flex-nowrap space-x-2'>
            {/* Show Items Dropdown */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">Show</span>
              <select
                value={searchParams.get('limit') || ''}
                onChange={handleItemsToShowChange}
                className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={120}>120</option>
              </select>
            </div>


            {/* Sort by Amount Dropdown */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">Sort by:</span>
              <select
                value={searchParams.get('order') || ''}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="">Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>

            </div>
          </div>



        {/* Product List Section (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Products;
