import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categoryService'; // Assume you have a service to fetch categories

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(); // Fetch categories from the API
        setCategories(data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        setError('Failed to load categories');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Shop by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <Link to={`/products?category=${category.slug}`} key={Math.ceil(Math.random()*1000)}>
            <div className="relative group cursor-pointer">
              {/* Category Image */}
              <img
                src={'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                alt={category.name}
                className="w-full h-48 object-cover rounded-lg transition-transform transform group-hover:scale-105"
              />
              {/* Overlay with Category Name */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xl font-bold">{category.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
