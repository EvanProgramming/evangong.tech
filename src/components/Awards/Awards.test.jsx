import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Awards from './Awards.jsx'
import { awards, awardsPage } from './awardsData.js'

describe('Awards', () => {
  it('renders demo content, dynamic stats, and a newest-first timeline', () => {
    render(<Awards />)

    expect(awardsPage.isDemo).toBe(true)
    expect(awards).toHaveLength(10)
    expect(awards.filter(award => award.featured)).toHaveLength(3)
    expect(screen.getByText('DEMO CONTENT · FICTIONAL AWARDS')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      '2026',
      '2025',
      '2024',
      '2023',
    ])
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2023—2026')).toBeInTheDocument()
  })

  it('keeps only one featured case open at a time', () => {
    render(<Awards />)
    const toggles = screen.getAllByRole('button', { name: /view case/i })

    expect(toggles).toHaveLength(3)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: /future systems innovation challenge case study/i })).toBeInTheDocument()

    fireEvent.click(toggles[1])
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('region', { name: /future systems innovation challenge case study/i })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: /youth ai product challenge case study/i })).toBeInTheDocument()
  })

  it('opens and closes the native media dialog', async () => {
    render(<Awards />)
    fireEvent.click(screen.getAllByRole('button', { name: /view case/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /view prototype testing.*fullscreen/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByRole('heading', { name: 'Prototype testing' })).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))

    fireEvent.click(screen.getByRole('button', { name: /view prototype testing.*fullscreen/i }))
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
    fireEvent.click(screen.getByRole('button', { name: /close media viewer/i }))
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('provides the projects CTA through the shared navigation path', () => {
    render(<Awards />)
    const cta = screen.getByRole('link', { name: /explore projects/i })

    expect(cta).toHaveAttribute('href', '/projects')
    expect(cta).toHaveAttribute('data-nav-link')
    expect(document.querySelector('a[href=""]')).not.toBeInTheDocument()
  })
})
