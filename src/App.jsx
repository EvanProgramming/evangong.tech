import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import PageTransition from './components/PageTransition/PageTransition.jsx'
import { NavContext } from './navContext.js'
import logoUrl from './assets/EvanGongIcon.png'
import { DEFAULT_SOCIAL_IMAGE, getSeoForPath } from './seo/seo.js'
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

function waitForImagesReady(container, timeout = IMAGE_LOAD_TIMEOUT, onProgress = () => {}) {
  return new Promise((resolve) => {
    const settle = () => requestAnimationFrame(() => requestAnimationFrame(resolve))
    if (!container) {
      onProgress(1)
      return settle()
    }
    const imgs = Array.from(container.querySelectorAll('img'))
    if (imgs.length === 0) {
      onProgress(1)
      return settle()
    }

    let remaining = imgs.filter((img) => !img.complete || img.naturalWidth === 0).length
    let completed = imgs.length - remaining
    let done = false
    onProgress(completed / imgs.length)
    const finish = () => {
      if (done) return
      done = true
      onProgress(1)
      settle()
    }
    if (remaining === 0) return finish()
    imgs.filter((img) => !img.complete || img.naturalWidth === 0).forEach((img) => {
      const onDone = () => {
        remaining -= 1
        completed += 1
        onProgress(completed / imgs.length)
        if (remaining === 0) finish()
      }
      img.addEventListener('load', onDone, { once: true })
      img.addEventListener('error', onDone, { once: true })
    })
    // Safety net: never let a stuck image block the reveal indefinitely.
    setTimeout(finish, timeout)
  })
}

function waitForFrames(count = 3) {
  return new Promise((resolve) => {
    const next = () => {
      if (count-- <= 0) return resolve()
      requestAnimationFrame(next)
    }
    next()
  })
}

function waitForPageReady(container, timeout = IMAGE_LOAD_TIMEOUT) {
  return new Promise((resolve) => {
    if (!container) return resolve()
    const pending = () => container.querySelector('[data-page-ready="false"]')
    if (!pending()) return resolve()

    const observer = new MutationObserver(() => {
      if (!pending()) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(container, { subtree: true, attributes: true, attributeFilter: ['data-page-ready'] })
    setTimeout(() => {
      observer.disconnect()
      resolve()
    }, timeout)
  })
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
    const meta = getSeoForPath(pathname)
    const title = meta?.title || 'Page not found | Evan Gong'
    const description = meta?.description || 'The requested page could not be found on evangong.tech.'
    const canonicalUrl = meta?.canonical || 'https://evangong.tech/404'

    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', meta?.article ? 'article' : 'website')
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', meta?.image || DEFAULT_SOCIAL_IMAGE)
    setMeta('property', 'og:site_name', 'Evan Gong')
    setMeta('property', 'og:locale', 'en_US')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', meta?.image || DEFAULT_SOCIAL_IMAGE)

    let robots = document.head.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = meta ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'

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
  const [phase, setPhase] = useState('reveal-prepare')
  const [loadProgress, setLoadProgress] = useState(0)
  const pendingNavRef = useRef(null)
  const mainRef = useRef(null)
  const { pathname } = useLocation()
  const isFirstMount = useRef(true)
  const isGalleryCategory = pathname.startsWith('/gallery/')

  // Start a transition: store the pending navigate fn and enter 'out' phase.
  // Ignores re-triggers while a transition is already in flight.
  const triggerTransition = useCallback((navigateFn) => {
    setLoadProgress(0)
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
    setLoadProgress(8)
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        Promise.all([
          waitForPageReady(mainRef.current),
          waitForImagesReady(mainRef.current, IMAGE_LOAD_TIMEOUT, (progress) => {
            if (!cancelled) setLoadProgress(8 + progress * 72)
          }),
          document.fonts?.ready || Promise.resolve(),
          waitForFrames(),
        ]).then(() => {
          if (!cancelled) {
            setLoadProgress(100)
            setPhase('reveal')
          }
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
  // then waits for resources and reveals. First mount already starts blurred.
  // Menu-driven nav (phase==='out' or
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
            <Suspense fallback={null}>
              <About />
            </Suspense>
          } />
          <Route path="/projects" element={
            <Suspense fallback={null}>
              <Projects />
            </Suspense>
          } />
          <Route path="/gallery" element={
            <Suspense fallback={null}>
              <Gallery />
            </Suspense>
          } />
          <Route path="/gallery/:category" element={
            <Suspense fallback={null}>
              <GalleryCategory />
            </Suspense>
          } />
          <Route path="/blog" element={
            <Suspense fallback={null}>
              <Blog />
            </Suspense>
          } />
          <Route path="/blog/:slug" element={
            <Suspense fallback={null}>
              <BlogPost />
            </Suspense>
          } />
          <Route path="/awards" element={
            <Suspense fallback={null}>
              <Awards />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isGalleryCategory && <Footer />}
      <PageTransition phase={phase} progress={loadProgress} />
        </div>
    </NavContext.Provider>
  )
}

export function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Page not found</h1>
      <p>The page you requested does not exist.</p>
      <a href="/" data-nav-link>Return home</a>
    </section>
  )
}

export { Layout }

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
