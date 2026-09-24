import React from 'react';
import { FaBoxOpen, FaCheckCircle, FaClipboardCheck, FaHome, FaMoneyBillWave, FaTimesCircle, FaTruck, FaUndo } from 'react-icons/fa';
import { formatDateTime } from './format';

const STEPS = {
  pending: { label: 'Order Placed', icon: <FaCheckCircle /> },
  confirmed: { label: 'Confirmed', icon: <FaClipboardCheck /> },
  paid: { label: 'Paid', icon: <FaMoneyBillWave /> },
  shipped: { label: 'Shipped', icon: <FaTruck /> },
  delivered: { label: 'Delivered', icon: <FaHome /> },
  returned: { label: 'Returned', icon: <FaUndo /> },
  cancelled: { label: 'Cancelled', icon: <FaTimesCircle /> },
  refunded: { label: 'Refunded', icon: <FaBoxOpen /> },
};

// The usual way an order goes: placed, shipped, delivered. "Confirmed" (staff checked the order) and "paid" are shown
// only when they happened (cash on delivery is paid at the door, and a shop need not phone its customers).
const STEP_ORDER = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];
const ALWAYS = ['pending', 'shipped', 'delivered'];
// An order that did not reach the customer ends in one of these (a red step): cancelled, a parcel that came back, a refund.
const ENDINGS = ['cancelled', 'returned', 'refunded'];

// `history` is the backend's [{status, status_display, created_at}], oldest first. What has happened is filled in with
// its date, what is still to come is grey; an order that ended without delivery drops the steps that never happened.
const OrderTimeline = ({ history = [] }) => {
  const reached = (status) => history.find((step) => step.status === status);
  const ended = history.find((step) => ENDINGS.includes(step.status));

  const steps = STEP_ORDER
    .filter((status) => ALWAYS.includes(status) || reached(status))
    .filter((status) => !ended || reached(status))
    .map((status) => ({ status, done: Boolean(reached(status)), at: reached(status)?.created_at }));
  if (ended) {
    steps.push({ status: ended.status, done: true, at: ended.created_at, ended: true });
  }

  return (
    <div className="flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-3 md:space-y-0">
      {steps.map((step) => (
        <div
          key={step.status}
          className={`flex md:flex-col items-center md:text-center p-4 rounded-lg shadow ${
            step.ended ? 'bg-red-50' : step.done ? 'bg-blue-50' : 'bg-gray-100'
          }`}
        >
          <div className={`text-3xl mr-4 md:mr-0 ${step.ended ? 'text-red-500' : step.done ? 'text-blue-500' : 'text-gray-400'}`}>
            {STEPS[step.status]?.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-800 md:mt-2">{STEPS[step.status]?.label || step.status}</p>
            <p className="text-xs text-gray-500">{step.done ? formatDateTime(step.at) : 'Not yet'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
