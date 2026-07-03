import { useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import InfiniteMenu from '../InfiniteMenu/InfiniteMenu.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import { NavContext } from '../../navContext.js'
import { infiniteMenuItems } from './galleryData.js'
import './Gallery.css'

export default function Gallery() {
  const rafRef = useRef(null)
  const triggerTransition = useContext(NavContext)
  const navigate = useNavigate()

  // Lenis — verbatim About/Projects pattern so the scroll feel is identical
  // across pages. Cleaned up on unmount to avoid duplicate rAF loops.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075
    })

    const raf = (time) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [])

  // InfiniteMenu's action button isn't a plain <a>, so it can't reuse the
  // [data-nav-link] interceptor. Route it through NavContext so the category
  // transition uses the same blur-out → navigate → blur-in flow as the rest
  // of the site.
  const onNavigate = (link) => {
    if (triggerTransition) triggerTransition(() => navigate(link))
    else navigate(link)
  }

  return (
    <section className="gallery-page" aria-label="Photography gallery">
      <div className="gallery-title">
        <h1 className="gallery-heading">GALLERY</h1>
      </div>

      <p className="gallery-intro">
        Drag to spin the sphere and explore photography by location. Release to
        snap a category to the front, then tap the arrow to enter its dome.
      </p>

      <div className="gallery-menu-section">
        <ErrorBoundary>
          <InfiniteMenu items={infiniteMenuItems} onNavigate={onNavigate} />
        </ErrorBoundary>
      </div>
    </section>
  )
}
