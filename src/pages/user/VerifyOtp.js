import React, { useEffect, useState } from "react";
import {AuthLayout, ErrorDisplay, Field, OtpInput, SuccessMessage} from "../../components/common";
import {FaKey} from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {clearVerifyOtpState, resendOtp, verifyOtp} from "../../redux/slice/authSlice";
import {maskPhone} from "../../utils/phone";

// Seconds before another code can be asked for: the first was just sent, and a new one each time the button is pressed
export const RESEND_SECONDS = 30;

// The code page, phone first: the code as six boxes over one real input (`OtpInput`: the phone's number keypad and "fill in from
// SMS"), the number the code went to (its middle hidden), a resend button that counts down instead of being pressed ten times,
// and a way back if the number was wrong.
const VerifyOtp = () => {
  const dispatch = useDispatch();
  const { verifyOtpLoading, verifyOtpMessage, verifyOtpError, signinMessage,isAuthenticated } = useSelector((state) => state.auth);
  const verifyError = useSelector((state) => state.globalError.sectionErrors["verify-otp"]);
  const resendError = useSelector((state) => state.globalError.sectionErrors["resend-otp"])

  const { cartItems} = useSelector((state) => state.cart);
  const { items } = useSelector((state) => state.wishList);
  const { token } = useParams();
  const navigate = useNavigate();
  const state = useLocation().state;
  const from = state?.from || '/'; // where the customer was before sign-in (see SignIn.js)
  const sentTo = maskPhone(state?.phone);

  const [otp, setOtp] = useState('');
  const [problem, setProblem] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(clearVerifyOtpState());
      // Send the user back where they were before sign-in (see SignIn.js), or home.
      navigate(from, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyOtpMessage, isAuthenticated]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleChange = (digits) => {
    setOtp(digits);
    setProblem('');
  };

  // Handle form submission. The guest's cart and wishlist go with it, to be merged into the account.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setProblem('Enter the 6-digit code we sent you');
      document.getElementById('otp')?.focus();
      return;
    }
    dispatch(verifyOtp({
      token,
      otp,
      cart: (cartItems || []).map((item) => ({ product_id: item.id, quantity: item.quantity, variant_id: item.variant_id })),
      favorite: (items || []).map((item) => ({ product_id: item.id })),
    }));
  };

  const handleResendOtp = () => {
    if (seconds > 0) return;
    dispatch(resendOtp({ token }));
    setSeconds(RESEND_SECONDS);
  };

  const messages = Array.isArray(verifyOtpError) ? verifyOtpError : [];

  return (
    <AuthLayout
      title="Enter your code"
      icon={FaKey}
      step={2}
      subtitle={sentTo ? `We sent a 6-digit code to ${sentTo}.` : 'We sent you a 6-digit code.'}
      footer={<>Wrong number? <Link to="/signin" className="font-semibold text-blue-700 hover:underline">Use a different number</Link></>}
    >
      {messages.length > 0 ? (
        <ErrorDisplay errors={messages} />
      ) : (
        (verifyError || resendError) && (
          <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{verifyError || resendError}</p>
        )
      )}
      <SuccessMessage message={verifyOtpMessage||signinMessage} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id="otp" label="6-digit OTP" error={problem}>
          <OtpInput id="otp" value={otp} onChange={handleChange} error={problem} />
        </Field>

        <button
          type="submit"
          disabled={verifyOtpLoading}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          {verifyOtpLoading ? 'Verifying…' : 'Verify OTP'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={seconds > 0}
            className="min-h-11 px-3 text-sm font-medium text-blue-700 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
