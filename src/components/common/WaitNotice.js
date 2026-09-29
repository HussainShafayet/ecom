import React from 'react';
import { formatWait } from '../../api/errors';

// "Too many attempts. Please try again in 15 seconds." for a 429, with the wait counting down as the page's own clock ticks it
// (`seconds`). It replaces the backend's raw "Request was throttled. Expected available in 15 seconds." under a red "Error". The
// counting numbers are hidden from a screen reader (it would read every second); it hears "a little while" once.
const WaitNotice = ({ seconds, children = 'Too many attempts.' }) => (
  <div role="alert" className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900">
    <span>{children} Please try again in </span>
    <strong aria-hidden="true">{formatWait(seconds)}</strong>
    <span className="sr-only">a little while</span>.
  </div>
);

export default WaitNotice;
