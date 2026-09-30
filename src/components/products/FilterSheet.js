import React, { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import useDialog from '../../hooks/useDialog';
import { emptyFilters, filterCount, priceProblem } from '../../utils/productFilters';
import FilterPanel from './FilterPanel';

const EMPTY = emptyFilters();

// The filters on a phone: a sheet from the bottom (the same kind as the verification code's) over the page, with the groups
// scrolling in the middle and two buttons that never scroll away: Clear all and Show results. What is chosen here is a DRAFT: the
// list behind it waits (no request, no jump) until Show results, and closing with the X, Esc or a tap outside drops the draft.
const FilterSheet = ({ filters, onApply, onClose, scrollRef }) => {
  const dialog = useRef(null);
  const [draft, setDraft] = useState(() => ({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((name) => [name, filters[name]])) }));
  useDialog(dialog, onClose, scrollRef);

  const empty = filterCount(draft) === 0;

  const apply = () => {
    if (priceProblem(draft)) { // the sentence is already under the boxes: take the customer to the one to fix
      dialog.current?.querySelector('[data-filter="min-price"]')?.focus();
      return;
    }
    onApply(draft);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 lg:hidden" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full [@supports(height:100dvh)]:max-h-[90dvh] max-w-lg flex-col rounded-t-2xl bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4">
          <h2 id="filter-sheet-title" className="py-3 text-lg font-bold text-gray-900">Filters</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
          <FilterPanel filters={draft} onChange={setDraft} commitPrice="change" />
        </div>

        <div className="flex gap-2 border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setDraft(EMPTY)}
            disabled={empty}
            className="h-12 flex-1 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear all
          </button>
          <button type="button" onClick={apply} className="h-12 flex-[2] rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700">
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSheet;
