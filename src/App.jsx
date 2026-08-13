import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import PageTransition from './components/PageTransition/PageTransition.jsx'
import { NavContext } from './navContext.js'
import logoUrl from './assets/EvanGongIcon.png'
import './App.css'

// Lazy-load non-home routes so their component code (and the heavy
// WebGL/animation libs they pull in) is split into separate chunks and
// only fetched when the user navigates to them.
const About = lazy(() => import('./components/About/About.jsx'))
const Projects = lazy(() => import('./components/Projects/Projects.jsx'))
const Gallery = lazy(() => import('./components/Gallery/Gallery.jsx'))
const GalleryCategory = lazy(() => import('./components/Gallery/GalleryCategory.jsx'))
const Blog = lazy(() => import('./components/Blog/Blog.jsx'))
const BlogPost = lazy(() => import('./components/Blog/BlogPost.jsx'))
const Awards = lazy(() => import('./components/Awards/Awards.jsx'))

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
    const imgs = Array.from(container.querySelectorAll('img[data-transition-critical="true"]'))
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

const PAGE_META = {
  '/': {
    title: 'Evan Gong | Programming, AI, Robotics & Photography',
    description: 'Evan Gong builds tangible experiences across programming, AI, robotics, 3D printing, and photography.'
  },
  '/about': {
    title: 'About Evan Gong | Evan Gong',
    description: 'Learn about Evan Gong, his technical interests, creative practice, and current skills.'
  },
  '/projects': {
    title: 'Featured Projects | Evan Gong',
    description: 'Selected software, AI, robotics, hardware, and interactive projects by Evan Gong.'
  },
  '/gallery': {
    title: 'Photography Gallery | Evan Gong',
    description: 'Photography by Evan Gong from Paris, Chaoshan, Beijing, and elsewhere.'
  },
  '/blog': {
    title: 'Field Notes | Evan Gong',
    description: 'Technical notes and reflections on AI agents, hardware, software, and learning.'
  },
  '/awards': {
    title: 'Awards & Recognition | Evan Gong',
    description: 'Selected awards, competition results, program milestones, and project records.'
  },
  '/blog/hardware-agent-runtime': {
    title: 'Giving AI Agents a Safe Path to Real Hardware | Evan Gong',
    description: 'Hardware Agent Runtime connects coding agents to embedded devices through observable hardware-in-the-loop workflows.'
  },
  '/blog/kards-ai-simulator': {
    title: 'Teaching a Card Game Agent to Think in States | Evan Gong',
    description: 'Kards AI turns a complex card game into a deterministic environment for simulation and reinforcement-learning research.'
  },
  '/blog/openkyrozen-agent': {
    title: 'Building an Agent That Learns From Its Work | Evan Gong',
    description: 'OpenKyrozen explores how an AI agent can improve through the work it already performs.'
  }
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isBlogPost = pathname.startsWith('/blog/')
    const slug = isBlogPost ? pathname.split('/').filter(Boolean).at(-1) : ''
    const meta = PAGE_META[pathname] || (isBlogPost
      ? {
          title: `${slug.replace(/-/g, ' ')} | Evan Gong`,
          description: 'A field note by Evan Gong.'
        }
      : PAGE_META['/'])
    const canonicalUrl = `https://evangong.tech${pathname === '/' ? '/' : pathname}`

    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:type', isBlogPost ? 'article' : 'website')
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('name', 'twitter:card', 'summary_large_image')

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  }, [pathname])

  return null
}

function RouteFallback() {
  return <div className="route-loading" role="status" aria-live="polite">Loading page…</div>
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
      const link = e.target.closest && e.target.closest('.sm-panel-item, [data-nav-link]')
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
  const isGalleryCategory = pathname.startsWith('/gallery/')

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
    <NavContext.Provider value={triggerTransition}>
      <div className="app">
        <PageMeta />
      {!isGalleryCategory && (
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
      )}
      <main ref={mainRef}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={
            <Suspense fallback={<RouteFallback />}>
              <About />
            </Suspense>
          } />
          <Route path="/projects" element={
            <Suspense fallback={<RouteFallback />}>
              <Projects />
            </Suspense>
          } />
          <Route path="/gallery" element={
            <Suspense fallback={<RouteFallback />}>
              <Gallery />
            </Suspense>
          } />
          <Route path="/gallery/:category" element={
            <Suspense fallback={<RouteFallback />}>
              <GalleryCategory />
            </Suspense>
          } />
          <Route path="/blog" element={
            <Suspense fallback={<RouteFallback />}>
              <Blog />
            </Suspense>
          } />
          <Route path="/blog/:slug" element={
            <Suspense fallback={<RouteFallback />}>
              <BlogPost />
            </Suspense>
          } />
          <Route path="/awards" element={
            <Suspense fallback={<RouteFallback />}>
              <Awards />
            </Suspense>
          } />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isGalleryCategory && <Footer />}
      <PageTransition phase={phase} />
        </div>
    </NavContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
