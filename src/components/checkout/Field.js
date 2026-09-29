import React from 'react';

// The class of an input/select/textarea of the checkout form: 48 px tall, 16 px text (a phone zooms into anything smaller when
// it is focused), red when it has a problem.
// `tall` is for a textarea (at least 80 px, not fixed at 48).
export const controlClass = (hasError, tall = false) =>
  `${tall ? 'min-h-[5rem] py-3' : 'h-12'} w-full rounded-lg border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${hasError ? 'border-red-500' : 'border-gray-300'}`;

// A form field with its label ABOVE it (a placeholder is gone as soon as you type) and its problem under it. The control is
// `children`; give it the same `id`, and `aria-invalid` / `aria-describedby` from `describedBy(id, error)`.
export const describedBy = (id, error) => (error ? `${id}-error` : undefined);

const Field = ({ id, label, error, optional, hint, children }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-800">
      {label}
      {optional && <span className="font-normal text-gray-500"> (optional)</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Field;
