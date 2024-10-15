import React from 'react';

const CategoriesSection = () => {
  const categories = [
    { name: 'Electronics', image: '/path-to-electronics.jpg', link: '/products?category=electronics' },
    { name: 'Clothing', image: '/path-to-clothing.jpg', link: '/products?category=clothing' },
    { name: 'Home Decor', image: '/path-to-home-decor.jpg', link: '/products?category=home-decor' },
    // Add more categories as needed
  ];

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Shop by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div key={category.name} className="relative group">
            <img src={category.image} alt={category.name} className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={category.link} className="text-white text-xl font-bold">{category.name}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
