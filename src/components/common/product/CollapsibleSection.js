import React, { useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// A titled block of the product page. On a phone it folds up under its title (tap to open), so the page is not a wall of
// text; from `md` up it is always open and its title is just a title.
const CollapsibleSection = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-gray-900 md:pointer-events-none"
        >
          {title}
          <FaChevronDown aria-hidden="true" className={`text-gray-500 transition-transform md:hidden ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} className={`px-4 pb-4 ${open ? 'block' : 'hidden'} md:block`}>{children}</div>
    </section>
  );
};

export default CollapsibleSection;
