import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMobileAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { AuthLayout, ErrorDisplay, Field, PhoneInput, WaitNotice } from '../../components/common';
import useCountdown from '../../hooks/useCountdown';
import { formatWait } from '../../api/errors';
import { clearSigninState, signInUser } from '../../redux/slice/authSlice';
import { PHONE_PREFIX, validatePhone } from '../../utils/phone';

// Phone first: the form is the first thing on the page, one field (a phone has a fixed +880 in front of it and cleans up what is
// typed or pasted), one 48 px button. The customer gets a code by SMS and enters it on the next page.
const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {signinLoading, signinMessage, signinError, signinWait, token, isAuthenticated, sessionExpired } = useSelector((state) => state.auth);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["sign-in"]);
  const [phone, setPhone] = useState('');
  const [showProblem, setShowProblem] = useState(false); // once the box was left, or Sign In was pressed
  // The shop said too many codes were asked for: wait, counting down, instead of DRF's raw "Request was throttled"
  const [waitLeft, startWait] = useCountdown();
  const waiting = waitLeft > 0;
  useEffect(() => {
    if (signinWait) startWait(signinWait.seconds);
  }, [signinWait?.id, startWait]); // eslint-disable-line react-hooks/exhaustive-deps

  // The page they were on (ProtectedRoute puts it in location.state.from), with its query string: VerifyOtp sends them back there
  const cameFrom = location.state?.from;
  const from = cameFrom ? `${cameFrom.pathname}${cameFrom.search || ''}` : '/';

  useEffect(() => {
    isAuthenticated && navigate('/');

    if (signinMessage) {
      // Redirect to the OTP page, carrying the page the user was on before sign-in so VerifyOtp can send them
      // back there once verified (see VerifyOtp.js), and the number the code went to.
      navigate(`/verify-otp/${token}`, { state: { from, phone } });
      dispatch(clearSigninState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signinMessage, isAuthenticated]);

  const problem = showProblem ? validatePhone(phone) : '';

  const handleLogin = (e) => {
    e.preventDefault();
    if (waiting) return;
    setShowProblem(true);
    if (validatePhone(phone)) {
      document.getElementById('signin-phone')?.focus();
      return;
    }
    dispatch(signInUser({ phone_number: PHONE_PREFIX + phone }));
  };

  // What the shop said about the attempt (the backend's sentences), whichever way it reached us
  const messages = Array.isArray(signinError) ? signinError : (signinError ? [signinError] : []);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with just your phone number. We will text you a code."
      icon={FaMobileAlt}
      step={1}
      footer={<>Don’t have an account? <Link to="/signup" className="font-semibold text-blue-700 hover:underline">Sign up</Link></>}
    >
      {sessionExpired && (
        <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900">
          Your session expired. Please sign in again to continue.
        </p>
      )}

      {waiting && <WaitNotice seconds={waitLeft}>You have asked for too many codes.</WaitNotice>}

      {messages.length > 0 ? (
        <ErrorDisplay errors={messages} />
      ) : (
        !signinWait && sectionError && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{sectionError}</p>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-4">
        <Field id="signin-phone" label="Phone number" error={problem}>
          <PhoneInput
            id="signin-phone"
            value={phone}
            onChange={setPhone}
            onBlur={() => setShowProblem(true)}
            error={problem}
            enterKeyHint="go"
          />
        </Field>

        <button
          type="submit"
          disabled={signinLoading || waiting}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          {waiting ? `Try again in ${formatWait(waitLeft)}` : signinLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
