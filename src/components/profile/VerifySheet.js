import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleSendOtp, handleSubmitOtp, statusUpdateVerifyPopup } from '../../redux/slice/profileSlice';
import { Field, OtpInput } from '../common';
import useCountdown from '../../hooks/useCountdown';
import { formatWait } from '../../api/errors';

const RESEND_SECONDS = 60; // until the backend says (`otpTiming.resend_after`)
const CODE_LENGTH = 6;

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])';

// The code for a NEW phone number or e-mail (the backend wants it verified before it is saved): a sheet that comes up from the
// bottom on a phone (so it is in view wherever the form was scrolled to; the old popup was `absolute` with nothing positioned around
// it and opened at the top of the page), a dialog in the middle from `md`. The code is the shared `OtpInput`, a wrong code is said
// under the boxes, Resend counts down what the backend said, Esc or Cancel leave (Cancel is a plain button: it used to submit).
//   field    'phone' | 'email'
//   request  what `request-otp/` is asked for again on Resend: {phone_number} or {email}
//   label    "phone number" | "e-mail", for the words
const VerifySheet = ({ field, request, label }) => {
  const dispatch = useDispatch();
  const { message, otpToken, otpTiming, otpSubmitLoading, otpSubmitError, loading, verifyError } = useSelector((state) => state.profile);
  const timing = otpTiming[field];
  const resendSeconds = timing?.resend_after || RESEND_SECONDS;
  const length = timing?.length || CODE_LENGTH;
  const [otp, setOtp] = useState('');
  const [problem, setProblem] = useState('');
  const [hideSaid, setHideSaid] = useState(false); // what the shop said about the old code is not about the one being typed
  const [resendLeft, startResend] = useCountdown(resendSeconds);
  const dialog = useRef(null);

  const close = () => dispatch(statusUpdateVerifyPopup({ field }));

  useEffect(() => {
    document.getElementById('profile-otp')?.focus();
  }, []);

  const keys = (event) => {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'Tab') { // keep the Tab key inside the sheet
      const items = [...dialog.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (otp.length !== length) {
      setProblem(`Enter the ${length}-digit code we sent you`);
      document.getElementById('profile-otp')?.focus();
      return;
    }
    setHideSaid(false);
    dispatch(handleSubmitOtp({ formData: { token: otpToken[field], otp }, field }));
  };

  const resend = () => {
    if (resendLeft > 0) return;
    dispatch(handleSendOtp({ formData: request, field }));
    startResend(resendSeconds);
    setOtp('');
  };

  const said = otpSubmitError[field];
  const codeProblem = problem || (hideSaid ? '' : Array.isArray(said) ? said.join(' ') : said || '');
  const resendProblem = verifyError[field];
  const sending = loading[field];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center md:p-4" onKeyDown={keys}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-title"
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl md:rounded-2xl"
      >
        <h2 id="verify-title" className="text-lg font-bold text-gray-900">Verify your new {label}</h2>
        <p className="mt-1 text-sm text-gray-600">{message[field] || `We sent you a ${length}-digit code.`}</p>

        <form onSubmit={submit} noValidate className="mt-4 space-y-4">
          <Field id="profile-otp" label={`${length}-digit code`} error={codeProblem}>
            <OtpInput
              id="profile-otp"
              value={otp}
              length={length}
              error={codeProblem}
              onChange={(digits) => { setOtp(digits); setProblem(''); setHideSaid(true); }}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={otpSubmitLoading[field]}
              className="flex h-12 items-center justify-center rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              {otpSubmitLoading[field] ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={resendLeft > 0 || sending}
              className="min-h-11 text-sm font-medium text-blue-700 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
            >
              {sending ? 'Sending…' : resendLeft > 0 ? `Resend code in ${resendLeft < 90 ? `${resendLeft}s` : formatWait(resendLeft)}` : 'Resend code'}
            </button>
            {Array.isArray(resendProblem) && resendProblem.length > 0 && <p role="alert" className="text-center text-sm text-red-600">{resendProblem.join(' ')}</p>}
            <button
              type="button"
              onClick={close}
              className="h-12 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifySheet;
