import PixelBlast from '../PixelBlast/PixelBlast.jsx';
import ASCIIText from '../ASCIIText/ASCIIText.jsx';
import SplitText from '../SplitText/SplitText.jsx';
import ShinyText from '../ShinyText/ShinyText.jsx';
import GlassSurface from '../GlassSurface/GlassSurface.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';
import './ContactShowcase.css';

const EMAIL = 'evangonggyf@gmail.com';
const GITHUB_URL = 'https://github.com/EvanProgramming';

export default function ContactShowcase() {
  return (
    <section className="contact-section" aria-label="Contact">
      <div className="contact-rays">
        <ErrorBoundary>
          <PixelBlast
            color="#00f0ff"
            patternDensity={1.6}
            edgeFade={0.2}
          />
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
              aria-label="Get in touch via email"
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={28}
                backgroundOpacity={0.12}
                saturation={1.6}
                displace={1.5}
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
              aria-label="Visit my GitHub profile"
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={28}
                backgroundOpacity={0.08}
                saturation={1.4}
                displace={1.5}
                className="contact-button__glass"
              >
                <span className="contact-button__label">Github</span>
              </GlassSurface>
            </a>
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
