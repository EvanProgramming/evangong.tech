import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import './index.css'
import App from './App.jsx'

// Disable GSAP's lag smoothing so that after a tab is backgrounded and
// refocused, animations don't try to "catch up" by jumping forward in a
// single frame (which can cause a long task / jank). Animations continue
// from the current time instead.
gsap.ticker.lagSmoothing(false)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
