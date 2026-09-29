import React from 'react';
import { FaBoxOpen, FaCheck, FaClipboardCheck, FaHome, FaMoneyBillWave, FaTimes, FaTruck, FaUndo } from 'react-icons/fa';
import { formatDateTime } from './format';

const STEPS = {
  pending: { label: 'Order Placed', icon: <FaCheck /> },
  confirmed: { label: 'Confirmed', icon: <FaClipboardCheck /> },
  paid: { label: 'Paid', icon: <FaMoneyBillWave /> },
  shipped: { label: 'Shipped', icon: <FaTruck /> },
  delivered: { label: 'Delivered', icon: <FaHome /> },
  returned: { label: 'Returned', icon: <FaUndo /> },
  cancelled: { label: 'Cancelled', icon: <FaTimes /> },
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
// Drawn small: a vertical list with a line through the dots on a phone (four steps stay in the first screen, the items are not
// pushed out of it), a row from `md`.
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
  const current = steps.reduce((latest, step, index) => (step.done ? index : latest), 0); // the newest step that happened

  return (
    <ol aria-label="Order progress" className="md:flex">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const dot = step.ended ? 'bg-red-500 text-white' : step.done ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400';
        return (
          <li
            key={step.status}
            aria-current={index === current ? 'step' : undefined}
            className="relative flex gap-3 pb-6 last:pb-0 md:flex-1 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center"
          >
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-4 top-8 -ml-px w-0.5 md:bottom-auto md:left-1/2 md:top-4 md:h-0.5 md:w-full md:-ml-0 ${steps[index + 1].done ? (steps[index + 1].ended ? 'bg-red-300' : 'bg-blue-500') : 'bg-gray-200'}`}
              />
            )}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${dot} ${index === current && !step.ended ? 'ring-4 ring-blue-100' : ''}`}>
              {STEPS[step.status]?.icon}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{STEPS[step.status]?.label || step.status}</p>
              <p className="text-xs text-gray-500">{step.done ? formatDateTime(step.at) : 'Not yet'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTimeline;
