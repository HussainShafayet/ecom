import React from 'react';
import { FaTimes } from 'react-icons/fa';

// What is chosen, one chip each under the controls, every chip a button that takes just that one off (so the customer sees WHY
// the list is short without opening the filters), and Clear all. A row that swipes on a phone, wraps from `lg`. Nothing when
// nothing is chosen.
const ActiveFilters = ({ chips, onRemove, onClear }) => {
  if (chips.length === 0) return null;
  return (
    <div className="-mx-2 mb-4 flex items-center gap-2 overflow-x-auto px-2 pb-1 lg:flex-wrap lg:overflow-visible" aria-label="Chosen filters" role="group">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip)}
          aria-label={`Remove ${chip.label}`}
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 hover:bg-blue-100"
        >
          {chip.label}
          <FaTimes aria-hidden="true" className="text-xs" />
        </button>
      ))}
      <button type="button" onClick={onClear} className="h-9 shrink-0 px-2 text-sm font-medium text-blue-700 underline">Clear all</button>
    </div>
  );
};

export default ActiveFilters;
