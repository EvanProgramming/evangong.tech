import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProtectedImage from './ProtectedImage.jsx'

describe('ProtectedImage', () => {
  it('renders intrinsic dimensions and loading hints', () => {
    render(
      <ProtectedImage
        src="/Photography/Beijing/DSC01020.jpeg"
        alt="Beijing photograph"
        width={1068}
        height={1600}
        sizes="50vw"
      />
    )

    const image = screen.getByRole('img', { name: 'Beijing photograph' })
    expect(image).toHaveAttribute('width', '1068')
    expect(image).toHaveAttribute('height', '1600')
    expect(image).toHaveAttribute('sizes', '50vw')
    expect(image).toHaveAttribute('decoding', 'async')
  })

  it('shows an accessible fallback when the image cannot load', () => {
    render(<ProtectedImage src="/missing.jpeg" alt="Missing photograph" />)

    fireEvent.error(screen.getByRole('img', { name: 'Missing photograph' }))

    expect(screen.getByRole('img', { name: 'Missing photograph unavailable' })).toHaveTextContent('Image unavailable')
  })
})
