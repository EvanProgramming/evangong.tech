import TextPressure from '../TextPressure/TextPressure.jsx';
import BorderGlow from '../BorderGlow/BorderGlow.jsx';
import FluidGlass from '../FluidGlass/FluidGlass.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

import './LensesShowcase.css';

export default function LensesShowcase() {
  return (
    <section className="lenses-section" aria-label="Through the Lenses">
      <div className="lenses-title">
        <TextPressure
          text="Through the Lenses"
          flex={true}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#ffffff"
          minFontSize={36}
        />
      </div>

      <div className="lenses-fluid-wrap">
        <BorderGlow
          backgroundColor="#000000"
          borderRadius={20}
          glowColor="180 100 50"
          colors={['#00f0ff', '#ffffff', '#00f0ff']}
          className="lenses-border-glow"
        >
          <div className="lenses-fluid-inner">
            <ErrorBoundary>
              <FluidGlass mode="lens" />
            </ErrorBoundary>
          </div>
        </BorderGlow>
      </div>
    </section>
  );
}
