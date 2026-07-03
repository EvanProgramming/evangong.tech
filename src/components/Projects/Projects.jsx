import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import GlitchText from '../GlitchText/GlitchText.jsx'
import ScrambledText from '../ScrambledText/ScrambledText.jsx'
import './Projects.css'

// Local icon helper — SVGs are pre-downloaded to /public/icons/ and injected
// with fill="#ffffff" (cdn.simpleicons.org is unreachable in-browser). Mirrors
// Home's / Skills' `si` helper.
const si = (slug) => `/icons/${slug}.svg`

// Project list — sourced from the public GitHub profile
// (https://github.com/EvanProgramming?tab=repositories). Each entry's intro,
// features, and tech stack are distilled from that repo's README/page so the
// portfolio reflects the actual work. The hardware "Anti-Fire Drone System"
// has no public repo and is retained as-is for breadth.
//
// Schema:
//   index, year        — leftmost meta column
//   name               — cyan headline (always visible)
//   tagline            — small uppercase category · platform label
//   intro              — ScrambledText long description
//   features           — short bullet list of key capabilities
//   tech[]             — { name, icon? | text?, href } stack chips
//   link               — primary outbound (GitHub repo)
//   demo?              — optional live-site outbound
const PROJECTS = [
  {
    index: '01',
    year: '2026',
    name: 'OpenKyrozen',
    tagline: 'Self-Learning AI Agent · Terminal-Native',
    intro:
      'A terminal-native, fully autonomous AI agent that learns from every interaction — it operates your filesystem, manages git, fixes bugs through a 6-step protocol, and runs 20 self-learning features continuously in the background to build its own knowledge graph.',
    features: [
      '26 built-in tools — file I/O, shell execution, web search, 15 git operations, semantic memory',
      '20 background self-learning features — fact extraction, skill invention, strategy distillation',
      'Multi-provider LLM support with auto-fallback — DeepSeek, OpenAI, Claude, Gemini, Ollama',
      '6-step bug-fixing protocol: reproduce → diagnose → hypothesise → fix → verify → explain',
      'Web UI + REST API, Docker, pip package, MCP integration, PWA'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'Claude', icon: si('anthropic'), href: 'https://www.anthropic.com' },
      { name: 'Gemini', icon: si('googlegemini'), href: 'https://gemini.google.com' },
      { name: 'Git', icon: si('git'), href: 'https://git-scm.com' },
      { name: 'Docker', text: 'Docker', href: 'https://www.docker.com' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/OpenKyrozen' }
  },
  {
    index: '02',
    year: '2026',
    name: 'MoodStudy',
    tagline: 'Mood & Learning Analytics · Hackathon (Team b1t)',
    intro:
      'A hackathon-built web app that helps students log daily moods, track study hours and sleep, and receive AI-powered insights — pairing an immersive Three.js UI with a Supabase backend and a Hugging Face LLM for personalized recommendations.',
    features: [
      'Mood tracking with emotional tags, notes, and pattern recognition',
      'Learning analytics — study hours, focus levels, sleep & habit monitoring',
      'AI-powered insights and recommendations via Hugging Face LLM',
      'Built-in Pomodoro focus timer, GPA simulator, and academic planning',
      'Immersive UI with Three.js, GSAP scroll animations, and Lenis smooth scroll'
    ],
    tech: [
      { name: 'JavaScript', icon: si('javascript'), href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'CSS', icon: si('css'), href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { name: 'HTML5', icon: si('html5'), href: 'https://developer.mozilla.org/en-US/docs/Glossary/HTML5' },
      { name: 'Supabase', text: 'Supabase', href: 'https://supabase.com' },
      { name: 'Three.js', text: 'Three.js', href: 'https://threejs.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/MoodStudy' },
    demo: { label: 'Live Site', href: 'https://moodstudy.top/' }
  },
  {
    index: '03',
    year: '2024',
    name: 'Anti-Fire Drone System',
    tagline: 'Autonomous Fire-Response Drone · Hardware',
    intro:
      'An autonomous fire-extinguishing drone system for rapid response — onboard vision, real-time path planning, and coordinated fleet deployment across hazardous zones.',
    features: [
      'Onboard computer vision for fire detection and tracking',
      'Real-time path planning across hazardous zones',
      'Coordinated multi-drone fleet deployment',
      'Rapid-response autonomous dispatch'
    ],
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
    year: '2026',
    name: 'Burney-PDF',
    tagline: 'Liquid Glass PDF Previewer · Windows Desktop',
    intro:
      'A Liquid Glass–styled PDF previewer for Windows, built in C#. Features a modern frosted-glass UI with Ctrl+G page-jump navigation and smooth document browsing.',
    features: [
      'Liquid Glass (frosted/acrylic) UI on Windows',
      'Ctrl+G page-number jump navigation',
      'Smooth, responsive PDF rendering and browsing'
    ],
    tech: [
      { name: 'C#', text: 'C#', href: 'https://dotnet.microsoft.com/languages/csharp' },
      { name: '.NET', text: '.NET', href: 'https://dotnet.microsoft.com' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Burney-PDF' }
  },
  {
    index: '05',
    year: '2026',
    name: 'Matrix-Calculator',
    tagline: 'Exact Matrix Arithmetic · C++/CMake',
    intro:
      'A C++ matrix calculator built around a custom fraction module — perform matrix operations with exact arithmetic, eliminating the floating-point errors that plague naive implementations.',
    features: [
      'Exact arithmetic via a custom fraction module — no floating-point drift',
      'Standard matrix operations — addition, multiplication, transpose, determinant',
      'CMake build system with a modular source layout'
    ],
    tech: [
      { name: 'C++', icon: si('cplusplus'), href: 'https://isocpp.org' },
      { name: 'C', icon: si('c'), href: 'https://en.wikipedia.org/wiki/C_(programming_language)' },
      { name: 'CMake', text: 'CMake', href: 'https://cmake.org' },
      { name: 'Make', text: 'Make', href: 'https://www.gnu.org/software/make' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Matrix-Calculator' }
  },
  {
    index: '06',
    year: '2026',
    name: 'Sona',
    tagline: 'Voice-Driven Desktop Assistant · Early Stage',
    intro:
      'A Siri alternative for the desktop — designed as a comprehensive personal assistant with voice-driven control and context-aware automation. Currently in early-stage development.',
    features: [
      'Voice-driven computer control',
      'Context-aware automation',
      'Designed as a modular, extensible assistant framework'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'JavaScript', icon: si('javascript'), href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'React', icon: si('react'), href: 'https://react.dev' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Sona' }
  },
  {
    index: '07',
    year: '2025',
    name: 'Debate_Simulator',
    tagline: 'Telegram Account Simulator · Web Toy',
    intro:
      "A playful single-page web simulator that recreates the Telegram account-opening flow — built as a tribute to 'Mr. Debate', a fanatical Telegram fan. Pure HTML, CSS, and vanilla JavaScript with no build step.",
    features: [
      'Faithful recreation of the Telegram account-opening experience',
      'Interactive UI with a QR-code verification step',
      'Zero-dependency vanilla JS — no build step, runs anywhere'
    ],
    tech: [
      { name: 'JavaScript', icon: si('javascript'), href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'CSS', icon: si('css'), href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { name: 'HTML5', icon: si('html5'), href: 'https://developer.mozilla.org/en-US/docs/Glossary/HTML5' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Debate_Simulator' }
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
            <p className="project-row__tagline">{project.tagline}</p>

            <ScrambledText
              className="project-row__intro"
              radius={80}
              duration={1}
              speed={0.4}
              scrambleChars=".:"
            >
              {project.intro}
            </ScrambledText>

            <ul className="project-row__features">
              {project.features.map((f) => (
                <li className="project-row__feature" key={f}>
                  <span className="project-row__feature-marker" aria-hidden="true">▸</span>
                  <span className="project-row__feature-text">{f}</span>
                </li>
              ))}
            </ul>

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

            <div className="project-row__links">
              <a
                className="project-row__link"
                href={project.link.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {project.link.label} <span aria-hidden="true">→</span>
              </a>
              {project.demo && (
                <a
                  className="project-row__link project-row__link--demo"
                  href={project.demo.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {project.demo.label} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
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
