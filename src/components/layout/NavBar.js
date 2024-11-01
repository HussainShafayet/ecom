import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaHeart, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../redux/slice/authSlice';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { cartCount } = useCart(); // Get cart count from Cart Context
  //const isAuthenticated = false; // Replace with actual authentication status
  const {isAuthenticated} = useSelector((state)=>state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleAuthMenu = () => setAuthMenuOpen(!authMenuOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);


  const handleLogout = () => {
    dispatch(logoutUser());
    setProfileMenuOpen(false);
    navigate('/'); // Redirect to home page after logout, or choose another route
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50">
      {/* Top Promo Bar */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <Link to="/deals">Flash Sale! Up to 50% Off Selected Items</Link>
      </div>

      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <img
            src="https://img.freepik.com/premium-psd/engraved-black-logo-mockup_125540-223.jpg"
            alt="Website Logo"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full hover:shadow-lg transition-shadow duration-300"
          />
          <div className="flex flex-col items-start md:items-center">
            <span className="text-lg md:text-2xl font-bold tracking-wide">GoCart</span>
            <p className="text-xs font-light hidden sm:block md:-mt-1">Happy To Shopping</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-500 transition">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-blue-500 transition">Shop</Link>
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

        {/* User Actions and Cart */}
        <div className="flex items-center space-x-4">
          {/* Always Displayed Cart Icon */}
          <div className="relative">
            <Link to="/cart" className="text-gray-700 hover:text-blue-500">
              <FaShoppingCart size={20} />
            </Link>
            {cartCount > 0 && (
              <span className="absolute top-[-19px] right-[-18px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          {!isAuthenticated ? (
            <>
              {/* Authentication Dropdown for Unauthenticated Users */}
              <div className="relative">
                <button
                  onClick={toggleAuthMenu}
                  className="flex items-center text-gray-700 hover:text-blue-500 font-medium focus:outline-none"
                >
                  <FaUserPlus size={20} />
                  <span className="ml-1">Account</span>
                </button>
                {authMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-200 z-10">
                    <Link
                      to="/signin"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setAuthMenuOpen(false)}
                    >
                      <FaSignInAlt className="mr-2 text-blue-500" /> Sign In
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <Link
                      to="/signup"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setAuthMenuOpen(false)}
                    >
                      <FaUserPlus className="mr-2 text-green-500" /> Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Wishlist Icon */}
              <Link to="/wishlist" className="text-gray-700 hover:text-blue-500">
                <FaHeart size={20} />
              </Link>

              {/* Profile Dropdown for Authenticated Users */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="text-gray-700 hover:text-blue-500 focus:outline-none"
                >
                  <FaUser size={20} />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-lg border border-gray-200 z-10 overflow-hidden">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FaUser className="mr-2 text-blue-500" /> Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FaHeart className="mr-2 text-pink-500" /> Wishlist
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                      onClick={handleLogout}
                    >
                      <FaSignInAlt className="mr-2 text-red-500" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
            <Link to="/cart" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
              Cart
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/signin" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
                  Wishlist
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-500" onClick={toggleMenu}>
                  Profile
                </Link>
                <button className="text-gray-700 hover:text-blue-500" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
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


