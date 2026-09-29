import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { dismissToast, selectToasts } from '../../redux/slice/toastSlice';

const STYLES = {
  error: 'border-red-300 bg-red-50 text-red-800',
  success: 'border-green-300 bg-green-50 text-green-800',
  info: 'border-blue-300 bg-blue-50 text-blue-800',
};

// The toasts of `toastSlice`, stacked at the bottom of the screen (above the bottom nav on a phone).
const Toaster = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(selectToasts);
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-3 lg:bottom-6">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          role={type === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${STYLES[type] || STYLES.info}`}
        >
          <span className="flex-1">{message}</span>
          <button type="button" onClick={() => dispatch(dismissToast(id))} aria-label="Dismiss" className="mt-0.5 shrink-0 opacity-70 hover:opacity-100">
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
