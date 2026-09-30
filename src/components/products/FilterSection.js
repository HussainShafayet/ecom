import React, { useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// One group of the filters (Brands, Price, ...) that opens and closes: a 48 px heading that says how many of it are chosen and
// tells a screen reader whether it is open. `defaultOpen` is read once, when it first appears.
const FilterSection = ({ title, count = 0, defaultOpen = false, children }) => {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-gray-200 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="flex h-12 w-full items-center justify-between gap-2 text-left font-semibold text-gray-800"
        >
          <span className="flex items-center gap-2">
            {title}
            {count > 0 && <span aria-label={`${count} chosen`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">{count}</span>}
          </span>
          <FaChevronDown aria-hidden="true" className={`shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-3">{children}</div>
    </section>
  );
};

export default FilterSection;
