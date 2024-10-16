import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard} from '../components/common';  // Reusable ProductCard component
import { FaHome, FaMobileAlt,FaTshirt, FaCouch, FaGamepad } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Function to get the category query parameter from the URL
  const getCategoryFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';  // Default to 'all' if no category is selected
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const category = getCategoryFromQuery();
      setLoading(true);
      try {
        const data = await getProductsByCategory(category);  // Fetch products based on the category
      
        setProducts(data.products);
        setLoading(false);
      } catch (error) {
        setError('Failed to load products');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);  // Fetch new products whenever the query parameter changes

  if (loading) {
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
          <Link to="/products?category=all" className="hover:text-blue-600 transition">All Products</Link>
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
          <Link to="/products?category=home-decor" className="hover:text-blue-600 transition">Home Decor</Link>
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  </div>
  );
};

export default Products;
