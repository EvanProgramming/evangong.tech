import './PageTransition.css'

// Route transition overlay: blurs the viewport via backdrop-filter to produce
// the "old page fades to blur → content swaps → new page fades from blur"
// sequence driven by App.jsx's phase state machine.
//
// phase (controlled by App.jsx):
//   'idle'          → overlay inactive, blur 0, pointer-events pass-through
//   'out'           → add .page-transition--active → CSS transition blur 0→28
//                     (old page gradually blurs). navigate() fires once blurred.
//   'reveal-prepare'→ overlay instantly set to blur 28 (no transition) to mask
//                     the freshly-mounted page before the reveal begins. Used
//                     for browser back/forward (no prior blur-out phase).
//   'reveal'        → drop the active class → CSS transition blur 28→0
//                     (new page gradually clears). Returns to 'idle' when done.
//
// A single .page-transition--active class toggle lets the browser's CSS
// transition engine handle BOTH directions naturally, avoiding manual frame
// bookkeeping. We never apply `filter` to <main> directly — that would create a
// new stacking context and break the fixed-positioned decor inside it (e.g.
// About's .about-circular, StaggeredMenu layers).
export default function PageTransition({ phase }) {
  // "blurry" states keep the overlay at blur 28px + dark tint.
  const isBlurry = phase === 'out' || phase === 'reveal-prepare'
  // reveal-prepare must snap to blur 28 with NO transition so the reveal phase
  // can subsequently animate it back to 0.
  const noAnim = phase === 'reveal-prepare'

  const className = [
    'page-transition',
    isBlurry ? 'page-transition--active' : '',
    noAnim ? 'page-transition--no-anim' : '',
  ].filter(Boolean).join(' ')

  // Keep the actual blur value inline. The production CSS transformer can
  // rewrite backdrop-filter to a prefixed declaration that this browser does
  // not apply, leaving only the dark overlay visible.
  const blur = isBlurry ? 'blur(50px)' : 'blur(0px)'

  return (
    <div
      className={className}
      style={{ backdropFilter: blur, WebkitBackdropFilter: blur }}
      aria-hidden="true"
    />
  )
}
