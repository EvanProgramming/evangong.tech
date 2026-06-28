import { useRef, useEffect } from 'react';
import FlyingPosters from './FlyingPosters';

import './FlyingPostersSection.css';

/**
 * Scroll-pinned wrapper for FlyingPosters.
 *
 * While the section is pinned (sticky), wheel events drive the posters
 * instead of scrolling the page. Once all posters have been viewed
 * (one full loop of the stack), the page scroll is released so the user
 * can continue. Scrolling back up re-locks the section and rewinds the
 * posters before the page scroll resumes.
 */
export default function FlyingPostersSection({ items, ...props }) {
  const sectionRef = useRef(null);
  const postersRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const getInstance = () => postersRef.current?.getInstance?.();
    const getMaxScroll = () => {
      const inst = getInstance();
      if (!inst || !inst.medias || !inst.medias[0]) return 0;
      // Multiply by 10 so viewing all posters takes more wheel distance.
      return (inst.medias[0].heightTotal || 0) * 10;
    };

    const onWheel = e => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Pin zone: section top has reached viewport top, but the section
      // still has at least one viewport of height left below.
      const inPinZone = rect.top <= 0 && rect.bottom > vh;
      if (!inPinZone) return;

      const inst = getInstance();
      if (!inst) return;

      const max = getMaxScroll();
      const current = Math.abs(inst.scroll.current);

      if (e.deltaY > 0) {
        // Scrolling down
        if (current < max) {
          // Still posters to reveal: hijack the wheel.
          e.preventDefault();
          inst.onWheel(e);
          // Clamp target so we don't overshoot past the end.
          if (inst.scroll.target < -max) inst.scroll.target = -max;
        }
        // else: all posters viewed -> release page scroll
      } else if (e.deltaY < 0) {
        // Scrolling up
        if (current > 0.5) {
          // Still posters to rewind: hijack the wheel.
          e.preventDefault();
          inst.onWheel(e);
          // Clamp target so we don't rewind past the start.
          if (inst.scroll.target > 0) inst.scroll.target = 0;
        }
        // else: back at the top -> release page scroll upward
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [items]);

  return (
    <section ref={sectionRef} className="posters-pin-section" style={{ height: '200vh' }}>
      <div className="posters-pin-sticky">
        <FlyingPosters ref={postersRef} items={items} disableWheel {...props} />
      </div>
    </section>
  );
}
