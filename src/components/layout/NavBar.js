import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaHeart, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../redux/slice/authSlice';
import { selectCartCount } from '../../redux/slice/cartSlice';
import {Logout} from '../../redux/slice/authActions';
import SearchDropdown from '../common/SearchDropdown';

const Navbar = () => {
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  //const isAuthenticated = false; // Replace with actual authentication status
  const {isAuthenticated, accessToken, refreshToken} = useSelector((state)=>state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = useSelector(selectCartCount);
  const authRef = useRef(null);
  const profileRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
      const handleClickOutside = (event) => {
      if (authRef?.current && !authRef?.current.contains(event.target)) {
          setAuthMenuOpen(false);
      }
      if (profileRef?.current && !profileRef?.current.contains(event.target)) {
          setProfileMenuOpen(false);
      }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      };
      }, []);


  const toggleAuthMenu = () => setAuthMenuOpen(!authMenuOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);


  const handleLogout = () => {
    dispatch(Logout({access: accessToken, refresh: refreshToken}));
    setProfileMenuOpen(false);
    navigate('/'); // Redirect to home page after logout, or choose another route
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50">
      {/* Top Promo Bar */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <Link to="/deals">Flash Sale! Up to 50% Off Selected Items</Link>
      </div>

      <div className="container mx-auto px-4 py-1 flex justify-between items-center gap-2">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <Link to='/'>
            <img
              src={`${process.env.PUBLIC_URL}/static image/gocart-logo.svg`}
              alt="Website Logo"
              className="w-12 h-12 md:w-16 md:h-16 transition-shadow duration-300"
            />
          </Link>
          
          
        </div>

       

        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-3xl">
          <SearchDropdown />
        </div>


        {/* User Actions and Cart */}
        <div className="hidden md:flex items-center space-x-4">

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
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="text-gray-700 hover:text-blue-500">
            <FaHeart size={20} />
          </Link>

          {!isAuthenticated ? (
            <>
              {/* Authentication Dropdown for Unauthenticated Users */}
              <div className="relative" ref={authRef}>
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
              {/* Profile Dropdown for Authenticated Users */}
              <div className="relative" ref={profileRef}>
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
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition w-full"
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
      </div>
    </nav>
  );
};

export default Navbar;


