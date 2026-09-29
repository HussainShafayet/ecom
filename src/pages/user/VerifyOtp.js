import React, { useEffect, useState } from "react";
import {AuthLayout, Field, OtpInput, SuccessMessage, WaitNotice} from "../../components/common";
import {FaKey} from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {clearVerifyOtpState, resendOtp, verifyOtp} from "../../redux/slice/authSlice";
import {maskPhone} from "../../utils/phone";
import {formatWait} from "../../api/errors";
import useCountdown from "../../hooks/useCountdown";

// What the code page assumes until the backend says otherwise (its answer to "send a code" carries `resend_after`, `expires_in` and
// `length`, see `state.auth.otpTiming`): 60 s before another code can be asked for (the backend's OTP_RESEND_COOLDOWN_SECONDS), and
// a code of 6 digits. They are also what the page uses after a reload, when that answer is gone. The first code was just sent, so
// the wait is counting from the start, and again each time Resend is pressed.
export const RESEND_SECONDS = 60;
export const CODE_LENGTH = 6;

// A wait as it goes on a button: "45s" while it is short, words when it is long ("25 minutes": the codes per hour are limited)
const shortWait = (seconds) => (seconds < 90 ? `${seconds}s` : formatWait(seconds));

// The code page, phone first: the code as six boxes over one real input (`OtpInput`: the phone's number keypad and "fill in from
// SMS"), the number the code went to (its middle hidden), a resend button that counts down (the backend's 60 s, or what it says
// when it says "too many"), what the shop said about the code under the boxes, and a way back if the number was wrong.
const VerifyOtp = () => {
  const dispatch = useDispatch();
  const { verifyOtpLoading, verifyOtpMessage, verifyOtpError, verifyWait, resendWait, resendOtpError, otpTiming, signinMessage, isAuthenticated } = useSelector((state) => state.auth);
  const verifyError = useSelector((state) => state.globalError.sectionErrors["verify-otp"]);
  const resendError = useSelector((state) => state.globalError.sectionErrors["resend-otp"])

  const { cartItems} = useSelector((state) => state.cart);
  const { items } = useSelector((state) => state.wishList);
  const { token } = useParams();
  const navigate = useNavigate();
  const state = useLocation().state;
  const from = state?.from || '/'; // where the customer was before sign-in (see SignIn.js)
  const sentTo = maskPhone(state?.phone);

  const resendSeconds = otpTiming?.resend_after || RESEND_SECONDS;
  const length = otpTiming?.length || CODE_LENGTH;
  const expiresIn = otpTiming?.expires_in;

  const [otp, setOtp] = useState('');
  const [problem, setProblem] = useState('');
  const [resendLeft, startResend] = useCountdown(resendSeconds);
  const [verifyLeft, startVerify] = useCountdown();

  // "Too many": wait as long as the shop said, counting down
  useEffect(() => {
    if (verifyWait) startVerify(verifyWait.seconds);
  }, [verifyWait?.id, startVerify]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (resendWait) startResend(resendWait.seconds);
  }, [resendWait?.id, startResend]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(clearVerifyOtpState());
      // Send the user back where they were before sign-in (see SignIn.js), or home.
      navigate(from, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyOtpMessage, isAuthenticated]);

  const handleChange = (digits) => {
    setOtp(digits);
    setProblem('');
    if (verifyOtpError) dispatch(clearVerifyOtpState()); // what the shop said about the old code is not about the new one
  };

  // Handle form submission. The guest's cart and wishlist go with it, to be merged into the account.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyLeft > 0) return;
    if (otp.length !== length) {
      setProblem(`Enter the ${length}-digit code we sent you`);
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
    if (resendLeft > 0) return;
    dispatch(resendOtp({ token }));
    startResend(resendSeconds);
  };

  // What the shop said about the code (e.g. "Incorrect code. 4 attempts left."), under the boxes; else what we found out ourselves
  const said = Array.isArray(verifyOtpError) ? verifyOtpError.join(' ') : (verifyOtpError || '');
  const boxProblem = problem || said;
  const verifyWaiting = verifyLeft > 0;
  const resendWaiting = resendWait && resendLeft > 0; // the shop asked for a wait (as opposed to the ordinary 60 s after a code)
  const somethingElse = !boxProblem && !verifyWait && !resendWait ? (verifyError || resendError) : '';

  return (
    <AuthLayout
      title="Enter your code"
      icon={FaKey}
      step={2}
      subtitle={`${sentTo ? `We sent a ${length}-digit code to ${sentTo}.` : `We sent you a ${length}-digit code.`}${expiresIn ? ` It works for ${formatWait(expiresIn)}.` : ''}`}
      footer={<>Wrong number? <Link to="/signin" className="font-semibold text-blue-700 hover:underline">Use a different number</Link></>}
    >
      {verifyWaiting && <WaitNotice seconds={verifyLeft}>Too many attempts.</WaitNotice>}
      {!verifyWaiting && resendWaiting && <WaitNotice seconds={resendLeft}>You have asked for too many codes.</WaitNotice>}
      {somethingElse && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{somethingElse}</p>
      )}
      <SuccessMessage message={verifyOtpMessage||signinMessage} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id="otp" label={`${length}-digit OTP`} error={boxProblem}>
          <OtpInput id="otp" value={otp} onChange={handleChange} error={boxProblem} length={length} />
        </Field>

        <button
          type="submit"
          disabled={verifyOtpLoading || verifyWaiting}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          {verifyWaiting ? `Try again in ${formatWait(verifyLeft)}` : verifyOtpLoading ? 'Verifying…' : 'Verify OTP'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLeft > 0}
            className="min-h-11 px-3 text-sm font-medium text-blue-700 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {resendLeft > 0 ? `Resend code in ${shortWait(resendLeft)}` : 'Resend code'}
          </button>
          {Array.isArray(resendOtpError) && resendOtpError.length > 0 && (
            <p role="alert" className="mt-1 text-sm text-red-600">{resendOtpError.join(' ')}</p>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
