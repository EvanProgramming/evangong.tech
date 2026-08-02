import { useMemo } from 'react';
import Hyperspeed from '../Hyperspeed/Hyperspeed.jsx';
import ASCIIText from '../ASCIIText/ASCIIText.jsx';
import SplitText from '../SplitText/SplitText.jsx';
import ShinyText from '../ShinyText/ShinyText.jsx';
import GlassSurface from '../GlassSurface/GlassSurface.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';
import './ContactShowcase.css';

const EMAIL = 'evangonggyf@gmail.com';
const GITHUB_URL = 'https://github.com/EvanProgramming';

export default function ContactShowcase() {
  // Memoize effectOptions to avoid unnecessary re-renders and WebGL scene
  // recreations (per official React Bits Hyperspeed documentation).
  // Colors tuned to the project's cyan (#00f0ff) + white theme.
  const hyperspeedOptions = useMemo(() => ({
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0x00f0ff, 0xffffff, 0x00f0ff],
      rightCars: [0x00f0ff, 0xffffff, 0x00f0ff],
      sticks: 0x00f0ff
    }
  }), []);

  return (
    <section className="contact-section" aria-label="Contact">
      <div className="contact-rays">
        <ErrorBoundary>
          <Hyperspeed effectOptions={hyperspeedOptions} />
        </ErrorBoundary>
      </div>

      <div className="contact-grid">
        <div className="contact-left">
          <SplitText
            text="Let's build the future"
            className="contact-headline"
            textAlign="left"
          />

          <p className="contact-subtext">
            Open to collaborate. Feel free to reach out and email me for collaboration!
          </p>

          <div className="contact-actions">
            <a
              className="contact-email-link"
              href={`mailto:${EMAIL}`}
              aria-label={`Email ${EMAIL}`}
            >
              <ShinyText text={EMAIL} />
            </a>

            <div className="contact-buttons">
              <a
                className="contact-button"
                href={`mailto:${EMAIL}`}
                aria-label={`Email ${EMAIL}`}
              >
                <GlassSurface
                  width="100%"
                  height={56}
                  borderRadius={28}
                  backgroundOpacity={0.12}
                  saturation={1.6}
                  displace={1.5}
                  forceSVG={true}
                  className="contact-button__glass"
                >
                  <span className="contact-button__label">Get in touch</span>
                </GlassSurface>
              </a>
              <a
                className="contact-button"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit GitHub profile"
              >
                <GlassSurface
                  width="100%"
                  height={56}
                  borderRadius={28}
                  backgroundOpacity={0.08}
                  saturation={1.4}
                  displace={1.5}
                  forceSVG={true}
                  className="contact-button__glass"
                >
                  <span className="contact-button__label">Github</span>
                </GlassSurface>
              </a>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <ErrorBoundary>
            <ASCIIText text="Hey" enableWaves={true} asciiFontSize={8} />
          </ErrorBoundary>
        </div>
      </div>
    </section>
  );
}
