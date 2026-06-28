import SideRays from '../SideRays/SideRays.jsx';
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
          <SideRays />
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
              className="contact-button-link"
              href={`mailto:${EMAIL}`}
              aria-label="Get in touch via email"
            >
              <GlassSurface>
                <span className="contact-button-label">Get in touch</span>
              </GlassSurface>
            </a>
            <a
              className="contact-button-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my GitHub profile"
            >
              <GlassSurface>
                <span className="contact-button-label">Github</span>
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
