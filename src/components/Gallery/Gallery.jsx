import { useEffect, useRef, useContext, useState, useCallback } from 'react'
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
  const [isReady, setIsReady] = useState(false)
  const handleGalleryReady = useCallback(() => setIsReady(true), [])

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
    <section className="gallery-page" aria-label="Photography gallery" data-page-ready={String(isReady)}>
      <div className="gallery-title">
        <h1 className="gallery-heading">GALLERY</h1>
      </div>

      <p className="gallery-intro">
        <span className="gallery-intro-text">
          Drag to spin the sphere and explore photography by location. Release to
          snap a category to the front, then tap the arrow to enter its dome.
        </span>
        <svg
          className="gallery-intro-hand"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </p>

      <div className="gallery-menu-section">
        <ErrorBoundary>
          <InfiniteMenu items={infiniteMenuItems} scale={1.5} onNavigate={onNavigate} onReady={handleGalleryReady} />
        </ErrorBoundary>
      </div>
    </section>
  )
}
