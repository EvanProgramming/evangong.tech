import TextPressure from '../TextPressure/TextPressure.jsx';
import BorderGlow from '../BorderGlow/BorderGlow.jsx';
import FluidGlass from '../FluidGlass/FluidGlass.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

import lensesPhoto from '/Photography/Chaoshan/BF32147D-89AC-46F1-BF67-C14D84E88B48_1_105_c.jpeg?w=1280&format=webp';

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
              <FluidGlass mode="lens" image={lensesPhoto} />
            </ErrorBoundary>
          </div>
        </BorderGlow>
      </div>
    </section>
  );
}
