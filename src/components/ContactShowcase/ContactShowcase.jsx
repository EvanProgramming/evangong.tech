import PixelBlast from '../PixelBlast/PixelBlast.jsx';
import ASCIIText from '../ASCIIText/ASCIIText.jsx';
import SplitText from '../SplitText/SplitText.jsx';
import ShinyText from '../ShinyText/ShinyText.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';
import './ContactShowcase.css';

const EMAIL = 'evangonggyf@gmail.com';

export default function ContactShowcase() {
  return (
    <section className="contact-section" aria-label="Contact">
      <div className="contact-rays">
        <ErrorBoundary>
          <PixelBlast color="#00f0ff" />
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
