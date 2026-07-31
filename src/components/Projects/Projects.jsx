import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import GlitchText from '../GlitchText/GlitchText.jsx'
import ScrambledText from '../ScrambledText/ScrambledText.jsx'
import SideRays from '../SideRays/SideRays.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
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
      { name: 'Docker', icon: si('docker'), href: 'https://www.docker.com' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/OpenKyrozen' }
  },
  {
    index: '02',
    year: '2026',
    name: 'Kyrozen',
    tagline: 'Product Creator & Manager · Full-Stack Agent Platform',
    intro:
      'A production-grade "product creator and manager" agent platform — Kyrozen turns ideas into shipped products with an autonomous core, desktop app, browser extension, and web frontend. It coordinates planning, implementation, verification, and deployment in a unified, self-hostable system.',
    features: [
      'Autonomous product lifecycle — from idea to deployed product in one platform',
      'Multi-surface architecture — desktop app, browser extension, web frontend, and Python core',
      'Self-hostable backend with Docker Compose, Caddy reverse proxy, and Postgres migrations',
      'Real execution planning with activity tracking and audit-grade verification',
      'Production-ready packaging — releases, install scripts, tests, and CI/CD scaffolding'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'TypeScript', icon: si('typescript'), href: 'https://www.typescriptlang.org' },
      { name: 'React', icon: si('react'), href: 'https://react.dev' },
      { name: 'Docker', icon: si('docker'), href: 'https://www.docker.com' },
      { name: 'PostgreSQL', icon: si('postgresql'), href: 'https://www.postgresql.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Kyrozen' }
  },
  {
    index: '03',
    year: '2026',
    name: 'OverflowBar',
    tagline: 'macOS Menu-Bar Utility · Native Swift App',
    intro:
      'A fluid second row for the macOS menu bar. OverflowBar keeps a crowded menu bar tidy by moving selected status items behind one persistent arrow, then revealing them in a fast, native second row whenever you need them — with Liquid Glass on macOS 26+.',
    features: [
      'Native macOS design — Liquid Glass on macOS 26+, lightweight material on macOS 15',
      'Live status-item capture via Accessibility APIs, WindowServer metadata, and ScreenCaptureKit',
      'Respects safe areas, notches, multiple displays, full-screen spaces, and reduced motion',
      'System controls stay safe — Wi-Fi, Battery, Siri, Control Center, and Clock remain visible',
      'One-click reveal by arrow or hover; selecting an icon activates its original control'
    ],
    tech: [
      { name: 'Swift', icon: si('swift'), href: 'https://www.swift.org' },
      { name: 'Xcode', icon: si('xcode'), href: 'https://developer.apple.com/xcode' },
      { name: 'AppKit', icon: si('apple'), href: 'https://developer.apple.com/documentation/appkit' },
      { name: 'SwiftUI', icon: si('apple'), href: 'https://developer.apple.com/documentation/swiftui' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/OverflowBar' }
  },
  {
    index: '04',
    year: '2026',
    name: 'Good Samaritan',
    tagline: 'Autonomous Open-Source Contributor · Python CLI',
    intro:
      'A deliberately cautious AI experiment: an independent Python CLI that discovers small open issues on GitHub, prepares focused fixes, tests them, gets a separate model review, and only then may open a pull request — with explicit AI disclosure and a dry-run-by-default safety model.',
    features: [
      'Dry-run by default — discovery, cloning, analysis, editing, validation, and review without remote writes',
      'Safety guardrails — rejects assigned/PR\'d issues, security work, bot-prohibited repos, and large diffs',
      'SQLite-backed journal, memory, and maintainer-preference learning for better future attempts',
      'Disposable dependency environments and command sandboxing inside temporary workspaces',
      'Automatic provider fallback (Gemini, Groq, OpenRouter, local OmniRoute) with cooldowns on rate limits'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'GitHub Actions', icon: si('githubactions'), href: 'https://github.com/features/actions' },
      { name: 'SQLite', icon: si('sqlite'), href: 'https://www.sqlite.org' },
      { name: 'OpenAI', icon: si('openai'), href: 'https://platform.openai.com' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/GoodSamaritan' }
  },
  {
    index: '05',
    year: '2026',
    name: 'Kards AI',
    tagline: 'KARDS Game AI Simulator · AlphaZero Training',
    intro:
      'A core, headless rules simulator for KARDS AI training. It models the full World-War-II card game as deterministic Python code, then trains an AlphaZero-style policy/value network through self-play — no UI, no networking, pure reinforcement-learning research.',
    features: [
      'Complete KARDS rules engine — card loader, serializable game state, actions, turn flow, effect engine',
      'Custom-handler framework for card abilities, keywords, countermeasures, and battlefield rules',
      'AlphaZero-style training loop with policy/value network, replay buffer, and vectorized self-play',
      'Windows training orchestration — D-drive workspace, CUDA isolation, dashboard, and graceful stop',
      '1488-card unmodified kards.info catalog as the single source of truth'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'PyTorch', icon: si('pytorch'), href: 'https://pytorch.org' },
      { name: 'CUDA', icon: si('cuda'), href: 'https://developer.nvidia.com/cuda-zone' },
      { name: 'NumPy', icon: si('numpy'), href: 'https://numpy.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Kards-AI' }
  },
  {
    index: '06',
    year: '2026',
    name: 'Hardware Agent Runtime',
    tagline: 'Embedded Hardware Runtime · TypeScript MCP',
    intro:
      'A local-first runtime that lets external AI coding agents safely compile, flash, observe, experiment with, and verify real embedded hardware. The first target is Arduino through Arduino CLI, with adapter contracts that preserve a path to ESP-IDF, Zephyr, RP2040, STM32, and MicroPython.',
    features: [
      'Safe hardware-in-the-loop workflow — discovery, compile, flash, serial diagnostics, verification reports',
      'MCP server exposes the runtime to AI agents via STDIO with input/output validation',
      'Immutable, attributable evidence — inference never overwrites observation',
      'Deterministic experiments with persisted human-action pauses and safety analysis',
      'Validated end-to-end on real ESP32 Dev Module hardware'
    ],
    tech: [
      { name: 'TypeScript', icon: si('typescript'), href: 'https://www.typescriptlang.org' },
      { name: 'Node.js', icon: si('nodedotjs'), href: 'https://nodejs.org' },
      { name: 'SQLite', icon: si('sqlite'), href: 'https://www.sqlite.org' },
      { name: 'Arduino', icon: si('arduino'), href: 'https://arduino.github.io/arduino-cli' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Hardware-Agent-Runtime' }
  },
  {
    index: '07',
    year: '2026',
    name: 'CAD It Up',
    tagline: 'Text-to-CAD Agent · Python/build123d',
    intro:
      'A text-to-CAD agent with a self-correcting verification loop. It turns a natural-language part description into an accurate, parametric B-rep solid (STEP and STL) using build123d over the OpenCascade kernel, then measures the result against a structured spec and self-corrects via LLM feedback.',
    features: [
      'Pydantic PartSpec model — mechanical parts as data (holes, counterbores, bolt patterns, walls, gussets)',
      'Deterministic build() mapping — LLM emits spec JSON, never arbitrary build123d code',
      '0.01 mm measurement assertions — bounding box, bore positions, bolt patterns, wall thickness',
      'Self-correcting loop — precise diffs feed back to the LLM to regenerate the spec on failure',
      'Exports production-ready STEP + STL with material and tolerance reports'
    ],
    tech: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'OpenAI', icon: si('openai'), href: 'https://platform.openai.com' },
      { name: 'OpenCascade', text: 'OpenCascade', href: 'https://www.opencascade.com' },
      { name: 'pytest', icon: si('pytest'), href: 'https://docs.pytest.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/CAD_It_Up' }
  },
  {
    index: '08',
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
      { name: 'Supabase', icon: si('supabase'), href: 'https://supabase.com' },
      { name: 'Three.js', icon: si('threedotjs'), href: 'https://threejs.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/MoodStudy' },
    demo: { label: 'Live Site', href: 'https://moodstudy.top/' }
  },
  {
    index: '09',
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
      { name: 'ROS', icon: si('ros'), href: 'https://www.ros.org' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming' }
  },
  {
    index: '10',
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
      { name: '.NET', icon: si('dotnet'), href: 'https://dotnet.microsoft.com' }
    ],
    link: { label: 'View on GitHub', href: 'https://github.com/EvanProgramming/Burney-PDF' }
  },

]

function ProjectRow({ project }) {
  // The entire row is clickable: clicking anywhere opens the project's repo in
  // a new tab. Nested <a> (tech chips, demo link, the "View on GitHub" link)
  // are left to navigate to their own targets — we bail when the click originated
  // inside one so we don't double-navigate. No stretched-link overlay is used so
  // ScrambledText keeps receiving pointermove for its scramble effect.
  const openProject = () => {
    window.open(project.link.href, '_blank', 'noopener,noreferrer')
  }
  const handleRowClick = (e) => {
    if (e.target.closest('a')) return
    openProject()
  }
  const handleRowKeyDown = (e) => {
    // The article is focusable (tabIndex=0); activate it like a link on
    // Enter / Space so keyboard users can open the repo without tabbing in.
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      openProject()
    }
  }

  return (
    <article
      className="project-row"
      tabIndex={0}
      role="link"
      aria-label={`Open ${project.name} project on GitHub`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
    >
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
      {/* Ambient WebGL background — fixed to the viewport. SideRays (ogl shader)
         paints a slow cyan/white ray glow from the top-right corner; a dark
         overlay dims it so the project text stays legible. ErrorBoundary keeps
         the page usable if WebGL is unavailable (falls back to plain black).
         Fixed positioning is safe here — PageTransition blurs via an overlay
         backdrop-filter, never a filter on <main>, so fixed decor inside it
         (like About's .about-circular) stays viewport-anchored. */}
      <div className="projects-bg" aria-hidden="true">
        <ErrorBoundary>
          <SideRays
            speed={1.5}
            rayColor1="#00f0ff"
            rayColor2="#ffffff"
            intensity={1.2}
            spread={2}
            origin="top-right"
            saturation={1.4}
            blend={0.5}
            falloff={1.6}
            opacity={0.55}
          />
        </ErrorBoundary>
      </div>
      <div className="projects-bg-overlay" aria-hidden="true" />

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
