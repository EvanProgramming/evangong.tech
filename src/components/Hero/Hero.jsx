import Ballpit from '../Ballpit/Ballpit.jsx'
import Shuffle from '../Shuffle/Shuffle.jsx'
import RotatingText from '../RotatingText/RotatingText.jsx'
import Lanyard from '../Lanyard/Lanyard.jsx'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* Ballpit background */}
      <div className="hero-ballpit">
        <Ballpit
          count={150}
          gravity={0.5}
          friction={0.9975}
          wallBounce={0.9}
          followCursor={true}
          colors={[0x00f0ff, 0xffffff, 0x9c9c9c]}
          minSize={0.5}
          maxSize={1.5}
          maxVelocity={0.12}
        />
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
        </div>

        {/* Right side - Lanyard with EvanGongIcon on card */}
        <div className="hero-lanyard-section">
          <div className="hero-lanyard-wrapper">
            <Lanyard
              position={[0, 0, 30]}
              gravity={[0, -40, 0]}
              fov={20}
              frontImage="/assets/EvanGongIcon.png"
              backImage="/assets/EvanGongIcon.png"
              imageFit="cover"
              lanyardWidth={1.2}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
