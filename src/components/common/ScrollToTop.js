// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { recallScroll } from '../../utils/scrollMemory';

const ScrollToTop = ({ scrollContainerRef }) => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Back (or Forward) to a page the shopper had scrolled: the page puts it back itself (the products list does), not up to the top
    if (navigationType === 'POP' && recallScroll(key) !== undefined) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, scrollContainerRef]); // Runs every time the pathname changes

  return null;
};

export default ScrollToTop;
