import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import Projects from './components/Projects/Projects.jsx'
import Gallery from './components/Gallery/Gallery.jsx'
import GalleryCategory from './components/Gallery/GalleryCategory.jsx'
import PageTransition from './components/PageTransition/PageTransition.jsx'
import { NavContext } from './navContext.js'
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

const TRANSITION_MS = 1000
const IMAGE_LOAD_TIMEOUT = 8000

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
    setTimeout(finish, timeout)
  })
}

function useClientSideNav(triggerTransition) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest && e.target.closest('.sm-panel-item, [data-nav-link]')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return

      e.preventDefault()
      triggerTransition(() => navigate(href))

      const wrapper = document.querySelector('.staggered-menu-wrapper')
      if (wrapper && wrapper.dataset.open !== undefined) {
        const toggle = wrapper.querySelector('.sm-toggle')
        if (toggle) toggle.click()
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [navigate, triggerTransition])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
}

function Layout() {
  const [phase, setPhase] = useState('idle')
  const pendingNavRef = useRef(null)
  const mainRef = useRef(null)
  const { pathname } = useLocation()
  const isFirstMount = useRef(true)

  const triggerTransition = useCallback((navigateFn) => {
    setPhase((prev) => {
      if (prev !== 'idle') return prev
      pendingNavRef.current = navigateFn
      return 'out'
    })
  }, [])

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

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setPhase((prev) => (prev === 'idle' ? 'reveal-prepare' : prev))
  }, [pathname])

  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => setPhase('idle'), TRANSITION_MS)
    return () => clearTimeout(t)
  }, [phase])

  useClientSideNav(triggerTransition)

  const isGalleryArea = pathname.startsWith('/gallery')
  const isDomeRoute = /^\/gallery\/.+/.test(pathname)

  return (
    <NavContext.Provider value={triggerTransition}>
      <div className="app">
        {!isDomeRoute && (
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
            activePath={pathname}
          />
        )}
        <main ref={mainRef}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:category" element={<GalleryCategory />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        {!isGalleryArea && <Footer />}
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
