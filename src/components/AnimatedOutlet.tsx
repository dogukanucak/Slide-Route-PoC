import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';

/**
 * Animated route wrapper using Framer Motion's `AnimatePresence`.
 *
 * - Uses `mode="wait"` so the exiting page finishes before the entering one starts.
 * - Keyed by `location.pathname` to trigger animations on route change.
 * - Slides: current page slides out left, new page slides in from right.
 * - The parent container has `overflow-x: hidden` to prevent horizontal scrollbar.
 */

const slideVariants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    x: '-50%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.25,
    },
  },
};

export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="animated-outlet-wrapper">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="animated-page"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {outlet && cloneElement(outlet, { key: location.pathname })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
