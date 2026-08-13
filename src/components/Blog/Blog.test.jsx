import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Blog from './Blog.jsx'
import BlogPost from './BlogPost.jsx'

const lenisMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  destroy: vi.fn(),
  raf: vi.fn(),
}))

vi.mock('lenis', () => ({
  default: class LenisMock {
    constructor(options) {
      lenisMocks.constructor(options)
    }

    raf(time) {
      lenisMocks.raf(time)
    }

    destroy() {
      lenisMocks.destroy()
    }
  },
}))

function renderBlog(initialEntry = '/blog') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </MemoryRouter>
  )
}

function RouteNavigator() {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate('/blog/openkyrozen-agent')}>Switch article</button>
}

beforeEach(() => {
  vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1)
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  lenisMocks.constructor.mockClear()
  lenisMocks.destroy.mockClear()
  lenisMocks.raf.mockClear()
})

describe('Blog', () => {

  it('uses the shared Lenis smooth-scroll configuration', () => {
    const { unmount } = renderBlog()

    expect(lenisMocks.constructor).toHaveBeenCalledWith(expect.objectContaining({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: true,
    }))
    expect(requestAnimationFrame).toHaveBeenCalledOnce()

    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1)
    expect(lenisMocks.destroy).toHaveBeenCalledOnce()
  })

  it('renders featured notes, filters, and year groups', () => {
    renderBlog()
    expect(screen.getByRole('heading', { name: 'BLOG' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Selected notes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hardware' })).toBeInTheDocument()
  }, 15000)

  it('filters the article index by tag', () => {
    renderBlog()
    fireEvent.click(screen.getByRole('button', { name: 'Hardware' }))
    const archive = screen.getByRole('region', { name: 'All field notes' })
    expect(within(archive).getByText('Giving AI Agents a Safe Path to Real Hardware')).toBeInTheDocument()
    expect(within(archive).queryByText('Building an Agent That Learns From Its Work')).not.toBeInTheDocument()
  })
})

describe('BlogPost', () => {
  it('renders article metadata, contents, progress, and related links', () => {
    renderBlog('/blog/openkyrozen-agent')
    expect(screen.getByRole('article', { name: 'Building an Agent That Learns From Its Work' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Article contents' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to field notes/i })).toHaveAttribute('href', '/blog')
    expect(document.querySelector('.blog-post__progress')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Keep reading' })).toBeInTheDocument()
  })

  it('redirects an unknown slug back to the blog index', () => {
    renderBlog('/blog/not-a-real-article')
    expect(screen.getByRole('heading', { name: 'BLOG' })).toBeInTheDocument()
  })

  it('updates the title when navigating between articles in place', () => {
    render(
      <MemoryRouter initialEntries={['/blog/kards-ai-simulator']}>
        <Routes>
          <Route path="/blog/:slug" element={<><BlogPost /><RouteNavigator /></>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('article')).toHaveAccessibleName('Teaching a Card Game Agent to Think in States')
    fireEvent.click(screen.getByRole('button', { name: 'Switch article' }))
    return waitFor(() => {
      expect(screen.getByRole('article')).toHaveAccessibleName('Building an Agent That Learns From Its Work')
      expect(screen.getByRole('heading', { name: 'Building an Agent That Learns From Its Work' })).toBeInTheDocument()
    })
  })
})
