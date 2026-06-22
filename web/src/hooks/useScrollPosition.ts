import { useState, useEffect } from 'react';

/**
 * Returns the current window.scrollY value, updated on scroll events.
 * Uses passive listener and requestAnimationFrame for performance.
 */
export function useScrollPosition(): number {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollPosition(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}
