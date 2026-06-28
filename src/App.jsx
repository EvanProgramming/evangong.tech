import { useEffect } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero/Hero.jsx'
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity.jsx'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import './App.css'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => { lenis.destroy() }
  }, [])

  return (
    <div className="app">
      <StaggeredMenu
        position="right"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering={false}
        menuButtonColor="#00f0ff"
        openMenuButtonColor="#00f0ff"
        changeMenuColorOnOpen={false}
        colors={['#000000', '#00f0ff']}
        accentColor="#00f0ff"
        isFixed={true}
      />
      <main>
        <Hero />
        <section className="scroll-velocity-section" aria-label="Interests marquee">
          <ScrollVelocity
            texts={[
              'Table Tennis',
              'Programming',
              'AI',
              '3D Printing',
              'Robot',
              'Photography',
            ]}
            velocity={100}
            className="scroll-velocity-text"
            damping={50}
            stiffness={400}
            numCopies={6}
          />
        </section>
      </main>
    </div>
  )
}

export default App
