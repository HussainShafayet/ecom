import { useEffect, useState } from 'react';

// The nearest ancestor that scrolls. The shop scrolls inside Layout's own box, not the window, and an observer without a `root`
// cannot look ahead beyond a scroll box its target sits in.
const scrollParent = (element) => {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
};

// True once `ref`'s element has come within `rootMargin` of the screen; once true it stays true (a section that was shown is not
// taken away again). Where the browser has no IntersectionObserver (tests, very old browsers) it is true at once: everything
// loaded is better than a section that never appears.
const useInView = (ref, { rootMargin = '0px' } = {}) => {
  const supported = typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';
  const [inView, setInView] = useState(!supported);

  useEffect(() => {
    if (inView || !ref.current) return undefined;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: scrollParent(ref.current), rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin, inView]);

  return inView;
};

export default useInView;
