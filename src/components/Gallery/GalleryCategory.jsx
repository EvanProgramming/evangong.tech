import { useParams, Navigate } from 'react-router-dom'
import DomeGallery from '../DomeGallery/DomeGallery.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import { isValidCategory, getCategory, getCategoryImages } from './galleryData.js'
import './GalleryCategory.css'

// Dome Gallery category page — full-viewport, no Nav, no Footer (App.jsx
// suppresses both for /gallery/<category>). The back link is a plain
// <a data-nav-link> so it reuses the site-wide blur transition interceptor.
export default function GalleryCategory() {
  const { category } = useParams()

  if (!isValidCategory(category)) {
    return <Navigate to="/gallery" replace />
  }

  const cat = getCategory(category)
  const images = getCategoryImages(category)

  return (
    <section className="gallery-dome-page" aria-label={`${cat.label} photo gallery`} data-wait-for-lazy-images>
      <header className="gallery-dome-heading">
        <h1>{cat.label} Photography</h1>
        <p>{cat.description}</p>
      </header>
      <a href="/gallery" data-nav-link className="gallery-back" aria-label="Back to gallery">
        <span className="gallery-back-arrow" aria-hidden="true">←</span>
        <span className="gallery-back-label">Back to Gallery</span>
      </a>

      <div className="gallery-dome-wrap">
        <ErrorBoundary>
          <DomeGallery
            images={images}
            grayscale={false}
            overlayBlurColor="#000000"
            fit={1.35}
            fitBasis="min"
            padFactor={0.02}
            minRadius={320}
          />
        </ErrorBoundary>
      </div>
    </section>
  )
}
