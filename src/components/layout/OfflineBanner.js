import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { pushToast } from '../../redux/slice/toastSlice';

// A bar under the header while the browser has no connection, and a toast when it comes back. It only reports what the
// browser says (`online` / `offline` events); requests that fail anyway are handled where they were made.
const OfflineBanner = () => {
  const dispatch = useDispatch();
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);

  useEffect(() => {
    const goOffline = () => setOnline(false);
    const goOnline = () => {
      setOnline(true);
      dispatch(pushToast("You're back online.", 'success', 4000));
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [dispatch]);

  if (online) return null;

  return (
    <div role="alert" className="border-b border-red-300 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
      You&apos;re offline. Some things won&apos;t load until your connection is back.
    </div>
  );
};

export default OfflineBanner;
