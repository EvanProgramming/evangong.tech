import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import PageTransition from './components/PageTransition/PageTransition.jsx'
import logoUrl from './assets/EvanGongIcon.png'
import './App.css'

// Lazy-load non-home routes so their component code (and the heavy
// WebGL/animation libs they pull in) is split into separate chunks and
// only fetched when the user navigates to them.
const About = lazy(() => import('./components/About/About.jsx'))
const Projects = lazy(() => import('./components/Projects/Projects.jsx'))

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]

// Transition phase duration (ms). Matches the transition-duration in
// PageTransition.css (1000ms) — the blur-out animation must fully settle
// before navigate() swaps the DOM.
const TRANSITION_MS = 1000

// Safety-net timeout: if a page's images stall (slow CDN, broken src), we
// still lift the overlay rather than lock the user on a blurred frame.
const IMAGE_LOAD_TIMEOUT = 8000

// Wait for every non-lazy <img> inside `container` to finish loading, then
// resolve after a double-rAF so the rendered frame is committed before the
// blur lifts. This keeps the overlay fully blurred until the next page's
// resources (HTML/CSS/JS are cached after first load; images are the variable
// cost) are actually painted, matching the "don't reveal until rendered"
// requirement. Lazy images are skipped so off-screen content can't block the
// transition.
function waitForImagesReady(container, timeout = IMAGE_LOAD_TIMEOUT) {
  return new Promise((resolve) => {
    const settle = () => requestAnimationFrame(() => requestAnimationFrame(resolve))
    if (!container) return settle()
    const imgs = Array.from(container.querySelectorAll('img'))
    const pending = imgs.filter((img) => {
      if (img.loading === 'lazy') return false
      return !img.complete || img.naturalWidth === 0
    })
    if (pending.length === 0) return settle()

    let remaining = pending.length
    let done = false
    const finish = () => {
      if (done) return
      done = true
      settle()
    }
    pending.forEach((img) => {
      const onDone = () => {
        remaining -= 1
        if (remaining === 0) finish()
      }
      img.addEventListener('load', onDone, { once: true })
      img.addEventListener('error', onDone, { once: true })
    })
    // Safety net: never let a stuck image block the reveal indefinitely.
    setTimeout(finish, timeout)
  })
}

// StaggeredMenu renders menu items as <a href={link}> (official React Bits
// implementation — left untouched). To enable client-side routing without
// modifying the official component source, we intercept clicks on
// `.sm-panel-item` at the document level (capture phase): preventDefault the
// default full-page navigation, trigger the blur-out transition, and once the
// page is fully blurred + the next page's resources are loaded, navigate and
// reveal. We also close the open menu by simulating a toggle click (the menu
// only auto-closes on full-page navigation in the original design).
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
  //   'out'            → blur 0→50 transition (old page fading out, 1s)
  //   'reveal-prepare' → overlay held at full blur 50 (no transition) while
  //                      the new page's resources load; once ready → 'reveal'
  //   'reveal'         → blur 50→0 transition (new page fading in, 1s)
  const [phase, setPhase] = useState('idle')
  const pendingNavRef = useRef(null)
  const mainRef = useRef(null)
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

  // Phase 'out': wait for the 1s blur-out to settle, then fire navigate() and
  // advance to 'reveal-prepare'. The overlay is already at full blur (50px),
  // so the DOM swap is masked; it stays blurred until resources finish.
  useEffect(() => {
    if (phase !== 'out') return
    const t = setTimeout(() => {
      const fn = pendingNavRef.current
      pendingNavRef.current = null
      if (fn) fn()
      setPhase('reveal-prepare')
    }, TRANSITION_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 'reveal-prepare': overlay is fully blurry. Wait for the new page's
  // images to load (and a double-rAF so the rendered frame commits), then
  // advance to 'reveal'. The double rAF also guarantees the snap-to-blurry
  // frame is painted before the scan begins. Covers both menu-driven nav
  // (enters here from 'out') and browser back/forward (enters from pathname
  // effect below).
  useEffect(() => {
    if (phase !== 'reveal-prepare') return
    let cancelled = false
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        waitForImagesReady(mainRef.current).then(() => {
          if (!cancelled) setPhase('reveal')
        })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
    }
  }, [phase])

  // Browser back/forward: pathname changed with no prior blur-out, so the
  // overlay is idle (blur 0). Snap it to blurry via 'reveal-prepare', which
  // then waits for resources and reveals. First mount is skipped so the
  // initial render is clean. Menu-driven nav (phase==='out' or
  // 'reveal-prepare') is left untouched here.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setPhase((prev) => (prev === 'idle' ? 'reveal-prepare' : prev))
  }, [pathname])

  // Phase 'reveal': wait for the 1s blur-in animation to finish, return idle.
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
      <main ref={mainRef}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={
            <Suspense fallback={null}>
              <About />
            </Suspense>
          } />
          <Route path="/projects" element={
            <Suspense fallback={null}>
              <Projects />
            </Suspense>
          } />
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
