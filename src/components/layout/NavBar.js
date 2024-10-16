import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaHeart } from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50">
      {/* Top Promo Bar */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <Link to="/deals">Flash Sale! Up to 50% Off Selected Items</Link>
      </div>

      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <Link to="/">eShop</Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-500 transition">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-blue-500 transition">
            Shop
          </Link>
          <Link to="/deals" className="text-gray-700 hover:text-blue-500 transition">
            Deals
          </Link>
          <Link to="/new-arrivals" className="text-gray-700 hover:text-blue-500 transition">
            New Arrivals
          </Link>
          <Link to="/best-sellers" className="text-gray-700 hover:text-blue-500 transition">
            Best Sellers
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-blue-500 transition"
          />
          <button className="ml-2 text-gray-500 hover:text-blue-500">
            <FaSearch />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Link to="/wishlist" className="text-gray-700 hover:text-blue-500">
            <FaHeart size={20} />
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-blue-500">
            <FaUser size={20} />
          </Link>
          <Link to="/cart" className="text-gray-700 hover:text-blue-500">
            <FaShoppingCart size={20} />
          </Link>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 hover:text-blue-500">
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-300">
          <div className="flex flex-col space-y-4 px-4 py-2">
            <Link to="/" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              Shop
            </Link>
            <Link to="/deals" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              Deals
            </Link>
            <Link to="/new-arrivals" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              New Arrivals
            </Link>
            <Link to="/best-sellers" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              Best Sellers
            </Link>

            {/* Mobile Search Bar */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-blue-500 w-full"
              />
              <button className="ml-2 text-gray-500 hover:text-blue-500">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
