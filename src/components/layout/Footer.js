import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaApple, FaGooglePlay } from 'react-icons/fa';
import {useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

const Footer = () => {
  const {isAuthenticated} = useSelector((state)=> state.auth);
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Newsletter Section */}
        {/*<div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg p-6 mb-8 text-center text-gray-100 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Stay Updated with Our Latest Offers!</h2>
          <p className="text-gray-200 mb-4">Subscribe to our newsletter and receive exclusive deals right in your inbox.</p>
          <form className="flex justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-l-md focus:outline-none text-gray-700"
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-r-md transition-all">
              <FaEnvelope />
            </button>
          </form>
        </div>*/}

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="aboutus" className="hover:text-gray-100 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gray-100 transition">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {/*<li><Link to="/contact" className="hover:text-gray-100 transition">Support Center</Link></li>*/}
              <li><Link to="/faq" className="hover:text-gray-100 transition">FAQ</Link></li>
            </ul>
          </div>
          
          {/* My Account */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">My Account</h3>
            <ul className="space-y-2">
              {isAuthenticated? 
                <li><Link to="/profile" className="hover:text-gray-100 transition">Profile</Link></li>
              :
              <li><Link to="/signin" className="hover:text-gray-100 transition">Sign In</Link></li>
              }
              {/*<li><Link to="/order-tracking" className="hover:text-gray-100 transition">Order Tracking</Link></li>*/}
              <li><Link to="/wishlist" className="hover:text-gray-100 transition">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-gray-100 transition">Shopping Cart</Link></li>
            </ul>
          </div>
          
          {/* Download and Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stay Connected</h3>
            <div className="flex gap-4 text-gray-400 mb-4">
              <a href="#" className="hover:text-gray-100 transition"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-gray-100 transition"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-gray-100 transition"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-gray-100 transition"><FaLinkedin size={20} /></a>
            </div>
            {/*<p className="text-gray-200 mb-2">Download Our App</p>
            <div className="flex gap-3">
              <a href="#" className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-100 transition">
                <FaApple className="mr-2" /> App Store
              </a>
              <a href="#" className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-100 transition">
                <FaGooglePlay className="mr-2" /> Google Play
              </a>
            </div>*/}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-sm text-gray-400 text-center">
          <p>&copy; {new Date().getFullYear()} Your E-Commerce Site. All rights reserved.</p>
          <p className="mt-2">
            <a href="/privacy-policy" className="hover:text-gray-100 mx-2">Privacy Policy</a>|
            <a href="#" className="hover:text-gray-100 mx-2">Terms of Service</a>|
            <a href="#" className="hover:text-gray-100 mx-2">Cookies</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

