import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative bg-cover bg-center h-96" style={{ backgroundImage: "url('/path-to-your-hero-image.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-lg mb-8">Discover the latest trends and shop your favorite products.</p>
        <Link to="/products" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full">
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
