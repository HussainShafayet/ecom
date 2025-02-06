import React, { useEffect, useState } from "react";
import {ErrorDisplay, Loader, SuccessMessage} from "../../components/common";
import {useDispatch, useSelector} from "react-redux";
import {clearSignupState, clearVerifyOtpState, resendOtp, verifyOtp} from "../../redux/slice/authSlice";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const { verifyOtpLoading, verifyOtpMessage, verifyOtpError, signinMessage,isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems} = useSelector((state) => state.cart);
  const { items } = useSelector((state) => state.wishList);
  const { user_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation().state?.from || '/';

   //set local cart items
   const setLocalCart = () => {
    const localCartItems = cartItems || [];
    return localCartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        variant_id: item.variant_id,
    }));
  };
   //set local favorite items
   const setLocalFavorite = () => {
    const localWishItems = items || [];
    return localWishItems.map(item => ({
        product_id: item.id,
    }));
  };  
  const [formData, setFormData] = useState({ user_id: user_id, otp: "", "cart": setLocalCart(),
    "favorite": setLocalFavorite() });
  const [errors, setErrors] = useState({});

    useEffect(() => {
        //isAuthenticated && navigate(location, { replace: true })
        if (isAuthenticated) {
          //navigate(from, { replace: true }); // Redirect to previous page if already authenticated
          dispatch(clearVerifyOtpState());
          navigate(location, { replace: true });
        }
      }, [verifyOtpMessage, isAuthenticated]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.user_id) errors.user_id = "User ID is required.";
    if (!formData.otp) errors.otp = "OTP is required.";
    else if (!/^\d{6}$/.test(formData.otp)) errors.otp = "OTP must be a 6-digit number.";
    return errors;
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    // Simulate an API call
    //console.log("Form submitted:", formData);
    dispatch(verifyOtp(formData));
   
  };

  //handle resend otp
  const handleResendOtp = (e) =>{
    e.preventDefault();
    //console.log(formData.user_id);
    dispatch(resendOtp({user_id:formData.user_id}));
  }

  

  return (
    <div className="max-w-sm mx-auto mt-12 p-6 border rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Verify OTP</h1>

      {/*Error message*/}
      <ErrorDisplay errors={verifyOtpError} />
      {/* Success Message */}
      <SuccessMessage message={verifyOtpMessage||signinMessage} />
      
      <form onSubmit={handleSubmit}>
        {/* OTP Field */}
        <div className="">
          <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
            OTP
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            maxLength="6"
            className={`w-full px-3 py-2 border rounded focus:outline-none ${
              errors.otp ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
        </div>
        <div className="text-end mb-4">
            <span className="text-blue-500 hover:text-blue-600 underline transition-all cursor-pointer" onClick={handleResendOtp}>Resend OTP</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          disabled={verifyOtpLoading}
        >
            {verifyOtpLoading ? <Loader /> : 
            'Verify OTP'
            }
          
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
