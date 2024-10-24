import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
//import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard} from '../components/common';  // Reusable ProductCard component
import { FaHome, FaMobileAlt,FaTshirt, FaCouch, FaGamepad } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../redux/slice/productSlice';

const Products = () => {
  const {isLoading, products, error} = useSelector((state)=> state.product)
  const {category} = useParams();

  
  const dispatch = useDispatch();


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
    <div className="flex  gap-4">

    {/* Enhanced Sidebar */}
    <aside className="bg-gray-200 p-4 w-full md:w-1/6 rounded-lg shadow-lg">
      <ul>
        <li className="flex items-center mb-2">
          <FaHome className="mr-2 text-blue-500" />
          <Link to="/products" className="hover:text-blue-600 transition">All Products</Link>
        </li>
        <li className="flex items-center mb-2">
          <FaMobileAlt className="mr-2 text-blue-500" />
          <Link to="/products?category=electronics" className="hover:text-blue-600 transition">Electronics</Link>
        </li>
        <li className="flex items-center mb-2">
          <FaTshirt className="mr-2 text-blue-500" />
          <Link to="/products?category=clothing" className="hover:text-blue-600 transition">Clothing</Link>
        </li>
        <li className="flex items-center mb-2">
          <FaCouch className="mr-2 text-blue-500" />
          <Link to="/products?category=furniture" className="hover:text-blue-600 transition">Home Decor</Link>
        </li>
        <li className="flex items-center mb-2">
          <FaGamepad className="mr-2 text-blue-500" />
          <Link to="/products?category=toys" className="hover:text-blue-600 transition">Toys</Link>
        </li>
      </ul>
    </aside>

    {/* Products Display Area */}
    <main className="w-full md:w-3/3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products && products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  </div>
  );
};

export default Products;
