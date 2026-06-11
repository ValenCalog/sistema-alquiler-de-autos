import { useState } from 'react'

function VehicleImage({ alt, className = '', src }) {
  const [failedSrc, setFailedSrc] = useState('')
  const hasImage = Boolean(src) && failedSrc !== src

  if (!hasImage) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-center text-sm font-semibold text-[var(--color-muted)] ${className}`}
        role="img"
        aria-label={alt || 'Sin imagen disponible'}
      >
        Sin imagen disponible
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  )
}

export default VehicleImage
