import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// The long page's table of contents: Description / Specifications / Reviews / ... stay under the header while the page scrolls, the one
// being read is underlined, a tap jumps to it. Tabs are plain buttons (not an ARIA tablist: nothing is hidden, they only scroll).
// The header is sticky and 56 px high on a phone (72 px from md), so the bar sticks right under it, and the sections it jumps to carry a
// `scroll-mt-*` that clears both.
//   tabs      [{ id, label }]: `id` is the id of the element to scroll to
//   onSelect  (id) => void, before the scroll (the page opens a folded section)
const SectionTabs = ({ tabs, onSelect }) => {
  const [active, setActive] = useState(tabs[0]?.id);
  const list = useRef(null);
  const [bar, setBar] = useState({ left: 0, width: 0 }); // where the underline is: under the tab being read, it slides when another is
  const key = tabs.map((tab) => tab.id).join(',');

  // The section in the upper part of the screen is the one being read
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-130px 0px -60% 0px' },
    );
    key.split(',').forEach((id) => {
      const element = document.getElementById(id);
      element && observer.observe(element);
    });
    return () => observer.disconnect();
  }, [key]);

  const place = useCallback(() => {
    const tab = list.current?.querySelector('[aria-current="true"]');
    if (tab) setBar({ left: tab.offsetLeft, width: tab.offsetWidth });
  }, []);
  useLayoutEffect(place, [place, active, key]);
  useEffect(() => {
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [place]);

  // On a phone the bar is wider than the screen: keep the tab being read in view
  useEffect(() => {
    const row = list.current;
    const tab = row?.querySelector('[aria-current="true"]');
    if (!row || !tab || typeof row.scrollTo !== 'function') return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const go = (id) => {
    setActive(id);
    onSelect?.(id);
    // after the section has opened (a folded one grows on the next render)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (tabs.length < 2) return null;

  return (
    <nav aria-label="Sections of this page" className="sticky top-14 z-30 -mx-2 mt-6 border-b border-gray-200 bg-white px-2 shadow-sm md:top-[72px]">
      <ul ref={list} className="relative flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label }) => (
          <li key={id} className="shrink-0">
            <button
              type="button"
              onClick={() => go(id)}
              aria-current={active === id ? 'true' : undefined}
              className={`min-h-12 px-3 text-sm font-semibold transition-colors ${active === id ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {label}
            </button>
          </li>
        ))}
        <li aria-hidden="true" className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-indigo-600 transition-[left,width] duration-300 ease-out motion-reduce:transition-none" style={{ left: bar.left, width: bar.width }} />
      </ul>
    </nav>
  );
};

export default SectionTabs;
