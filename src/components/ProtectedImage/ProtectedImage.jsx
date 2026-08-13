import { useState } from 'react'
import './ProtectedImage.css'

export default function ProtectedImage({
  src,
  alt = '',
  width,
  height,
  sizes = '100vw',
  loading = 'lazy',
  fetchPriority,
  className = '',
  ...props
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className={`protected-image-fallback ${className}`} role="img" aria-label={`${alt || 'Image'} unavailable`}>
        Image unavailable
      </span>
    )
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
