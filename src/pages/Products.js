import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getProductsByCategory } from '../services/productService';  // Service to fetch products by category
import {ProductCard} from '../components/common';  // Reusable ProductCard component

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
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;
