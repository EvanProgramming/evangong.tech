import { useRef, useEffect } from 'react';
import FlyingPosters from './FlyingPosters';

import './FlyingPostersSection.css';

/**
 * Scroll-pinned wrapper for FlyingPosters.
 *
 * Uses the global Lenis instance (created by ScrollStack and exposed on
 * window.__lenis) to pause page scrolling while the section is pinned.
 * While paused, wheel events drive the posters instead of the page.
 * Once all posters have been viewed (one full loop of the stack), we
 * force-scroll past the section with lenis.scrollTo({ force: true }) so
 * the page resumes even if Lenis's wheel handling is still stopped.
 */
export default function FlyingPostersSection({ items, ...props }) {
  const sectionRef = useRef(null);
  const postersRef = useRef(null);
  const lenisStoppedRef = useRef(false);
  const scrollingOutRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const getInstance = () => postersRef.current?.getInstance?.();
    const getLenis = () => (typeof window !== 'undefined' ? window.__lenis : null);
    const getMaxScroll = () => {
      const inst = getInstance();
      if (!inst || !inst.medias || !inst.medias[0]) return 0;
      return inst.medias[0].heightTotal || 0;
    };

    const stopLenis = () => {
      if (lenisStoppedRef.current) return;
      const lenis = getLenis();
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
        lenisStoppedRef.current = true;
      }
    };
    const startLenis = () => {
      if (!lenisStoppedRef.current) return;
      const lenis = getLenis();
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
        lenisStoppedRef.current = false;
      }
    };

    const leavePinZoneDown = () => {
      if (scrollingOutRef.current) return;
      scrollingOutRef.current = true;
      startLenis();
      const lenis = getLenis();
      const target = section.offsetTop + section.offsetHeight - window.innerHeight + 10;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(target, {
          duration: 1,
          force: true,
          onComplete: () => { scrollingOutRef.current = false; }
        });
      } else {
        window.scrollTo(0, target);
        scrollingOutRef.current = false;
      }
    };
    const leavePinZoneUp = () => {
      if (scrollingOutRef.current) return;
      scrollingOutRef.current = true;
      startLenis();
      const lenis = getLenis();
      const target = Math.max(0, section.offsetTop - window.innerHeight - 10);
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(target, {
          duration: 1,
          force: true,
          onComplete: () => { scrollingOutRef.current = false; }
        });
      } else {
        window.scrollTo(0, target);
        scrollingOutRef.current = false;
      }
    };

    const onWheel = e => {
      // If we're already animating out of the pin zone, let Lenis handle it.
      if (scrollingOutRef.current) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const inPinZone = rect.top <= 0 && rect.bottom > vh;

      if (!inPinZone) {
        startLenis();
        return;
      }

      const inst = getInstance();
      if (!inst) return;

      const max = getMaxScroll();
      const current = Math.abs(inst.scroll.current);

      if (e.deltaY > 0) {
        if (current < max) {
          stopLenis();
          e.preventDefault();
          inst.onWheel(e);
          if (inst.scroll.target < -max) inst.scroll.target = -max;
        } else {
          // Viewed all posters: force-scroll past the section.
          e.preventDefault();
          leavePinZoneDown();
        }
      } else if (e.deltaY < 0) {
        if (current > 0.5) {
          stopLenis();
          e.preventDefault();
          inst.onWheel(e);
          if (inst.scroll.target > 0) inst.scroll.target = 0;
        } else {
          // Back at the top: force-scroll up out of the section.
          e.preventDefault();
          leavePinZoneUp();
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
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
