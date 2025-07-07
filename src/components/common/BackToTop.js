import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './BackToTop.module.css';

const BackToTop = ({ scrollContainerRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;

    const scrollPercent = (scrollTop / scrollHeight) * 100;
    setScrollProgress(scrollPercent);

    // Show button after scrolling 50% of viewport height
    setIsVisible(scrollTop > window.innerHeight * 0.5);
  }, [scrollContainerRef]);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [scrollContainerRef]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, handleScroll]);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.backToTopButton} ${styles.backToTopButtonVisible}`}
      aria-label="Back to top"
      title="Back to top"
    >
      <div className={styles.iconContainer}>
        <svg className={styles.progressSvg} viewBox="0 0 36 36">
          <path
            className={styles.progressBackground}
            strokeWidth="3"
            fill="none"
            strokeDasharray="100, 100"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.progressCircle}
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${scrollProgress}, 100`}
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <FaArrowUp className={styles.icon} />
      </div>
    </button>
  );
};

export default BackToTop;
