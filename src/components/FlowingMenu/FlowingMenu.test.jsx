import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FlowingMenu from './FlowingMenu.jsx'

describe('FlowingMenu', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('marks item links for shared internal navigation', () => {
    render(
      <FlowingMenu
        items={[{ link: '/gallery/paris', text: 'Paris, France', image: '/paris.jpg' }]}
      />
    )

    const link = screen.getByRole('link', { name: 'Paris, France' })
    expect(link).toHaveAttribute('href', '/gallery/paris')
    expect(link).toHaveAttribute('data-nav-link')
  })
})
