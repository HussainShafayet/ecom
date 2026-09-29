import React, { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import {clearSignupState, signUpUser} from "../../redux/slice/authSlice";
import {AuthLayout, ErrorDisplay, Field, PhoneInput, SuccessMessage, WaitNotice, controlClass, describedBy} from '../../components/common';
import useCountdown from '../../hooks/useCountdown';
import {formatWait} from '../../api/errors';
import {PHONE_PREFIX, validatePhone} from '../../utils/phone';

// What the form asks for and what is wrong with it, one sentence each (the phone: +880 and exactly 10 digits, the backend's rule)
const validate = ({ name, phone, email }) => {
  const problems = {};
  if (!name.trim()) problems.name = 'Enter your full name';
  const phoneProblem = validatePhone(phone);
  if (phoneProblem) problems.phone = phoneProblem;
  if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) problems.email = 'Enter a valid email address, or leave it empty';
  return problems;
};
const ORDER = ['name', 'phone', 'email'];

// Phone first: name, phone (fixed +880, cleaned as you type) and an optional e-mail, 48 px controls with labels above them, the
// button under them. The code goes to the phone and is entered on the next page.
const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {signupLoading, signupMessage, signupError, signupWait, token, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [touched, setTouched] = useState({});
  // The shop said too many codes were asked for: wait, counting down (see SignIn)
  const [waitLeft, startWait] = useCountdown();
  const waiting = waitLeft > 0;
  useEffect(() => {
    if (signupWait) startWait(signupWait.seconds);
  }, [signupWait?.id, startWait]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isAuthenticated && navigate('/');

    if (signupMessage) {
      // On to the code page (with the number it went to), and forget this attempt
      navigate(`/verify-otp/${token}`, { state: { phone: formData.phone } });
      dispatch(clearSignupState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signupMessage, dispatch, navigate, isAuthenticated]);

  const problems = validate(formData);
  const problem = (field) => (touched[field] && problems[field]) || '';
  const leave = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));
  const change = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (waiting) return;
    setTouched({ name: true, phone: true, email: true });

    const first = ORDER.find((field) => problems[field]);
    if (first) {
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }
    dispatch(signUpUser({
      "phone_number": PHONE_PREFIX + formData.phone,
      "email": formData.email.trim(),
      "name": formData.name.trim(),
    }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Just your name and phone. No password, ever."
      icon={FaUserPlus}
      step={1}
      footer={<>Already a member? <Link to="/signin" className="font-semibold text-blue-700 hover:underline">Sign in</Link></>}
    >
      {waiting && <WaitNotice seconds={waitLeft}>You have asked for too many codes.</WaitNotice>}
      <SuccessMessage message={signupMessage} />
      <ErrorDisplay errors={signupError} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id="signup-name" label="Full name" error={problem('name')}>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            value={formData.name}
            onChange={change('name')}
            onBlur={leave('name')}
            aria-invalid={Boolean(problem('name'))}
            aria-describedby={describedBy('signup-name', problem('name'))}
            className={controlClass(problem('name'))}
          />
        </Field>

        <Field id="signup-phone" label="Phone number" error={problem('phone')}>
          <PhoneInput
            id="signup-phone"
            name="phone"
            value={formData.phone}
            onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
            onBlur={leave('phone')}
            error={problem('phone')}
          />
        </Field>

        <Field id="signup-email" label="Email" optional hint="For your order updates." error={problem('email')}>
          <input
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="go"
            value={formData.email}
            onChange={change('email')}
            onBlur={leave('email')}
            aria-invalid={Boolean(problem('email'))}
            aria-describedby={describedBy('signup-email', problem('email'))}
            className={controlClass(problem('email'))}
          />
        </Field>

        <button
          type="submit"
          disabled={signupLoading || waiting}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          {waiting ? `Try again in ${formatWait(waitLeft)}` : signupLoading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
