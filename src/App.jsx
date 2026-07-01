import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
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

// StaggeredMenu renders menu items as <a href={link}> (official React Bits
// implementation — left untouched). To enable client-side routing without
// modifying the official component source, we intercept clicks on
// `.sm-panel-item` at the document level (capture phase): preventDefault the
// default full-page navigation, route via react-router's navigate(), and close
// the open menu by simulating a toggle click (the menu only auto-closes on
// full-page navigation in the original design).
function useClientSideNav() {
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
      navigate(href)

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
  }, [navigate])

  // Scroll to top on route change so each page starts at the top (mimics the
  // full-page navigation behavior the original single-page design relied on).
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
}

function Layout() {
  useClientSideNav()
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
