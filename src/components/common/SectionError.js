import React from 'react';

// What a part of a page shows when it could not load, in place of the part: the sentence, and a way to try again
// right there. `onRetry` re-requests just this part; without one the button reloads the page.
const SectionError = ({ message, onRetry }) => (
  <div role="alert" className="mx-auto my-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-center">
    <p className="font-semibold text-red-800">We couldn&apos;t load this.</p>
    <p className="mt-1 text-sm text-red-700">{message}</p>
    <button
      type="button"
      onClick={onRetry || (() => window.location.reload())}
      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      {onRetry ? 'Try again' : 'Reload page'}
    </button>
  </div>
);

export default SectionError;
