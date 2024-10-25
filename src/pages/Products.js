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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


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
    <div className="min-h-screen bg-gray-100 p-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Section (Left) */}
      <div className="lg:col-span-1">
        <Sidebar />
      </div>

      {/* Product List Section (Right) */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </div>
  );
};

export default Products;
