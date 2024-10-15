import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Ecom</Link>
        <div className="flex-grow mx-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 rounded-lg text-black"
          />
        </div>
        <div className="flex space-x-4">
          <Link to="/products" className="hover:text-gray-400">Products</Link>
          <Link to="/login" className="hover:text-gray-400">Login</Link>
          <Link to="/cart" className="hover:text-gray-400">Cart (2)</Link> {/* Sample cart count */}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
