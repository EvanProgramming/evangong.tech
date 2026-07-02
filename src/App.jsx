import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import PageTransition from './components/PageTransition/PageTransition.jsx'
import logoUrl from './assets/EvanGongIcon.png'
import './App.css'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]

// Transition duration (ms). Must match the transition-duration in
// PageTransition.css (420ms) plus a small safety margin so the blur-out
// animation fully settles before navigate() swaps the DOM.
const TRANSITION_MS = 430

// StaggeredMenu renders menu items as <a href={link}> (official React Bits
// implementation — left untouched). To enable client-side routing without
// modifying the official component source, we intercept clicks on
// `.sm-panel-item` at the document level (capture phase): preventDefault the
// default full-page navigation, trigger the blur-out transition, and once the
// page is fully blurred, navigate() — then the blur-in reveal runs. We also
// close the open menu by simulating a toggle click (the menu only auto-closes
// on full-page navigation in the original design).
function useClientSideNav(triggerTransition) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest && e.target.closest('.sm-panel-item')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return
      // Skip external / hash / mailto links — let them navigate normally
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return

      e.preventDefault()
      // Defer the actual navigation until the blur-out transition completes;
      // triggerTransition stores the navigate fn and starts the 'out' phase.
      triggerTransition(() => navigate(href))

      // Close the StaggeredMenu if it is currently open. The wrapper exposes
      // `data-open` when the panel is visible; clicking the toggle button
      // triggers the official close animation.
      const wrapper = document.querySelector('.staggered-menu-wrapper')
      if (wrapper && wrapper.dataset.open !== undefined) {
        const toggle = wrapper.querySelector('.sm-toggle')
        if (toggle) toggle.click()
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [navigate, triggerTransition])

  // Scroll to top on route change so each page starts at the top (mimics the
  // full-page navigation behavior the original single-page design relied on).
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
}

function Layout() {
  // Transition phase state machine:
  //   'idle'           → no overlay, normal interaction
  //   'out'            → blur 0→28 transition (old page fading out)
  //   'reveal-prepare' → instantly snap to blur 28 (no transition) to mask the
  //                      freshly-mounted page; used for browser back/forward
  //                      where there was no prior blur-out phase.
  //   'reveal'         → blur 28→0 transition (new page fading in)
  const [phase, setPhase] = useState('idle')
  const pendingNavRef = useRef(null)
  const { pathname } = useLocation()
  const isFirstMount = useRef(true)

  // Start a transition: store the pending navigate fn and enter 'out' phase.
  // Ignores re-triggers while a transition is already in flight.
  const triggerTransition = useCallback((navigateFn) => {
    setPhase((prev) => {
      if (prev !== 'idle') return prev
      pendingNavRef.current = navigateFn
      return 'out'
    })
  }, [])

  // Phase 'out': wait for the blur-out animation to fully settle, then fire
  // navigate(). The pathname change below advances the state machine to the
  // reveal phase.
  useEffect(() => {
    if (phase !== 'out') return
    const t = setTimeout(() => {
      const fn = pendingNavRef.current
      pendingNavRef.current = null
      if (fn) fn()
    }, TRANSITION_MS)
    return () => clearTimeout(t)
  }, [phase])

  // On pathname change (after navigate, or browser back/forward), advance to
  // the reveal phase. First mount is skipped so the initial render is clean.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setPhase((prev) => {
      // Menu-driven nav: overlay already at blur 28 → reveal directly.
      if (prev === 'out') return 'reveal'
      // Browser back/forward: overlay is idle (blur 0) → snap to blurry first.
      if (prev === 'idle') return 'reveal-prepare'
      return prev
    })
  }, [pathname])

  // Phase 'reveal-prepare': wait one paint so the snap-to-blurry state is
  // committed, then advance to 'reveal' to animate blur 28→0. Double rAF
  // guarantees the prepare frame is painted before the transition starts.
  useEffect(() => {
    if (phase !== 'reveal-prepare') return
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('reveal'))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [phase])

  // Phase 'reveal': wait for the blur-in animation to finish, return to idle.
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => setPhase('idle'), TRANSITION_MS)
    return () => clearTimeout(t)
  }, [phase])

  useClientSideNav(triggerTransition)

  return (
    <div className="app">
      <StaggeredMenu
        position="right"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering={false}
        logoUrl={logoUrl}
        menuButtonColor="#00f0ff"
        openMenuButtonColor="#00f0ff"
        changeMenuColorOnOpen={false}
        colors={['#000000', '#00f0ff']}
        accentColor="#00f0ff"
        isFixed={true}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* Unimplemented routes fall back to Home for now */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <PageTransition phase={phase} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
