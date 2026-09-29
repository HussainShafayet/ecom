import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaCheck, FaRegCopy } from 'react-icons/fa';
import { pushToast } from '../../redux/slice/toastSlice';

// A 44 px button that puts the order number on the clipboard (to paste into a chat with the shop or the tracking page). It says
// so with a tick and a toast; where the browser will not let it copy (an old one, plain http) it says that instead of nothing.
const CopyOrderId = ({ value }) => {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      dispatch(pushToast('Order ID copied', 'success', 2500));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      dispatch(pushToast('Could not copy. Select the order ID and copy it.', 'error'));
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy order ID"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    >
      {copied ? <FaCheck className="text-green-600" aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
    </button>
  );
};

export default CopyOrderId;
