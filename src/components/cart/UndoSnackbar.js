import React from 'react';

// "Removed X · Undo": what replaces asking "are you sure?" before every removal. Sits above the fixed checkout bar on a phone
// (bottom-36 = 144 px), just above the bottom navigation from `md`, in the corner from `lg`. The owner hides it after a few seconds.
const UndoSnackbar = ({ message, onUndo }) => (
  <div
    role="status"
    className="fixed inset-x-3 bottom-36 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-28 lg:bottom-6"
  >
    <span className="min-w-0 truncate">{message}</span>
    <button type="button" onClick={onUndo} className="h-10 shrink-0 px-2 font-semibold text-blue-300 hover:text-blue-200">Undo</button>
  </div>
);

export default UndoSnackbar;
