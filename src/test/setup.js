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

// jsdom doesn't implement ResizeObserver — DomeGallery relies on it for radius
// computation. Stub it so the component mounts without throwing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub
global.ResizeObserver = ResizeObserverStub

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
