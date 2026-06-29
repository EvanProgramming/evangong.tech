import './SectionFallback.css';

// Lightweight placeholder shown while a lazy-loaded section chunk is fetching.
// minHeight is hardcoded per-section to prevent CLS (layout shift) before the
// real content mounts. Cyan pulsing dot matches the project's #00f0ff theme.
export default function SectionFallback({ minHeight = 400, label = 'Loading section' }) {
  return (
    <div
      className="section-fallback"
      style={{ minHeight }}
      role="status"
      aria-label={label}
    >
      <span className="section-fallback__dot" aria-hidden="true" />
    </div>
  );
}
