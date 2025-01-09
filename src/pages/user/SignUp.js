import React, { useEffect, useState } from "react";
import {
  FaFacebook,
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaCheck,
} from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {clearSignupState, signUpUser} from "../../redux/slice/authSlice";
import {ErrorDisplay, Loader, SuccessMessage} from '../../components/common';

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {signupLoading, signupMessage, signupError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country_code: "+880",
    email: "",
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (signupMessage) {
      // Redirect to the sign-in page after a successful signup
      navigate('/signin');
      // Optionally clear the signup state
      dispatch(clearSignupState());
    }
  }, [signupMessage, dispatch, navigate]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        break;

      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^\+?(\d{10})$/.test(value)) {
          error = "Enter a valid phone number";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate the field and update the errors state
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      const regFormData = {
        "phone_number": formData.country_code+formData.phone,
        "email": formData.email,
        "name":  formData.name,
      }
      dispatch(signUpUser(regFormData));
      //console.log(loading, error);
      //setTimeout(() => {
      //  navigate(`/verify-otp`);
      //}, 3000);
      
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen  p-6 relative overflow-hidden">
      {/* Background Animated Pattern */}
      <div className="absolute inset-0 opacity-30 animate-pulse"></div>

      {/* Decorative Circles */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-pink-300 opacity-20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-lg p-8 bg-white bg-opacity-80 rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center text-blue-700">
            Create Account
          </h2>
          <Link
            to="/signin"
            className="text-sm text-gray-500 underline hover:text-blue-600 transition"
          >
            Already a member?
          </Link>
        </div>

        <SuccessMessage message={signupMessage} />
        <ErrorDisplay errors={signupError} />

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              <FaUser className="text-gray-400 m-3" title="Full Name" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              <FaPhone className="text-gray-400 m-3" title="Phone" />
              <select
                id="country-code"
                className="bg-gray-100 text-gray-700 font-medium px-3 py-2 border-r border-gray-300 focus:outline-none rounded-l-md"
                defaultValue="+880"
              >
                <option value="+880">+880</option>
              </select>
              <input
                type="number"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address (Optional)
            </label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              <FaEnvelope className="text-gray-400 m-3" title="Email" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border-none focus:outline-none rounded-r-md"
              />
            </div>
          </div>


          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
            disabled={signupLoading}
          >
            {signupLoading ? <Loader /> : 
            'Sign Up'
            }
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="w-full border-gray-300" />
          <span className="px-4 text-center text-gray-500 text-sm">or sign up with</span>
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
