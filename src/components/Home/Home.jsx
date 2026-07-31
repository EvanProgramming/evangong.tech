import Hero from '../Hero/Hero.jsx'
import ScrollVelocity from '../ScrollVelocity/ScrollVelocity.jsx'
import ScrollReveal from '../ScrollReveal/ScrollReveal.jsx'
import ScrollStack, { ScrollStackItem } from '../ScrollStack/ScrollStack.jsx'
import LogoLoop from '../LogoLoop/LogoLoop.jsx'
import TrueFocus from '../TrueFocus/TrueFocus.jsx'
import FlyingPostersSection from '../FlyingPosters/FlyingPostersSection.jsx'
import FlowingMenu from '../FlowingMenu/FlowingMenu.jsx'
import LensesShowcase from '../LensesShowcase/LensesShowcase.jsx'
import ContactShowcase from '../ContactShowcase/ContactShowcase.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'

// FlowingMenu images (specific photography picks from subfolders)
import parisImg from '/Photography/Paris/IMG_1598.jpg'
import chaoshanImg from '/Photography/Chaoshan/A395CF89-F602-44F6-97F0-747AD556F2C4_1_105_c.jpeg'
import beijingImg from '/Photography/Beijing/we-o_rd35vfjgdnyzud3fw-china-7504392.jpg'
import miscImg from '/Photography/Miscellaneous/639F42E1-5B22-40AE-BDF9-3974A03E2073_1_105_c.jpeg'

const flowingMenuItems = [
  { link: '#', text: 'Paris, France', image: parisImg },
  { link: '#', text: 'Chaoshan, China', image: chaoshanImg },
  { link: '#', text: 'Beijing, China', image: beijingImg },
  { link: '#', text: 'Miscellaneous', image: miscImg },
]

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

// Simple Icons served locally from public/icons/ — cdn.simpleicons.org is
// unreachable in the browser network (ERR_ABORTED) even though server-side
// curl succeeds. SVGs are pre-colored white (fill="#ffffff").
const si = (slug) => `/icons/${slug}.svg`
// Text fallback for brands not on Simple Icons
const txt = (label) => <span className="logo-text">{label}</span>

const programmingLogos = [
  { src: si('vercel'), alt: 'Vercel', title: 'Vercel', href: 'https://vercel.com' },
  { src: si('vite'), alt: 'Vite', title: 'Vite', href: 'https://vitejs.dev' },
  { src: si('react'), alt: 'React', title: 'React', href: 'https://react.dev' },
  { src: si('vuedotjs'), alt: 'Vue', title: 'Vue', href: 'https://vuejs.org' },
  { src: si('python'), alt: 'Python', title: 'Python', href: 'https://python.org' },
  { src: si('cplusplus'), alt: 'C++', title: 'C++', href: 'https://isocpp.org' },
  { src: si('openjdk'), alt: 'Java', title: 'Java', href: 'https://www.java.com' },
  { src: si('github'), alt: 'GitHub', title: 'GitHub', href: 'https://github.com' },
  { node: txt('CIFAR'), title: 'CIFAR', href: 'https://www.cs.toronto.edu/~kriz/cifar.html' },
  { src: si('c'), alt: 'C', title: 'C', href: 'https://en.wikipedia.org/wiki/C_(programming_language)' },
]

const photographyLogos = [
  { src: si('sony'), alt: 'Sony', title: 'Sony', href: 'https://www.sony.com' },
  { src: si('nikon'), alt: 'Nikon', title: 'Nikon', href: 'https://www.nikon.com' },
  { src: si('canon'), alt: 'Canon', title: 'Canon', href: 'https://www.canon.com' },
  { src: si('tamron'), alt: 'Tamron', title: 'Tamron', href: 'https://www.tamron.com' },
  { src: si('hasselblad'), alt: 'Hasselblad', title: 'Hasselblad', href: 'https://www.hasselblad.com' },
]

const aiLogos = [
  { src: si('anthropic'), alt: 'Claude', title: 'Claude', href: 'https://claude.ai' },
  { node: txt('Openclaw'), title: 'Openclaw', href: '#' },
  { src: si('openai'), alt: 'ChatGPT', title: 'ChatGPT', href: 'https://chat.openai.com' },
  { src: si('googlegemini'), alt: 'Gemini', title: 'Gemini', href: 'https://gemini.google.com' },
  { src: si('grok'), alt: 'Grok', title: 'Grok', href: 'https://x.ai' },
  { node: txt('Trae'), title: 'Trae', href: 'https://www.trae.ai' },
  { src: si('cursor'), alt: 'Cursor', title: 'Cursor', href: 'https://cursor.sh' },
]

// Photography images from /Photography/ folder
const posterImages = Object.values(
  import.meta.glob('/Photography/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })
)

export default function Home() {
  return (
    <>
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
                <h3 className="project-card__title">Kyrozen</h3>
                <p className="project-card__desc">An AI-driven product development platform that takes you from a fuzzy problem to a real software or hardware prototype.</p>
              </div>
              <span className="project-card__tag">AI</span>
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
            <a href="https://github.com/EvanProgramming/OverflowBar" target="_blank" rel="noopener noreferrer" className="project-card">
              <span className="project-card__index">04</span>
              <div className="project-card__body">
                <h3 className="project-card__title">OverflowBar</h3>
                <p className="project-card__desc">A macOS menu bar icon overflow manager for a cleaner status bar.</p>
              </div>
              <span className="project-card__tag">macOS</span>
            </a>
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
        <div className="scroll-stack-cta-wrap">
          <a href="/projects" data-nav-link className="scroll-stack-cta">
            <span>View All Projects</span>
            <span className="scroll-stack-cta__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="logo-loop-section" aria-label="Tools and brands">
        <div className="logo-loop-section__inner">
          <div className="logo-loop-row">
            <span className="logo-loop-row__label">Programming</span>
            <div className="logo-loop-row__track">
              <LogoLoop
                logos={programmingLogos}
                speed={80}
                direction="left"
                logoHeight={36}
                gap={48}
                hoverSpeed={20}
                scaleOnHover
                fadeOut
                fadeOutColor="#000000"
                ariaLabel="Programming logos"
              />
            </div>
          </div>
          <div className="logo-loop-row">
            <span className="logo-loop-row__label">Photography</span>
            <div className="logo-loop-row__track">
              <LogoLoop
                logos={photographyLogos}
                speed={70}
                direction="right"
                logoHeight={36}
                gap={48}
                hoverSpeed={-20}
                scaleOnHover
                fadeOut
                fadeOutColor="#000000"
                ariaLabel="Photography logos"
              />
            </div>
          </div>
          <div className="logo-loop-row">
            <span className="logo-loop-row__label">AI</span>
            <div className="logo-loop-row__track">
              <LogoLoop
                logos={aiLogos}
                speed={80}
                direction="left"
                logoHeight={36}
                gap={48}
                hoverSpeed={20}
                scaleOnHover
                fadeOut
                fadeOutColor="#000000"
                ariaLabel="AI logos"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="true-focus-section" aria-label="True Focus">
        <TrueFocus
          sentence="True Focus"
          manualMode={true}
          borderColor="#00f0ff"
        />
      </section>

      <ErrorBoundary>
        <FlyingPostersSection items={posterImages} />
      </ErrorBoundary>

      <div style={{ height: '600px', position: 'relative' }}>
        <FlowingMenu items={flowingMenuItems} />
      </div>

      <LensesShowcase />

      <ContactShowcase />
    </>
  )
}
