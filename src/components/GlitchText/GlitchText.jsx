import './GlitchText.css'

// React Bits GlitchText — official source verbatim, with two additive optional
// props (`afterShadow` / `beforeShadow`) that override the default colored
// text-shadows. When omitted, the component falls back to the official
// `-5px 0 red` / `5px 0 cyan` (gated by `enableShadows`), so default behavior
// is identical to the React Bits reference.
const GlitchText = ({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  afterShadow,
  beforeShadow,
  className = ''
}) => {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': afterShadow ?? (enableShadows ? '-5px 0 red' : 'none'),
    '--before-shadow': beforeShadow ?? (enableShadows ? '5px 0 cyan' : 'none')
  }

  const hoverClass = enableOnHover ? 'enable-on-hover' : ''

  return (
    <div className={`glitch ${hoverClass} ${className}`} style={inlineStyles} data-text={children}>
      {children}
    </div>
  )
}

export default GlitchText
