import React, { useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import useMediaQuery from '../../../hooks/useMediaQuery';

// A titled block of the product page. On a phone it folds up under its title (tap to open), so the page is not a wall of
// text; from `md` up it is always open and its title is just a title.
//   sectionId  the element id, so the page's tab bar can scroll to it (`scroll-mt-*` clears the sticky header and the tab bar)
//   open / onToggle  when the page owns the state (a tab opens a folded section); without them it keeps its own, starting at `defaultOpen`
const CollapsibleSection = ({ title, defaultOpen = false, sectionId, open: controlledOpen, onToggle, children }) => {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const open = controlledOpen ?? ownOpen;
  const wide = useMediaQuery('(min-width: 768px)');
  const id = useId();
  const shut = !open && !wide; // folded: only on a phone, from md every section is open

  return (
    <section id={sectionId} className="scroll-mt-32 rounded-lg border border-gray-200 bg-white md:scroll-mt-40">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => (onToggle ? onToggle() : setOwnOpen((value) => !value))}
          className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-gray-900 md:pointer-events-none"
        >
          {title}
          <FaChevronDown aria-hidden="true" className={`text-gray-500 transition-transform md:hidden ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      {/* It opens and closes by sliding (a grid row from 0fr to 1fr: the height of the content, whatever it is, without measuring it). While shut its
          content is invisible after the slide and `inert`, so Tab and screen readers skip what is not shown. */}
      <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${shut ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
        <div inert={shut} className={`overflow-hidden transition-[visibility] duration-300 ${shut ? 'invisible' : 'visible'}`}>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default CollapsibleSection;
