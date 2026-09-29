import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { dismissSessionNotice } from '../../redux/slice/authSlice';

const AUTH_PAGES = ['/signin', '/signup', '/verify-otp'];

// Said once when the server ended this device's session (api/session.js), instead of a page-wide error: the shop stays
// usable as a guest and the customer is offered the way back. The sign-in page shows the same sentence itself.
const SessionExpiredBanner = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sessionExpired, isAuthenticated } = useSelector((state) => state.auth);

  if (!sessionExpired || isAuthenticated) return null;
  if (AUTH_PAGES.some((path) => location.pathname.startsWith(path))) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-3 border-b border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span>Your session expired. Sign in again to see your cart, wishlist and orders.</span>
      <Link to="/signin" state={{ from: location }} className="shrink-0 font-semibold underline hover:text-amber-700">Sign in</Link>
      <button
        type="button"
        onClick={() => dispatch(dismissSessionNotice())}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 hover:bg-amber-100"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );
};

export default SessionExpiredBanner;
