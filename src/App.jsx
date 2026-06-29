import { lazy, Suspense } from 'react'
import Hero from './components/Hero/Hero.jsx'
// ScrollStack stays eager: it exposes a named export (ScrollStackItem) and is
// composed of multiple children passed as props, which makes lazy wrapping awkward.
import ScrollStack, { ScrollStackItem } from './components/ScrollStack/ScrollStack.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu.jsx'
import SectionFallback from './components/_perf/SectionFallback.jsx'
import VisibilityMount from './components/_perf/VisibilityMount.jsx'
import './App.css'

// Lazy-load below-fold sections so their chunks (and their heavy deps) are
// fetched on demand rather than blocking first paint. Hero / StaggeredMenu /
// ErrorBoundary stay eager (first-paint critical).
const ScrollVelocity = lazy(() => import('./components/ScrollVelocity/ScrollVelocity.jsx'))
const ScrollReveal = lazy(() => import('./components/ScrollReveal/ScrollReveal.jsx'))
const LogoLoop = lazy(() => import('./components/LogoLoop/LogoLoop.jsx'))
const TrueFocus = lazy(() => import('./components/TrueFocus/TrueFocus.jsx'))
const FlyingPostersSection = lazy(() => import('./components/FlyingPosters/FlyingPostersSection.jsx'))
const FlowingMenu = lazy(() => import('./components/FlowingMenu/FlowingMenu.jsx'))
const LensesShowcase = lazy(() => import('./components/LensesShowcase/LensesShowcase.jsx'))
const ContactShowcase = lazy(() => import('./components/ContactShowcase/ContactShowcase.jsx'))
const Footer = lazy(() => import('./components/Footer/Footer.jsx'))

// EvanGongIcon: 1.3MB PNG -> 256px WebP for the StaggeredMenu nav logo.
// (Hero and Footer import their own appropriately-sized variants.)
import navLogoUrl from './assets/EvanGongIcon.png?w=256&format=webp'

// FlowingMenu images (specific photography picks from subfolders).
// Transformed to 1600px WebP at build time via vite-imagetools + sharp.
// Originals ranged 152KB-3.6MB JPEG; WebP at 1600px lands ~80-200KB.
import parisImg from '/Photography/Paris/IMG_1598.jpg?w=1600&format=webp'
import chaoshanImg from '/Photography/Chaoshan/A395CF89-F602-44F6-97F0-747AD556F2C4_1_105_c.jpeg?w=1600&format=webp'
import beijingImg from '/Photography/Beijing/we-o_rd35vfjgdnyzud3fw-china-7504392.jpg?w=1600&format=webp'
import miscImg from '/Photography/Miscellaneous/639F42E1-5B22-40AE-BDF9-3974A03E2073_1_105_c.jpeg?w=1600&format=webp'

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

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]

// Simple Icons CDN: returns SVG with the specified color
const si = (slug) => `https://cdn.simpleicons.org/${slug}/ffffff`
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
  { node: txt('Canon'), title: 'Canon', href: 'https://www.canon.com' },
  { node: txt('Tamron'), title: 'Tamron', href: 'https://www.tamron.com' },
  { node: txt('Hasselblad'), title: 'Hasselblad', href: 'https://www.hasselblad.com' },
]

const aiLogos = [
  { src: si('anthropic'), alt: 'Claude', title: 'Claude', href: 'https://claude.ai' },
  { node: txt('Openclaw'), title: 'Openclaw', href: '#' },
  { node: txt('ChatGPT'), title: 'ChatGPT', href: 'https://chat.openai.com' },
  { src: si('googlegemini'), alt: 'Gemini', title: 'Gemini', href: 'https://gemini.google.com' },
  { node: txt('Grok'), title: 'Grok', href: 'https://x.ai' },
  { node: txt('Trae'), title: 'Trae', href: 'https://www.trae.ai' },
  { src: si('cursor'), alt: 'Cursor', title: 'Cursor', href: 'https://cursor.sh' },
]

// Photography images from /Photography/ folder.
// FlyingPosters renders each plane at ~320px CSS * 2 dpr = 640px, so 640px
// WebP is the right size. Originals ranged 136KB-6.3MB JPEG; 640px WebP
// lands ~30-80KB. FlyingPosters receives URL strings (shape unchanged).
const posterImages = Object.values(
  import.meta.glob('/Photography/*.{jpeg,jpg,png}', {
    eager: true,
    query: { w: 640, format: 'webp' },
    import: 'default'
  })
)

function App() {
  return (
    <div className="app">
      <StaggeredMenu
        position="right"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering={false}
        logoUrl={navLogoUrl}
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
          <Suspense fallback={<SectionFallback minHeight={200} label="Loading interests marquee" />}>
            <VisibilityMount rootMargin="200px 0px">
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
            </VisibilityMount>
          </Suspense>
        </section>

        <section className="scroll-reveal-section" aria-label="About statement">
          <div className="scroll-reveal-container">
            <Suspense fallback={<SectionFallback minHeight={400} label="Loading about statement" />}>
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
            </Suspense>
          </div>
        </section>

        <section className="scroll-stack-section" aria-label="Current projects">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={32} // 间距 = 卡片高度(20rem=320px)的 10%
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

        <section className="logo-loop-section" aria-label="Tools and brands">
          <div className="logo-loop-section__inner">
            <div className="logo-loop-row">
              <span className="logo-loop-row__label">Programming</span>
              <div className="logo-loop-row__track">
                <Suspense fallback={<SectionFallback minHeight={36} label="Loading programming logos" />}>
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
                </Suspense>
              </div>
            </div>
            <div className="logo-loop-row">
              <span className="logo-loop-row__label">Photography</span>
              <div className="logo-loop-row__track">
                <Suspense fallback={<SectionFallback minHeight={36} label="Loading photography logos" />}>
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
                </Suspense>
              </div>
            </div>
            <div className="logo-loop-row">
              <span className="logo-loop-row__label">AI</span>
              <div className="logo-loop-row__track">
                <Suspense fallback={<SectionFallback minHeight={36} label="Loading AI logos" />}>
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
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <section className="true-focus-section" aria-label="True Focus">
          <Suspense fallback={<SectionFallback minHeight={200} label="Loading True Focus" />}>
            <TrueFocus
              sentence="True Focus"
              manualMode={true}
              borderColor="#00f0ff"
            />
          </Suspense>
        </section>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback minHeight={600} label="Loading Flying Posters" />}>
            <FlyingPostersSection items={posterImages} />
          </Suspense>
        </ErrorBoundary>

        <div style={{ height: '600px', position: 'relative' }}>
          <Suspense fallback={<SectionFallback minHeight={600} label="Loading Flowing Menu" />}>
            <FlowingMenu items={flowingMenuItems} />
          </Suspense>
        </div>

        <Suspense fallback={<SectionFallback minHeight={700} label="Loading Lenses Showcase" />}>
          <LensesShowcase />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={700} label="Loading Contact" />}>
          <ContactShowcase />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={200} label="Loading Footer" />}>
          <Footer />
        </Suspense>
      </main>
    </div>
  )
}

export default App
