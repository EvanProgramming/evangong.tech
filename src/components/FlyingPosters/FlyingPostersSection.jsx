import { useRef, useEffect, useState } from 'react';
import FlyingPosters from './FlyingPosters';

import './FlyingPostersSection.css';

/**
 * Scroll-pinned wrapper for FlyingPosters.
 *
 * The wrapper is a tall section (height = scrollLength vh). An inner
 * sticky container pins the posters at the center of the viewport while
 * the page scrolls through the wrapper. A rAF loop maps the wrapper's
 * scroll progress (0 -> 1) to the FlyingPosters internal scroll target,
 * so the posters advance as the user scrolls and rewind when scrolling
 * back up. No wheel hijacking and no Lenis manipulation are needed —
 * the pin duration is controlled purely by the wrapper height.
 *
 * Adjust `scrollLength` (in vh) to make the pinned section longer or shorter.
 *
 * Perf: the scroll-progress rAF is gated by an IntersectionObserver — it only
 * runs while the section is in (or near) the viewport. Off-screen, the rAF is
 * cancelled, eliminating per-frame getBoundingClientRect layout reads.
 */
export default function FlyingPostersSection({ items, scrollLength = 400, ...props }) {
  const sectionRef = useRef(null);
  const postersRef = useRef(null);
  const rafRef = useRef(0);
  const [inView, setInView] = useState(false);

  // Track visibility so we can stop the rAF when the section is off-screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        setInView(entry?.isIntersecting ?? false);
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !inView) return;

    const update = () => {
      const inst = postersRef.current?.getInstance?.();
      if (inst && inst.medias && inst.medias[0]) {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollable = rect.height - vh;
        const progress =
          scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
        const max = inst.medias[0].heightTotal || 0;
        inst.scroll.target = -progress * max;
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items, inView]);

  return (
    <section
      ref={sectionRef}
      className="posters-pin-section"
      style={{ height: `${scrollLength}vh` }}
    >
      <div className="posters-pin-sticky">
        <FlyingPosters ref={postersRef} items={items} disableWheel {...props} />
      </div>
    </section>
  );
}
