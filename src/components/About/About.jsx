import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import CircularText from '../CircularText/CircularText.jsx'
import Shuffle from '../Shuffle/Shuffle.jsx'
import MetallicPaint from '../MetallicPaint/MetallicPaint.jsx'
import FallingText from '../FallingText/FallingText.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import evanGongIcon from '../../assets/EvanGongIcon.png'
import './About.css'

// Intro paragraph — keywords highlighted in #00f0ff (project accent).
const INTRO_KEYWORDS = [
  'programming', 'developer', 'coding', 'hardware', 'innovative', 'collaborate'
]

const INTRO_TEXT =
  "Hello! I'm Evan Gong, a teenage programming enthusiast and developer. I'm passionate about coding and creating innovative hardware projects. I am looking forward to collaborate on fun projects."

// Build intro children: split on whitespace, wrap each word in a .word span,
// color keywords #00f0ff, body text white. Mirrors Home's buildRevealChildren.
function buildIntroChildren(text, keywords) {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token)) return token
    const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isKeyword = keywords.some(k => clean === k.toLowerCase())
    return (
      <span
        key={i}
        className="about-intro__word"
        style={{ color: isKeyword ? '#00f0ff' : 'var(--color-white)' }}
      >
        {token}
      </span>
    )
  })
}

const introChildren = buildIntroChildren(INTRO_TEXT, INTRO_KEYWORDS)

// FallingText content — highlight words in #00f0ff (via About.css override of
// the official `.highlighted` class, which is `cyan` by default).
const FALLING_TEXT =
  "I enjoy sharing my knowledge with the programming community and learning from others. Feel free to explore my projects and connect with me!"

const FALLING_HIGHLIGHTS = [
  'sharing', 'programming', 'learning', 'explore', 'projects', 'connect'
]

export default function About() {
  const rafRef = useRef(null)

  // Initialize Lenis with the SAME configuration as Home's ScrollStack
  // (useWindowScroll=true branch, see ScrollStack.jsx setupLenis) so the
  // scroll behavior, easing, and feel are identical across pages. About has
  // no stacked cards, so we only drive smooth window scrolling (no scroll
  // callback needed). Cleaned up on unmount to avoid duplicate rAF loops
  // when navigating between routes.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075
    })

    const raf = time => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [])

  return (
    <section className="about-page" aria-label="About Evan Gong">
      {/* Nav-logo-adjacent decorative CircularText (fixed, top-left).
          Programming * Robotics * Photography */}
      <div className="about-circular" aria-hidden="true">
        <CircularText
          text="Programming * Robotics * Photography"
          spinDuration={20}
          onHover="speedUp"
        />
      </div>

      {/* Top-centered Shuffle title */}
      <div className="about-title">
        <Shuffle
          text="Hi, I'm Evan"
          tag="h1"
          colorTo="#00f0ff"
          shuffleDirection="right"
          duration={0.4}
          ease="power3.out"
          stagger={0.04}
          shuffleTimes={2}
          animationMode="evenodd"
          loop={false}
          triggerOnce={true}
          triggerOnHover={true}
          style={{ display: 'inline-block' }}
        />
      </div>

      {/* Left: MetallicPaint icon  |  Right: intro paragraph (vertically aligned) */}
      <div className="about-intro">
        <div className="about-intro__icon">
          <ErrorBoundary>
            <MetallicPaint
              imageSrc={evanGongIcon}
              seed={42}
              scale={4}
              patternSharpness={1}
              noiseScale={0.5}
              speed={0.3}
              liquid={0.75}
              mouseAnimation={false}
              brightness={2}
              contrast={0.5}
              refraction={0.01}
              blur={0.015}
              chromaticSpread={2}
              fresnel={1}
              angle={0}
              waveAmplitude={1}
              distortion={1}
              contour={0.2}
              lightColor="#ffffff"
              darkColor="#000000"
              tintColor="#00f0ff"
            />
          </ErrorBoundary>
        </div>

        <p className="about-intro__text">{introChildren}</p>
      </div>

      {/* Centered FallingText below icon + intro */}
      <div className="about-falling">
        <FallingText
          text={FALLING_TEXT}
          highlightWords={FALLING_HIGHLIGHTS}
          highlightClass="highlighted"
          trigger="hover"
          backgroundColor="transparent"
          wireframes={false}
          gravity={0.56}
          fontSize="clamp(1.5rem, 3vw, 2.5rem)"
          mouseConstraintStiffness={0.9}
          className="about-falling__inner"
        />
      </div>
    </section>
  )
}
