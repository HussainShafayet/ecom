import React, { useState } from 'react';
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaPhone, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleEmail = (e) => {
    const value = e.target.value;
  };

  const handlePhone = (e) => {
    const value = e.target.value;
  };


  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordMatch(newPassword === confirmPassword);
    setPasswordStrength(newPassword.length >= 6);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(newConfirmPassword === password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-6 relative overflow-hidden">
      {/* Background Animated Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-30 animate-pulse"></div>
      
      {/* Decorative Circles */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-pink-300 opacity-20 rounded-full blur-3xl"></div>

      {/* Form Container */}
      <div
        className="relative z-10 w-full max-w-lg p-8 bg-white bg-opacity-80 rounded-2xl shadow-2xl backdrop-blur-lg"
      >
        {/* Title with Sign-In Redirect */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center text-blue-700">Create Account</h2>
          <Link
            to="/signin"
            className="text-sm text-gray-500 underline hover:text-blue-600 transition"
          >
            Already a member?
          </Link>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Full Name</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
            <FaUser className="text-gray-400 m-3" title="Full Name" />
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
          
          <FaPhone className="text-gray-400 m-3" title="Phone" />

            {/* Country Code Selector */}
            <select
              id="country-code"
              className="bg-gray-100 text-gray-700 font-medium px-3 py-2 border-r border-gray-300 focus:outline-none rounded-l-md"
              defaultValue="+880"
            >
              <option value="+880" selected>+880</option>
            </select>
            
            {/* Phone Number Input */}
            <input
              type="number"
              id="phone"
              placeholder="Enter your phone number"
              onInput={handlePhone}
              className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              required
            />
          </div>
        </div>


        {/* Email  */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Addressr</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
            <FaEnvelope className="text-gray-400 m-3" title="Email" />
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              onInput={handleEmail}
              className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              required
            />
          </div>
        </div>

         

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
            <FaLock className="text-gray-400 m-3" title="Password" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="px-3 text-gray-500 hover:text-blue-600 transition focus:outline-none"
              title={isPasswordVisible ? "Hide Password" : "Show Password"}
            >
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>


          
          {/* Password Requirements */}
          <p style={{display: 'flex'}} className={`text-xs  mt-2 ${passwordStrength ? "text-green-600" : "text-gray-500"}`}>
            {passwordStrength && <span className='mr-1'> <FaCheck /> </span>} Minimum 6 characters
            
          </p>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">Confirm Password</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
            <FaLock className="text-gray-400 m-3" title="Confirm Password" />
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="px-3 text-gray-500 hover:text-blue-600 transition focus:outline-none"
              title={isConfirmPasswordVisible ? "Hide Password" : "Show Password"}
            >
              {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {/* Confirm Password Match */}
          {!passwordMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Sign Up Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="w-full border-gray-300" />
          <span className="px-4 w-full text-center text-gray-500 text-sm">or sign up with</span>
          <hr className="w-full border-gray-300" />
        </div>

        {/* Social Media Sign-Up */}
        <div className="flex justify-center space-x-4">
          <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md">
            <FaFacebook className="text-white text-lg" />
          </button>
          <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200 shadow-md">
            <FaGoogle className="text-white text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;



