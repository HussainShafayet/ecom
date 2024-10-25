import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
//import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard, Sidebar} from '../components/common';  // Reusable ProductCard component
import { FaHome, FaMobileAlt,FaTshirt, FaCouch, FaGamepad } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../redux/slice/productSlice';

const Products = () => {
  const {isLoading, products, error} = useSelector((state)=> state.product)
  const {category} = useParams();

  
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    if (category) {
      dispatch(fetchAllProducts({category: category, limit: 30}))
    } else {
      dispatch(fetchAllProducts({limit:30}));
    }
  }, [dispatch, category]);  // Fetch new products whenever the query parameter changes

  if (isLoading) {
    return <div className="text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4">
  
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

      {/* Product List Section (Right) */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </div>
  );
};

export default Products;
