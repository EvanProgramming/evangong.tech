import { useEffect, useState } from 'react';

// Pause off-screen work to keep the main thread free for visible content.
// Mirrors the proven pattern from Ballpit.jsx (_Three#g/#y/#u/#v): an
// IntersectionObserver flips a boolean when the element enters/leaves the
// viewport, and a `visibilitychange` listener pauses while the tab is hidden.
//
// Returns `isVisible` (true when the element is on screen AND the tab is
// focused). rootMargin is generous so we resume slightly before the element
// is actually visible, avoiding a flash of unmounted content on fast scroll.
export function useVisibilityPause(ref, rootMargin = '200px 0px') {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let intersecting = false;
    let tabVisible = !document.hidden;

    const update = () => setIsVisible(intersecting && tabVisible);

    const io = new IntersectionObserver(
      (entries) => {
        // Single observed element — read the latest entry.
        intersecting = entries[entries.length - 1]?.isIntersecting ?? false;
        update();
      },
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(el);

    const onVisChange = () => {
      tabVisible = !document.hidden;
      update();
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [ref, rootMargin]);

  return isVisible;
}
