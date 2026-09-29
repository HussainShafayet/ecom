import { useEffect } from 'react';

// Calls `onOutside` when the pointer goes down anywhere outside `ref`'s element: a click with a mouse, a touch on a phone
// (`mousedown` alone is only emulated late, and not at all while the page is scrolling).
const useOutsideClick = (ref, onOutside) => {
  useEffect(() => {
    const handle = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [ref, onOutside]);
};

export default useOutsideClick;
