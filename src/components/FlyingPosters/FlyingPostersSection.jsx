import { useRef, useEffect } from 'react';
import FlyingPosters from './FlyingPosters';

import './FlyingPostersSection.css';

/**
 * Scroll-pinned wrapper for FlyingPosters.
 *
 * Uses the global Lenis instance (created by ScrollStack and exposed on
 * window.__lenis) to pause page scrolling while the section is pinned.
 * While paused, wheel events drive the posters instead of the page.
 * Once all posters have been viewed (one full loop of the stack), Lenis
 * is resumed so the user can continue. Scrolling back up re-pauses and
 * rewinds the posters before the page scroll resumes.
 */
export default function FlyingPostersSection({ items, ...props }) {
  const sectionRef = useRef(null);
  const postersRef = useRef(null);
  const lenisStoppedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const getInstance = () => postersRef.current?.getInstance?.();
    const getMaxScroll = () => {
      const inst = getInstance();
      if (!inst || !inst.medias || !inst.medias[0]) return 0;
      return inst.medias[0].heightTotal || 0;
    };

    const stopLenis = () => {
      if (lenisStoppedRef.current) return;
      const lenis = typeof window !== 'undefined' ? window.__lenis : null;
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
        lenisStoppedRef.current = true;
      }
    };
    const startLenis = () => {
      if (!lenisStoppedRef.current) return;
      const lenis = typeof window !== 'undefined' ? window.__lenis : null;
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
        lenisStoppedRef.current = false;
      }
    };

    const onWheel = e => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Pin zone: section top has reached viewport top, but the section
      // still has at least one viewport of height left below.
      const inPinZone = rect.top <= 0 && rect.bottom > vh;

      if (!inPinZone) {
        // Outside the pin zone: make sure page scroll is free.
        startLenis();
        return;
      }

      const inst = getInstance();
      if (!inst) return;

      const max = getMaxScroll();
      const current = Math.abs(inst.scroll.current);

      if (e.deltaY > 0) {
        // Scrolling down
        if (current < max) {
          // Still posters to reveal: pause page scroll, hijack the wheel.
          stopLenis();
          e.preventDefault();
          inst.onWheel(e);
          if (inst.scroll.target < -max) inst.scroll.target = -max;
        } else {
          // All posters viewed -> resume page scroll.
          startLenis();
        }
      } else if (e.deltaY < 0) {
        // Scrolling up
        if (current > 0.5) {
          // Still posters to rewind: pause page scroll, hijack the wheel.
          stopLenis();
          e.preventDefault();
          inst.onWheel(e);
          if (inst.scroll.target > 0) inst.scroll.target = 0;
        } else {
          // Back at the top -> resume page scroll upward.
          startLenis();
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      // Ensure we never leave Lenis stopped when unmounting.
      startLenis();
    };
  }, [items]);

  return (
    <section ref={sectionRef} className="posters-pin-section" style={{ height: '200vh' }}>
      <div className="posters-pin-sticky">
        <FlyingPosters ref={postersRef} items={items} disableWheel {...props} />
      </div>
    </section>
  );
}
