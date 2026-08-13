import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import Awards from './Awards.jsx'
import { awards, awardsPage } from './awardsData.js'

describe('Awards', () => {
  it('renders verified content, dynamic stats, and a newest-first timeline', () => {
    render(<Awards />)

    expect(awardsPage.isDemo).toBe(false)
    expect(awards).toHaveLength(5)
    expect(awards.filter(award => award.featured)).toHaveLength(4)
    expect(screen.queryByText(/demo content/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      '2026',
      '2025',
      '2024',
    ])
    expect(screen.getAllByText('05')).toHaveLength(2)
    expect(screen.getByText('2024—2026')).toBeInTheDocument()
  })

  it('keeps only one featured case open at a time', () => {
    render(<Awards />)
    const toggles = screen.getAllByRole('button', { name: /view case/i })

    expect(toggles).toHaveLength(4)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: /lightlink at shenzhen innox academy case study/i })).toBeInTheDocument()

    fireEvent.click(toggles[1])
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('region', { name: /lightlink at shenzhen innox academy case study/i })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: /ai scholars.*case study/i })).toBeInTheDocument()
  })

  it('opens and closes the native media dialog', async () => {
    render(<Awards />)
    fireEvent.click(screen.getAllByRole('button', { name: /view case/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /view illuminated prototype.*fullscreen/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByRole('heading', { name: 'Illuminated prototype' })).toBeInTheDocument()
    expect(within(dialog).getByRole('img', { name: /two lightlink wearable display prototypes/i })).toHaveAttribute(
      'src',
      '/awards/lightlink-display-prototype.jpg',
    )

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))

    fireEvent.click(screen.getByRole('button', { name: /view illuminated prototype.*fullscreen/i }))
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
    fireEvent.click(screen.getByRole('button', { name: /close media viewer/i }))
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('uses shared navigation for internal links and safe attributes for external links', () => {
    render(<Awards />)
    const cta = screen.getByRole('link', { name: /explore projects/i })
    fireEvent.click(screen.getAllByRole('button', { name: /view case/i })[0])
    const githubLink = screen.getByRole('link', { name: /explore lightlink on github/i })

    expect(cta).toHaveAttribute('href', '/projects')
    expect(cta).toHaveAttribute('data-nav-link')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/EvanProgramming/lightlink')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noreferrer')
    expect(githubLink).not.toHaveAttribute('data-nav-link')
    expect(document.querySelector('a[href=""]')).not.toBeInTheDocument()
  })
})
