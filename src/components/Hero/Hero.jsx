import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavContext } from '../../navContext.js'
import Ballpit from '../Ballpit/Ballpit.jsx'
import Shuffle from '../Shuffle/Shuffle.jsx'
import RotatingText from '../RotatingText/RotatingText.jsx'
import Lanyard from '../Lanyard/Lanyard.jsx'
import GradualBlur from '../GradualBlur/GradualBlur.jsx'
import GlassSurface from '../GlassSurface/GlassSurface.jsx'
import ShinyText from '../ShinyText/ShinyText.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import evanGongIcon from '../../assets/EvanGongIcon.png'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate()
  const triggerTransition = useContext(NavContext)
  const navTo = (path) => {
    if (triggerTransition) {
      triggerTransition(() => navigate(path))
    } else {
      navigate(path)
    }
  };

  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowScroll(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      {/* Ballpit background */}
      <div className="hero-ballpit">
        <ErrorBoundary>
          <Ballpit
            count={150}
            gravity={0.5}
            friction={0.9975}
            wallBounce={0.9}
            followCursor={true}
            colors={[0x00f0ff, 0xffffff, 0x9c9c9c]}
            ambientIntensity={0.4}
            lightIntensity={80}
            minSize={0.5}
            maxSize={1.5}
            maxVelocity={0.12}
          />
        </ErrorBoundary>
      </div>

      {/* Content overlay */}
      <div className="hero-content">
        {/* Left side - title */}
        <div className="hero-title-section">
          <h1 className="hero-title" style={{ lineHeight: 1.1 }}>
            <Shuffle
              text="Evan Gong"
              tag="span"
              colorTo="#00f0ff"
              shuffleDirection="right"
              duration={0.4}
              ease="power3.out"
              stagger={0.04}
              shuffleTimes={2}
              animationMode="evenodd"
              loop={true}
              loopDelay={5}
              triggerOnce={false}
              triggerOnHover={true}
              style={{ display: 'inline', fontSize: 'inherit', lineHeight: 1 }}
            />
          </h1>
          <div className="hero-subtitle">
            <RotatingText
              texts={['Programming', 'AI', '3D Printing', 'Robot', 'Photography', 'Table Tennis']}
              rotationInterval={2500}
              staggerDuration={0.02}
              staggerFrom="last"
              splitBy="characters"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              mainClassName="rotating-subtitle"
            />
          </div>

          <div className="hero-buttons">
            <button type="button" className="hero-button" onClick={() => navTo('/projects')}>
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={28}
                backgroundOpacity={0.12}
                saturation={1.6}
                displace={1.5}
                className="hero-button__glass"
              >
                <span className="hero-button__label">View Projects</span>
              </GlassSurface>
            </button>
            <button type="button" className="hero-button" onClick={() => navTo('/about')}>
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={28}
                backgroundOpacity={0.08}
                saturation={1.4}
                displace={1.5}
                className="hero-button__glass"
              >
                <span className="hero-button__label">About me</span>
              </GlassSurface>
            </button>
          </div>
        </div>

        {/* Right side - Lanyard with EvanGongIcon on card */}
        <div className="hero-lanyard-section">
          <div className="hero-lanyard-wrapper">
            <ErrorBoundary>
              <Lanyard
                position={[0, 0, 25]}
                gravity={[0, -40, 0]}
                fov={20}
                frontImage={evanGongIcon}
                backImage={evanGongIcon}
                imageFit="cover"
                lanyardWidth={1.2}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Gradual blur overlay anchored to the top of the screen */}
      <GradualBlur
        target="parent"
        position="top"
        height="6rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential={true}
        opacity={1}
        zIndex={30}
      />

      {/* Scroll-down indicator */}
      <div className={`hero-scroll-indicator${showScroll ? ' visible' : ''}`}>
        <GlassSurface
          width={48}
          height={48}
          borderRadius={24}
          backgroundOpacity={0.15}
          saturation={1.4}
          displace={1.5}
          className="scroll-glass"
        >
          <div className="scroll-arrow" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </GlassSurface>
        <ShinyText text="scroll" />
      </div>
    </section>
  )
}
