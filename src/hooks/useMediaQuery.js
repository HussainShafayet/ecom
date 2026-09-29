import { useEffect, useState } from 'react';

// Whether a CSS media query matches right now, kept up to date while the window changes (`(min-width: 1024px)`).
// False where matchMedia does not exist (tests, very old browsers): the page then draws its lighter, phone-sized version.
const matches = (query) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

const useMediaQuery = (query) => {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const list = window.matchMedia(query);
    const onChange = () => setValue(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return value;
};

export default useMediaQuery;
