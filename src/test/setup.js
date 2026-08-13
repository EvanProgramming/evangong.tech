import '@testing-library/jest-dom'

// jsdom doesn't implement matchMedia — components that query it would throw.
// Provide a stub so any responsive hook (e.g. useMediaQuery) gets a sane default.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Keep WebGL/Canvas tests deterministic without jsdom's noisy unimplemented
// getContext warning. Individual component tests provide their own richer
// canvas stubs when they need a drawing context.
HTMLCanvasElement.prototype.getContext = () => null

// jsdom doesn't implement ResizeObserver — DomeGallery relies on it for radius
// computation. Stub it so the component mounts without throwing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub
global.ResizeObserver = ResizeObserverStub

// jsdom doesn't implement IntersectionObserver — visibility-driven WebGL
// components use it to pause work when they leave the viewport.
class IntersectionObserverStub {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverStub
global.IntersectionObserver = IntersectionObserverStub

// requestAnimationFrame stub — jsdom's rAF returns undefined which breaks
// cancelAnimationFrame. Mirror the browser contract.
if (!global.requestAnimationFrame) {
  let id = 0
  global.requestAnimationFrame = (cb) => {
    id += 1
    const handle = id
    setTimeout(() => cb(performance.now()), 0)
    return handle
  }
  global.cancelAnimationFrame = (handle) => clearTimeout(handle)
}
