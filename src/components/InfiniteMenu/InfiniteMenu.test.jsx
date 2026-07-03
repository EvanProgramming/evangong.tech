import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor, act } from '@testing-library/react'
import InfiniteMenu from './InfiniteMenu.jsx'

// InfiniteMenu is a WebGL2 component (gl-matrix + raw WebGL2 shaders). jsdom has
// no WebGL2 implementation, so we stub canvas.getContext('webgl2') with a Proxy
// that returns no-op functions for any GL method and dummy objects for create*.
// This lets the InfiniteGridMenu constructor run far enough to start the rAF
// loop, which in turn fires onActiveItemChange → setActiveItem, rendering the
// action button we need to click to test the onNavigate callback.

function createFakeGLContext(canvas) {
  // GL constants the source references. Values don't matter — the stubs ignore them.
  const constants = {
    VERTEX_SHADER: 35633, FRAGMENT_SHADER: 35632, COMPILE_STATUS: 35713,
    LINK_STATUS: 35714, ARRAY_BUFFER: 34962, ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044, DYNAMIC_DRAW: 35048, TEXTURE_2D: 3553,
    TEXTURE_WRAP_S: 10242, TEXTURE_WRAP_T: 10243, TEXTURE_MIN_FILTER: 10241,
    TEXTURE_MAG_FILTER: 10240, CLAMP_TO_EDGE: 33071, LINEAR: 9729,
    RGBA: 6408, UNSIGNED_BYTE: 5121, FLOAT: 5126, TRIANGLES: 4,
    UNSIGNED_SHORT: 5123, CULL_FACE: 2884, DEPTH_TEST: 2929,
    COLOR_BUFFER_BIT: 16384, DEPTH_BUFFER_BIT: 256, TEXTURE0: 33984,
    SEPARATE_ATTRIBS: 35981,
  }

  const target = {
    ...constants,
    canvas,
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    // Parameter queries must return truthy "success" so init doesn't bail.
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getAttribLocation: () => 0,
    getUniformLocation: () => ({}),
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    getContextAttributes: () => ({ alpha: false, antialias: true }),
  }

  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop]
      // Any unlisted method becomes a no-op. create* return a dummy handle.
      return (..._args) => {
        if (typeof prop === 'string' && (prop.startsWith('create') || prop === 'getParameter')) {
          return {}
        }
        return undefined
      }
    },
  })
}

describe('InfiniteMenu', () => {
  let originalGetContext

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (type === 'webgl2') return createFakeGLContext(this)
      return originalGetContext.call(this, type)
    }
    // Give the canvas a non-zero size so resizeCanvasToDisplaySize doesn't loop.
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', {
      configurable: true,
      get() { return 800 },
    })
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', {
      configurable: true,
      get() { return 600 },
    })
  })

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
    vi.restoreAllMocks()
  })

  const testItems = [
    { image: '/img/paris.jpg', link: '/gallery/paris', title: 'Paris, France', description: 'City of light.' },
    { image: '/img/chaoshan.jpg', link: '/gallery/chaoshan', title: 'Chaoshan, China', description: 'Coastal calm.' },
  ]

  it('renders a canvas with id "infinite-grid-menu-canvas"', () => {
    render(<InfiniteMenu items={testItems} />)
    const canvas = document.getElementById('infinite-grid-menu-canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas.tagName).toBe('CANVAS')
  })

  it('calls onNavigate with the active item link when the action button is clicked', async () => {
    const onNavigate = vi.fn()
    render(<InfiniteMenu items={testItems} onNavigate={onNavigate} />)

    // The rAF loop fires onActiveItemChange → setActiveItem, which renders the
    // action button. Wait for it to appear.
    const button = await waitFor(() => {
      const el = document.querySelector('.action-button.active')
      if (!el) throw new Error('action button not active yet')
      return el
    }, { timeout: 2000 })

    expect(button).toBeTruthy()

    await act(async () => {
      fireEvent.click(button)
    })

    expect(onNavigate).toHaveBeenCalledTimes(1)
    // The link should be one of the internal routes (not window.open'd).
    const calledLink = onNavigate.mock.calls[0][0]
    expect(calledLink).toMatch(/^\/gallery\//)
  })

  it('opens external http links via window.open instead of onNavigate', async () => {
    const onNavigate = vi.fn()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const externalItems = [
      { image: '/img/a.jpg', link: 'https://example.com/', title: 'External', description: 'Ext.' },
    ]
    render(<InfiniteMenu items={externalItems} onNavigate={onNavigate} />)

    const button = await waitFor(() => {
      const el = document.querySelector('.action-button.active')
      if (!el) throw new Error('action button not active yet')
      return el
    }, { timeout: 2000 })

    await act(async () => {
      fireEvent.click(button)
    })

    expect(openSpy).toHaveBeenCalledWith('https://example.com/', '_blank')
    expect(onNavigate).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('renders inside a relative-positioned full-size container', () => {
    const { container } = render(<InfiniteMenu items={testItems} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveStyle({ position: 'relative', width: '100%', height: '100%' })
  })
})

// Separate suite: without a WebGL2 mock, the InfiniteGridMenu constructor
// throws "No WebGL 2 context!". In production this is caught by ErrorBoundary.
describe('InfiniteMenu without WebGL2', () => {
  it('throws when WebGL2 is unavailable (ErrorBoundary catches in production)', () => {
    // Suppress the expected console.error from the thrown error + React error boundary.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<InfiniteMenu items={[]} />)).toThrow(/No WebGL 2 context/)
    spy.mockRestore()
  })
})
