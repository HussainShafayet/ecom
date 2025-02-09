import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import {Breadcrum, Loader, ProductCard, Sidebar} from '../components/common';  // Reusable ProductCard component

import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts, setIsSidebarOpen, setSortType} from '../redux/slice/productSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import {FaArrowDown, FaArrowUp, FaFilter, FaFlag} from 'react-icons/fa';
import {ProductsPageSkeleton} from '../components/common/skeleton';

const Products = ({scrollContainerRef}) => {
  //
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items: products, isLoading, error, hasMore, isSidebarOpen, sortType } = useSelector((state) => state.product);
  
  //get lastpath
  const location = useLocation();
  // Split the pathname and filter out empty strings
  const pathParts = location.pathname.split('/').filter(part => part);
  // Get the last part of the path
  const lastPathSegment = pathParts[pathParts.length - 1] || 'Products'; //end last path


  const sortOptions = ['', 'price', '-price', 'discount_price', '-discount_price', 'rating', '-rating']; // Define sort option

  // Initialize page and limit from searchParams
  const [page, setPage] = useState(parseInt(searchParams.get('page') || 1));
  const [page_size, setPage_Size] = useState(parseInt(searchParams.get('page_size') || 30)); // Default limit of 30
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '');

  
  // First useEffect: Reset values if URL parameters are missing
  useEffect(() => {
    if (!searchParams.has('page')) setPage(1);
    if (!searchParams.has('page_size')) setPage_Size(30);
  }, [searchParams]);

  useEffect(() => {
    const category = searchParams.get("category");

    const brandsParam = searchParams.get("brands");
    const brands = brandsParam ? brandsParam.split(",") : [];

    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : [];

    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");

    const sizesParam = searchParams.get("sizes");
    const sizes = sizesParam ? sizesParam.split(",") : [];

    const colorsParam = searchParams.get("colors");
    const colors = colorsParam ? colorsParam.split(",") : [];

    const discount_type = searchParams.get("discount_type");
    const discount_value = searchParams.get("discount_value");
    const search = searchParams.get('search');

    dispatch(fetchAllProducts({page_size, ordering, page,category, brands,tags, min_price, max_price, sizes, colors, discount_type, discount_value,search}));
    
    
  }, [dispatch,searchParams]);  // Fetch new products whenever the query parameter changes
  
  const fetchMoreProducts = () => {
    const nextPage = page + 1;
    //const nextSkip = skip + limit;
    setPage(nextPage);
    //setSkip(nextSkip);
    // Update searchParams to include the new page, keeping existing params
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: nextPage,
      page_size, // Ensure limit stays the same
      //skip: nextSkip,
    });
  };

 
  const toggleSortType = () => {
    // Cycle through sort options on each button click
    const currentIndex = sortOptions.indexOf(sortType);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    const nextSortType = sortOptions[nextIndex];
    dispatch(setSortType(nextSortType));
    handleSortChange({ target: { value: nextSortType } });
  };

  const handleSortChange = (e) => {

    const selectedSort = e.target.value;
    setOrdering(selectedSort);
  
    // Start with all existing search params
      const updatedParams = { ...Object.fromEntries(searchParams)};
    
  
    // Conditionally set 'order' if it differs from the default
    if (selectedSort !== '') {
      //updatedParams.sortBy = 'price';
      updatedParams.ordering = selectedSort;
    } else {
      
      //delete updatedParams.sortBy;
      delete updatedParams.ordering;
    }
    
    // Update search params in the URL
    setSearchParams(updatedParams);
    
  };
  
  const handleItemsToShowChange = (e) => {
    const itemShow = parseInt(e.target.value);
    
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    
    setPage_Size(itemShow);
    setPage(1); // Reset page to 1 for the new limit
      setSearchParams({ ...Object.fromEntries(searchParams), page_size: itemShow, page: 1 })

  };

  const handleSidebarOpen = (value)=>{
    dispatch(setIsSidebarOpen(value));
  }

  return (
    <div className="min-h-screen">


    {/* Responsive Breadcrumb Path */}
      <Breadcrum />


      

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => handleSidebarOpen(false)}
        ></div>
      )}

      <div className="mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar (Sliding from below the Navbar on mobile) */}
        <div
          className={`lg:col-span-1 fixed lg:sticky top-0 left-0 h-full bg-white z-20 transform ${
            isSidebarOpen ? 'translate-x-0 mt-[100px]' : '-translate-x-full'
          } transition-transform duration-300 lg:translate-x-0`}
        >
          <Sidebar onClose={() => handleSidebarOpen(false)} />
        </div>
      

        <div className='lg:col-span-4'>
        
        
        {isLoading ? <ProductsPageSkeleton /> :
          error ? (
          <div className="text-center text-red-500 font-semibold py-4">
            {error} - Please try again later.
          </div>
        ) :
        <>
          {/* Sort and Show Items Options Above Product List */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            {/* Mobile Toggle Button for Sidebar */}
            {/*<button
                onClick={() => handleSidebarOpen(true)}
                className="block lg:hidden bg-blue-500 text-white py-1 px-2 rounded-lg z-10 relative"
              >
              Show Filters
            </button>*/}
            <FaFilter className="block lg:hidden ml-2  z-10 relative" onClick={() => handleSidebarOpen(true)}/>

            <div> 
              <h1 className="hidden md:block text-2xl font-bold capitalize">{lastPathSegment.replace(/-/g, ' ')}</h1>
            </div>

            <div className='flex space-x-2'>
              {/* Show Items Dropdown */}
              <div className="flex items-center">
                <span className="hidden sm:block text-gray-600 font-medium mr-2">Show</span>
                <select
                  value={page_size}
                  onChange={handleItemsToShowChange}
                  className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={90}>90</option>
                  <option value={120}>120</option>
                </select>
              </div>
              {/* Sort Type Toggle for Mobile and Default Dropdown for Desktop */}
              {/*<div className="sm:hidden">
                <button
                  onClick={toggleSortType}
                  className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  {sortType === '' ? 'Default' : sortType === 'asc' ?
                  <div className='flex flex-nowrap items-center'>
                    <span>Price</span>
                    <FaArrowDown className="text-blue-500 ml-1" /> 
                  </div>
                  : 
                  <div className='flex flex-nowrap items-center'>
                    <span>Price</span>
                    <FaArrowUp className="text-blue-500 ml-1" /> 
                  </div>
                  }
                </button>
              </div>*/}

              {/* Sort by Amount Dropdown */}
              <div className="sm:flex items-center">
                <span className="hidden sm:block text-gray-600 font-medium mr-2 text-nowrap">Sort by:</span>
                <select
                  value={ordering}
                  onChange={handleSortChange}
                  className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">Default</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="discount_price">Discount Price: Low to High</option>
                  <option value="-discount_price">Discount Price: High to Low</option>
                  <option value="rating">Rating: Low to High</option>
                  <option value="-rating">Rating: High to Low</option>
                </select>
              </div>

            </div>
          </div>



          {/* Product List Section (Right) */}

          <InfiniteScroll
              dataLength={products.length}
              next={fetchMoreProducts}
              hasMore={hasMore}
              loader={<div className="text-center">Loading more products...</div>}
              endMessage={<div className="text-center my-4">No more products</div>}
              scrollableTarget={scrollContainerRef.current} // Set the scrollable target
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
          </InfiniteScroll>
          </>
          }
        </div>
      </div>
  </div>
  );
};

export default Products;
