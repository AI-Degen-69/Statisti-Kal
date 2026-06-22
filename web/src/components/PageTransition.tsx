import type { ReactElement, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key to trigger re-animation on page change */
  pageKey: string;
}

/**
 * Wraps page content with a smooth fade + slide entrance animation.
 * Change the `pageKey` prop to trigger re-animation when switching pages.
 */
export function PageTransition({ children, pageKey }: PageTransitionProps): ReactElement {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
