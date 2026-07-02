import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import GlitchText from '../GlitchText/GlitchText.jsx'
import ScrambledText from '../ScrambledText/ScrambledText.jsx'
import './Projects.css'

// Local icon helper — SVGs are pre-downloaded to /public/icons/ and injected
// with fill="#ffffff" (cdn.simpleicons.org is unreachable in-browser). Mirrors
// Home's / Skills' `si` helper.
const si = (slug) => `/icons/${slug}.svg`

// Project list — inlined as module-level constants (project convention: no
// data layer). Expands the 4 projects previewed in Home's ScrollStack with
// full descriptions, tech stacks, and outbound links.
const PROJECTS = [
  {
    index: '01',
    year: '2025',
    name: 'OpenKyrozen',
    intro:
      'A self-learning AI Agent that adapts and grows through autonomous exploration, building its own knowledge graph from real-world interaction and feedback loops.',
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'TensorFlow', icon: si('tensorflow'), href: 'https://www.tensorflow.org' },
      { name: 'NumPy', icon: si('numpy'), href: 'https://numpy.org' },
      { name: 'Pandas', icon: si('pandas'), href: 'https://pandas.pydata.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming' }
  },
  {
    index: '02',
    year: '2025',
    name: 'Sona',
    intro:
      'A Siri-like comprehensive personal assistant for your computer — voice-driven control, context-aware automation, and a modular plugin system that grows with your workflow.',
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'JavaScript', icon: si('javascript'), href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'React', icon: si('react'), href: 'https://react.dev' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming' }
  },
  {
    index: '03',
    year: '2024',
    name: 'Anti-Fire Drone System',
    intro:
      'An autonomous fire-extinguishing drone system for rapid response — onboard vision, real-time path planning, and coordinated fleet deployment across hazardous zones.',
    tech: [
      { name: 'C++', icon: si('cplusplus'), href: 'https://isocpp.org' },
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'C', icon: si('c'), href: 'https://en.wikipedia.org/wiki/C_(programming_language)' },
      { name: 'ROS', text: 'ROS', href: 'https://www.ros.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming' }
  },
  {
    index: '04',
    year: '2024',
    name: 'Campus Studio',
    intro:
      'A work assignment platform for school photography studios — scheduling, role dispatch, and asset delivery unified into a single clean interface for staff and students.',
    tech: [
      { name: 'React', icon: si('react'), href: 'https://react.dev' },
      { name: 'Vite', icon: si('vite'), href: 'https://vitejs.dev' },
      { name: 'CSS', icon: si('css'), href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming' }
  }
]

function ProjectRow({ project }) {
  return (
    <article className="project-row" tabIndex={0}>
      {/* Leftmost column: index + year, small. Always visible. */}
      <div className="project-row__meta">
        <span className="project-row__index">{project.index}</span>
        <span className="project-row__year">{project.year}</span>
      </div>

      {/* Main column: name (always visible) + expandable details. */}
      <div className="project-row__main">
        <h3 className="project-row__name">{project.name}</h3>

        {/* Expandable region: collapses to 0 height by default (desktop),
            expands on hover/focus-within. Mobile is always expanded. */}
        <div className="project-row__details">
          <div className="project-row__details-inner">
            <ScrambledText
              className="project-row__intro"
              radius={80}
              duration={1}
              speed={0.4}
              scrambleChars=".:"
            >
              {project.intro}
            </ScrambledText>

            <ul className="project-row__tech">
              {project.tech.map((t) => (
                <li key={t.name}>
                  <a
                    className="project-row__tech-link"
                    href={t.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={t.name}
                  >
                    {t.icon ? (
                      <img
                        src={t.icon}
                        alt={t.name}
                        className="project-row__tech-icon"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <span className="project-row__tech-badge" aria-hidden="true">
                        {t.text}
                      </span>
                    )}
                    <span className="project-row__tech-label">{t.name}</span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              className="project-row__link"
              href={project.link.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {project.link.label} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const rafRef = useRef(null)

  // Lenis — same config as About / ScrollStack useWindowScroll branch so the
  // scroll feel is identical across pages. Cleaned up on unmount to avoid
  // duplicate rAF loops when navigating between routes.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075
    })

    const raf = (time) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [])

  return (
    <section className="projects-page" aria-label="Featured projects">
      {/* Title — left-aligned GlitchText with #00f0ff shadows (always animating). */}
      <div className="projects-title">
        <GlitchText
          speed={1}
          enableShadows={true}
          enableOnHover={false}
          afterShadow="-5px 0 #00f0ff"
          beforeShadow="5px 0 #00f0ff"
          className="projects-title__glitch"
        >
          FEATURED PROJECTS
        </GlitchText>
      </div>

      <div className="projects-list">
        {PROJECTS.map((p) => (
          <ProjectRow key={p.index} project={p} />
        ))}
      </div>
    </section>
  )
}
