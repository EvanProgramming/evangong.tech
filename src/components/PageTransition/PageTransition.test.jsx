import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageTransition from './PageTransition.jsx'

describe('PageTransition', () => {
  it('shows Loading while the page is held blurred', () => {
    const { container } = render(<PageTransition phase="reveal-prepare" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(container.firstChild).toHaveClass('page-transition--active', 'page-transition--no-anim')
  })
})
