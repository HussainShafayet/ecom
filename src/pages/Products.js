import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
//import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard, Sidebar} from '../components/common';  // Reusable ProductCard component

import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../redux/slice/productSlice';
import InfiniteScroll from 'react-infinite-scroll-component';

const Products = () => {
  const {category} = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const { items: products, isLoading, error, hasMore } = useSelector((state) => state.product);

  // Initialize page and limit from searchParams
  const [page, setPage] = useState(parseInt(searchParams.get('page') || 1));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || 30)); // Default limit of 30
  const [skip, setSkip] = useState(parseInt(searchParams.get('skip') || 0));

  // Extract necessary parameters from searchParams
  const sortBy = searchParams.get('sortBy');
  const order = searchParams.get('order');
  
  // First useEffect: Reset values if URL parameters are missing
  useEffect(() => {
    if (!searchParams.has('page')) setPage(1);
    if (!searchParams.has('limit')) setLimit(30);
    if (!searchParams.has('skip')) setSkip(0);
  }, [searchParams]);

  useEffect(() => {
   
    if (category) {
      dispatch(fetchAllProducts({category: category, limit, sortBy, order, page, skip}))
    } else {
      dispatch(fetchAllProducts({limit:limit, sortBy, order, page, skip}));
    }
    
  }, [dispatch,category, sortBy, order, page, limit, skip]);  // Fetch new products whenever the query parameter changes
  
  const fetchMoreProducts = () => {
    const nextPage = page + 1;
    const nextSkip = skip + limit;
    setPage(nextPage);
    setSkip(nextSkip);
    // Update searchParams to include the new page, keeping existing params
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: nextPage,
      limit, // Ensure limit stays the same
      skip: nextSkip,
    });
  };

  if (isLoading && page === 1) {
    return <div className='text-center'>Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }


  const handleSortChange = (e) => {
    //const selectedSort = e.target.value;
    //const limit = searchParams.get('limit');
    //setLimit(limit);
    //setPage(1); // Reset page to 1 for the new limit
    //setSkip(0);

    //if (limit) {
    //  setSearchParams({ ...Object.fromEntries(searchParams),limit, sortBy:'price' , order: selectedSort, page: 1, skip:0 })
    //}else{
    //  setSearchParams({ ...Object.fromEntries(searchParams), sortBy:'price' , order: selectedSort, page: 1, skip:0 })
    //}

    const selectedSort = e.target.value;
    const limit = searchParams.get('limit') || 30; // Use default limit if not in searchParams
  
    setLimit(limit);
    setPage(1); // Reset page to 1 for new sort
    setSkip(0);
  
    // Start with all existing search params
      const updatedParams = { ...Object.fromEntries(searchParams), limit, page: 1, skip: 0 };
    
  
    // Conditionally set 'order' if it differs from the default
    if (selectedSort !== '') {
      updatedParams.sortBy = 'price';
      updatedParams.order = selectedSort;
    } else {
      
      delete updatedParams.sortBy;
      delete updatedParams.order;
    }
    
    // Update search params in the URL
    setSearchParams(updatedParams);
    
  };
  
  const handleItemsToShowChange = (e) => {
    const itemShow = parseInt(e.target.value);
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    
    setLimit(itemShow);
    setPage(1); // Reset page to 1 for the new limit
    setSkip(0);
    
    if (sortBy && order) {
      setSearchParams({ ...Object.fromEntries(searchParams), limit: itemShow, sortBy:'price',order, page: 1, skip:0 })
    }else{
      setSearchParams({ ...Object.fromEntries(searchParams), limit: itemShow, page: 1, skip:0 })
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
                value={searchParams.get('limit') || 30}
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

         <InfiniteScroll
            dataLength={products.length}
            next={fetchMoreProducts}
            hasMore={hasMore}
            loader={<div className="text-center">Loading more products...</div>}
            endMessage={<div className="text-center my-4">No more products</div>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </InfiniteScroll>
        
      </div>
    </div>
  </div>
  );
};

export default Products;
