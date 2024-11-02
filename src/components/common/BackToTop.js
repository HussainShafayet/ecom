import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './BackToTop.module.css'; // Import the CSS module

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    setScrollProgress(scrollPercent);

    // Dynamic threshold: e.g., 50% of the viewport height
    const dynamicThreshold = window.innerHeight * 0.5;

    if (scrollTop > dynamicThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`${styles.backToTopButton} ${isVisible ? styles.backToTopButtonVisible : ''}`}
          aria-label="Back to top"
          title="Back to top"
        >
          <div className={styles.iconContainer}>
            {/* Circular progress background */}
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
              {/* Circular progress indicator */}
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
            {/* Icon inside the button */}
            <FaArrowUp className={styles.icon} />
          </div>
        </button>
      )}
    </div>
  );
};

export default BackToTop;
