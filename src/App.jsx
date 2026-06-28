import Hero from './components/Hero/Hero.jsx'
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity.jsx'
import ScrollReveal from './components/ScrollReveal/ScrollReveal.jsx'
import ScrollStack, { ScrollStackItem } from './components/ScrollStack/ScrollStack.jsx'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import './App.css'

// Pre-split the reveal text into .word spans so we can color keywords (#00f0ff)
// differently from the body text (white). The ScrollReveal component passes
// non-string children through unchanged and still animates .word elements via GSAP.
const REVEAL_KEYWORDS = ['physical', 'digital', 'robotic', '3D', 'prints', 'camera', 'tangible', 'tomorrow']

function buildRevealChildren(text, keywords) {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token)) return token
    const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isKeyword = keywords.some(k => clean === k.toLowerCase())
    return (
      <span
        key={i}
        className="word"
        style={{ color: isKeyword ? '#00f0ff' : 'var(--color-white)' }}
      >
        {token}
      </span>
    )
  })
}

const revealChildren = buildRevealChildren(
  "Bridging the physical and digital worlds. From robotic algorithms and 3D prints to the split-second frames of a camera, I design and build tangible experiences for tomorrow.",
  REVEAL_KEYWORDS
)

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]

function App() {
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
              <span style={{ color: 'var(--color-white)' }}>Table Tennis &nbsp;•&nbsp; Programming &nbsp;•&nbsp; AI</span>,
              <span style={{ color: '#00f0ff' }}>3D Printing &nbsp;•&nbsp; Robot &nbsp;•&nbsp; Photography</span>,
            ]}
            velocity={100}
            className="scroll-velocity-text"
            damping={50}
            stiffness={400}
            numCopies={6}
          />
        </section>

        <section className="scroll-reveal-section" aria-label="About statement">
          <div className="scroll-reveal-container">
            <ScrollReveal
              baseOpacity={0}
              enableBlur={true}
              baseRotation={5}
              blurStrength={10}
              containerClassName="scroll-reveal-container__title"
              textClassName="scroll-reveal-container__text"
            >
              {revealChildren}
            </ScrollReveal>
          </div>
        </section>

        <section className="scroll-stack-section" aria-label="Current projects">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={80}
            itemScale={0.01}
            itemStackDistance={0}
            baseScale={0.95}
            blurAmount={0}
            className="scroll-stack-section__scroller"
          >
            <ScrollStackItem itemClassName="project-card--cyan">
              <div className="project-card">
                <span className="project-card__index">01</span>
                <div className="project-card__body">
                  <h3 className="project-card__title">OpenKyrozen</h3>
                  <p className="project-card__desc">A self-learning AI Agent that adapts and grows through autonomous exploration.</p>
                </div>
                <span className="project-card__tag">AI</span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem itemClassName="project-card--white">
              <div className="project-card">
                <span className="project-card__index">02</span>
                <div className="project-card__body">
                  <h3 className="project-card__title">Sona</h3>
                  <p className="project-card__desc">A Siri-like comprehensive personal assistant for your computer.</p>
                </div>
                <span className="project-card__tag">Assistant</span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem itemClassName="project-card--cyan">
              <div className="project-card">
                <span className="project-card__index">03</span>
                <div className="project-card__body">
                  <h3 className="project-card__title">Anti-Fire Drone System</h3>
                  <p className="project-card__desc">An autonomous fire-extinguishing drone system for rapid response.</p>
                </div>
                <span className="project-card__tag">Robotics</span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem itemClassName="project-card--white">
              <div className="project-card">
                <span className="project-card__index">04</span>
                <div className="project-card__body">
                  <h3 className="project-card__title">Campus Studio</h3>
                  <p className="project-card__desc">A work assignment platform for school photography studios.</p>
                </div>
                <span className="project-card__tag">Web</span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem itemClassName="project-card--cyan">
              <div className="project-card">
                <div className="project-card__body project-card__body--center">
                  <h3 className="project-card__title">Open To Collaborate!</h3>
                  <p className="project-card__desc">Have an idea? Let&apos;s build something tangible together.</p>
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </section>
      </main>
    </div>
  )
}

export default App
