import './Skills.css'

// Local icon helper — SVGs are pre-downloaded to /public/icons/ and injected
// with fill="#ffffff" (cdn.simpleicons.org is unreachable in-browser, see
// project memory). Mirrors Home's `si` helper.
const si = (slug) => `/icons/${slug}.svg`

// Skills grouped by logical association. Each item is clickable and opens the
// official / representative resource in a new tab. Items without a Simple Icon
// fall back to a short text badge (flat, consistent with Home's logo rows).
const SKILL_GROUPS = [
  {
    name: 'Languages & Web',
    items: [
      { name: 'Python', icon: si('python'), href: 'https://www.python.org' },
      { name: 'C++', icon: si('cplusplus'), href: 'https://isocpp.org' },
      { name: 'Java', icon: si('openjdk'), href: 'https://openjdk.org' },
      { name: 'JavaScript', icon: si('javascript'), href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'HTML', icon: si('html5'), href: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { name: 'CSS', icon: si('css'), href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { name: 'React', icon: si('react'), href: 'https://react.dev' },
      { name: 'WebGL', icon: si('webgl'), href: 'https://www.khronos.org/webgl/' },
    ],
  },
  {
    name: 'AI & Data',
    items: [
      { name: 'TensorFlow', icon: si('tensorflow'), href: 'https://www.tensorflow.org' },
      { name: 'NumPy', icon: si('numpy'), href: 'https://numpy.org' },
      { name: 'Pandas', icon: si('pandas'), href: 'https://pandas.pydata.org' },
      { name: 'scikit-learn', icon: si('scikitlearn'), href: 'https://scikit-learn.org' },
      { name: 'Keras', icon: si('keras'), href: 'https://keras.io' },
      { name: 'Matplotlib', text: 'MPL', href: 'https://matplotlib.org' },
    ],
  },
  {
    name: 'AI Tooling',
    items: [
      { name: 'Openclaw', text: 'OC', href: 'https://github.com/EvanProgramming' },
      { name: 'Hermes', text: 'HM', href: 'https://github.com/EvanProgramming' },
      { name: 'Whalecode', text: 'WC', href: 'https://github.com/EvanProgramming' },
      { name: 'Codewhale', text: 'CW', href: 'https://github.com/EvanProgramming' },
      { name: 'Claude Code', icon: si('anthropic'), href: 'https://claude.ai' },
      { name: 'Codex', text: 'OpenAI', href: 'https://openai.com/codex' },
      { name: 'Cursor', icon: si('cursor'), href: 'https://www.cursor.com' },
      { name: 'Trae', text: 'Trae', href: 'https://www.trae.ai' },
    ],
  },
  {
    name: 'Cloud & DevOps',
    items: [
      { name: 'Tencent Cloud', text: 'TC', href: 'https://cloud.tencent.com' },
      { name: 'AWS', text: 'AWS', href: 'https://aws.amazon.com' },
      { name: 'Cloudflare', icon: si('cloudflare'), href: 'https://www.cloudflare.com' },
      { name: 'Git', icon: si('git'), href: 'https://git-scm.com' },
      { name: 'Linux', icon: si('linux'), href: 'https://www.kernel.org' },
    ],
  },
  {
    name: 'Photography',
    items: [
      { name: 'Sony A7RII', icon: si('sony'), href: 'https://www.sony.com' },
      { name: 'Tamron 50-300mm F/4.5-6.3 Di III VC VXD (A069)', text: 'Tamron', href: 'https://www.tamron.com' },
      { name: 'Sony FE 28-70mm f/3.5-5.6 OSS', icon: si('sony'), href: 'https://www.sony.com' },
      { name: 'Nikon D90', icon: si('nikon'), href: 'https://www.nikon.com' },
      { name: 'Nikon AF-S DX NIKKOR 18-105mm f/3.5-5.6G ED VR', icon: si('nikon'), href: 'https://www.nikon.com' },
      { name: 'Nikon AF-S DX NIKKOR 35mm f/1.8G', icon: si('nikon'), href: 'https://www.nikon.com' },
      { name: 'DJI Air 3S', icon: si('dji'), href: 'https://www.dji.com' },
      { name: 'DJI Inspire 1 Raw', icon: si('dji'), href: 'https://www.dji.com' },
      { name: 'DJI Osmo Raw', icon: si('dji'), href: 'https://www.dji.com' },
    ],
  },
]

export default function Skills() {
  return (
    <section className="about-skills" aria-label="Skills">
      <h2 className="about-skills__title">Skills</h2>
      <div className="about-skills__groups">
        {SKILL_GROUPS.map((group) => (
          <div className="about-skills__row" key={group.name}>
            <span className="about-skills__row-label">{group.name}</span>
            <div className="about-skills__row-items">
              {group.items.map((skill) => (
                <a
                  key={skill.name}
                  className="skill-chip"
                  href={skill.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={skill.name}
                >
                  {skill.icon ? (
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="skill-chip__icon"
                      loading="lazy"
                      width="18"
                      height="18"
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <span className="skill-chip__text-icon" aria-hidden="true">
                      {skill.text}
                    </span>
                  )}
                  <span className="skill-chip__label">{skill.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
