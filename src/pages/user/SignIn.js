import React, { useEffect, useState } from 'react';
import { FaFacebook, FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaPhoneAlt, FaPhone } from 'react-icons/fa';
import {ErrorDisplay, Loader} from '../../components/common';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {clearSigninState, signInUser} from '../../redux/slice/authSlice';

const SignIn = () => {
   const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {signinLoading, signinMessage, signinError,token, isAuthenticated } = useSelector((state) => state.auth);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["sign-in"]);
  const [formData, setFormData] = useState({ phone_number: '', country_code: '+880' });



  // Get the previous location from location.state
  const from = location.state?.from?.pathname || '/';



  useEffect(() => {
    isAuthenticated && navigate('/');

    if (signinMessage) {
      // Redirect to the sign-in page after a successful signup
      navigate(`/verify-otp/${token}`);
      // Optionally clear the signup state
      dispatch(clearSigninState());
    }
  }, [signinMessage, isAuthenticated]);

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

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "phone_number":
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

  const handleLogin = (e) => {
    e.preventDefault();
  
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      const credential = {
        phone_number: formData.country_code+formData.phone_number,
        expiresInMins: 1,
      }
      
      dispatch(signInUser(credential));
      //navigate(from, { replace: true });
      
    } else {
      setErrors(validationErrors);
    }
    
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:justify-center min-h-screen bg-gradient-to-r to-slate-400 from-slate-50 relative overflow-hidden p-4">
      {/* Left Side - Image or Brand Message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-cover bg-center p-6 lg:p-10" style={{ backgroundImage: `url(https://cdn-icons-png.flaticon.com/512/1804/1804486.png)` }}>
        <div className="bg-black bg-opacity-60 p-6 md:p-8 rounded-lg max-w-lg text-center">
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3 md:mb-4">Welcome to Our Store</h2>
          <p className="text-white text-base md:text-lg">Discover the best products with exclusive offers. Log in to explore!</p>
        </div>
      </div>

      {/* Right Side - Login Form with Glassmorphism */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-9">
        <div className="bg-white bg-opacity-30 backdrop-blur-lg shadow-md rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-lg">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-6 md:mb-8">Sign In</h2>

          {Array.isArray(signinError) ? 
          <ErrorDisplay errors={signinError} /> :
            <>
              {sectionError && <div className="text-center text-red-500 font-semibold py-4">
              {sectionError}.
            </div>}
            </>
          }

          {/* Phone Number */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
              <select
                id="country-code"
                className="bg-gray-100 text-gray-700 font-medium px-2 sm:px-3 py-2 border-r border-gray-300 focus:outline-none rounded-l-md"
                defaultValue="+880"
              >
                <option value="+880">+880</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border-none focus:outline-none rounded-r-md"
                required

              />
            </div>
            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
          </div>

          {/* Login Button with Animation */}
          <button
            onClick={handleLogin}
            disabled={signinLoading}
            className={`w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform duration-200 ${
              signinLoading ? 'cursor-wait' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {signinLoading ? <Loader message="Signing In" /> : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">or</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Social Media Buttons */}
          <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
            <button className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200 shadow-md">
              <FaFacebook className="text-white text-lg" />
            </button>
            <button className="w-10 sm:w-12 h-10 sm:h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200 shadow-md">
              <FaGoogle className="text-white text-lg" />
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-700 text-sm">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-800 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
};

export default SignIn;




