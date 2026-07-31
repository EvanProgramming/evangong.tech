import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GalleryCategory from './GalleryCategory.jsx'

// Mock DomeGallery — its @use-gesture/react + ResizeObserver + DOM measurement
// logic is too heavy for a unit test and is covered by the official source.
// We only verify GalleryCategory passes the right props through.
vi.mock('../DomeGallery/DomeGallery.jsx', () => ({
  default: (props) => (
    <div data-testid="dome-gallery-mock" data-grayscale={String(props.grayscale)} data-overlay={props.overlayBlurColor}>
      DomeGallery mock — {props.images.length} images
    </div>
  ),
}))

// Helper: render GalleryCategory at a specific :category path inside a router.
function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/gallery" element={<div data-testid="gallery-root">Gallery</div>} />
        <Route path="/gallery/:category" element={<GalleryCategory />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('GalleryCategory', () => {
  it('renders the DomeGallery for a valid category', () => {
    renderAt('/gallery/paris')
    const dome = screen.getByTestId('dome-gallery-mock')
    expect(dome).toBeInTheDocument()
    expect(dome.textContent).toMatch(/DomeGallery mock — \d+ images/)
  })

  it('passes grayscale={false} to DomeGallery (Grey Scale OFF per spec)', () => {
    renderAt('/gallery/paris')
    const dome = screen.getByTestId('dome-gallery-mock')
    expect(dome.getAttribute('data-grayscale')).toBe('false')
  })

  it('passes overlayBlurColor="#000000" to match the black site palette', () => {
    renderAt('/gallery/chaoshan')
    const dome = screen.getByTestId('dome-gallery-mock')
    expect(dome.getAttribute('data-overlay')).toBe('#000000')
  })

  it('renders a "Back to Gallery" link with data-nav-link', () => {
    renderAt('/gallery/beijing')
    const back = screen.getByRole('link', { name: /back to gallery/i })
    expect(back).toHaveAttribute('href', '/gallery')
    expect(back).toHaveAttribute('data-nav-link')
  })

  it('redirects to /gallery for an unknown category', () => {
    renderAt('/gallery/tokyo')
    // The redirect target renders the gallery-root test id instead of the dome.
    expect(screen.getByTestId('gallery-root')).toBeInTheDocument()
    expect(screen.queryByTestId('dome-gallery-mock')).not.toBeInTheDocument()
  })

  it.each(['paris', 'chaoshan', 'beijing', 'miscellaneous'])(
    'renders without error for category "%s"',
    (cat) => {
      const { unmount } = renderAt(`/gallery/${cat}`)
      expect(screen.getByTestId('dome-gallery-mock')).toBeInTheDocument()
      unmount()
    }
  )

  it('the back link is positioned above the dome (z-index via class)', () => {
    renderAt('/gallery/paris')
    const back = screen.getByRole('link', { name: /back to gallery/i })
    expect(back.className).toContain('gallery-back')
  })
})
