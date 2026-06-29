import { useRef, useState, useEffect } from 'react';

// Mounts children only when they're near the viewport, unmounts when they
// scroll far away. Used for raw-canvas WebGL components (Hyperspeed,
// ASCIIText) whose rAF loops can't be paused from outside without touching
// React Bits internals. Those components already guard their async init with
// `disposed` / `cancelled` flags, so a clean unmount + remount is safe.
//
// Unlike useVisibilityPause (which keeps the component mounted and gates its
// rAF), this fully unmounts the children — freeing their WebGL context,
// geometries, and materials when off-screen.
//
// rootMargin is generous so we mount slightly before the element scrolls
// into view (no flash of empty content on fast scroll) and keep it mounted
// briefly after it scrolls away (don't churn on slow scroll bounce).
export default function VisibilityMount({
  children,
  rootMargin = '300px 0px',
  fallback = null,
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry?.isIntersecting) setShouldMount(true);
      },
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(el);

    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Tag ref={ref} {...props}>
      {shouldMount ? children : fallback}
    </Tag>
  );
}
