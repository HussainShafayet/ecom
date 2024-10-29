import React, { useState } from 'react';
import { FaFacebook, FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import {Loader} from '../../components/common';

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState('email');

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Simulate login loading
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-blue-600 relative overflow-hidden p-4">
      {/* Left Side with Image or Brand Message */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(https://cdn-icons-png.flaticon.com/512/1804/1804486.png)` }}>
        <div className="bg-black bg-opacity-60 p-10 rounded-lg max-w-sm text-center">
          <h2 className="text-white text-4xl font-extrabold mb-4">Welcome to Our Store</h2>
          <p className="text-white text-lg">Discover the best products with exclusive offers. Log in to explore!</p>
        </div>
      </div>

      {/* Right Side - Login Form with Glassmorphism */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="bg-white bg-opacity-30 backdrop-blur-lg shadow-lg rounded-2xl p-10 md:p-12 w-full max-w-md">
          {/* Logo or Title */}
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Sign In</h2>

          {/* Email or Phone Input with Icon Toggle */}
          <div className="mb-5">
            <label htmlFor="emailOrPhone" className="block text-gray-700 font-medium mb-1">
              Email or Phone
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              {inputType === 'email' ? (
                <FaEnvelope className="text-gray-500 m-3" />
              ) : (
                <FaPhoneAlt className="text-gray-500 m-3" />
              )}
              <input
                type={inputType}
                id="emailOrPhone"
                placeholder={`Enter your ${inputType === 'email' ? 'email' : 'phone number'}`}
                className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
                onFocus={() => setInputType('email')}
                onBlur={(e) => {
                  if (e.target.value && !e.target.value.includes('@')) setInputType('tel');
                }}
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Icon */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border-none focus:outline-none rounded-l-md"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="px-3 text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button with Loading Animation */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform duration-200 ${
              isLoading ? 'cursor-wait' : 'hover:scale-105'
            }`}
          >
            {isLoading ? (
              <Loader message="Signing In" />
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">or</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Social Media Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md">
              <FaFacebook className="text-white text-lg" />
            </button>
            <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200 shadow-md">
              <FaGoogle className="text-white text-lg" />
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-700 text-sm">
            Don’t have an account?{' '}
            <a href="#" className="text-blue-800 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;




