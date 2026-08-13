import { useEffect, useMemo, useRef, useState } from 'react'
import GlitchText from '../GlitchText/GlitchText.jsx'
import { awards, awardsPage } from './awardsData.js'
import './Awards.css'

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

function formatDate(date) {
  return monthFormatter.format(new Date(`${date}-01T00:00:00`))
}

function isExternalUrl(href) {
  return /^https?:\/\//.test(href)
}

function AwardLinks({ award }) {
  if (!award.proofUrl && !award.relatedProject) return null

  return (
    <div className="award-case__links">
      {award.proofUrl && (
        <a href={award.proofUrl} target="_blank" rel="noreferrer">
          {award.proofLabel || 'Official verification'} <span aria-hidden="true">↗</span>
        </a>
      )}
      {award.relatedProject && (isExternalUrl(award.relatedProject.href) ? (
        <a href={award.relatedProject.href} target="_blank" rel="noreferrer">
          Explore {award.relatedProject.label} <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <a href={award.relatedProject.href} data-nav-link>
          Explore {award.relatedProject.label} <span aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  )
}

function MediaPanel({ award, media, onOpen }) {
  return (
    <button
      type="button"
      className="award-media"
      aria-label={`View ${media.label} from ${award.title} fullscreen`}
      onClick={() => onOpen({ ...media, awardTitle: award.title })}
    >
      {media.src ? (
        <img src={media.src} alt={media.alt} loading="lazy" />
      ) : (
        <span className="award-media__mock" aria-hidden="true">
          <span>MOCK MEDIA</span>
          <strong>{media.label}</strong>
          <small>{award.field} / {award.date.slice(0, 4)}</small>
        </span>
      )}
      <span className="award-media__expand" aria-hidden="true">↗</span>
    </button>
  )
}

function AwardCard({ award, isOpen, onToggle, onOpenMedia }) {
  const caseId = `award-case-${award.id}`

  return (
    <article className={`award-card${award.featured ? ' award-card--featured' : ''}`}>
      <div className="award-card__top">
        <div className="award-card__meta">
          <time dateTime={`${award.date}-01`}>{formatDate(award.date)}</time>
          <span>{award.level}</span>
          <span>{award.field}</span>
        </div>
        <div className="award-card__heading">
          <p>{award.result}</p>
          <h4>{award.title}</h4>
        </div>
        <div className="award-card__body">
          <p className="award-card__organizer">
            {award.organizer}{award.location ? ` · ${award.location}` : ''}
          </p>
          <p className="award-card__summary">{award.shortSummary}</p>
          {award.teamName && (
            <p className="award-card__credit">
              <span>{award.teamName}</span>
              {award.myRole && <span>My role: {award.myRole}</span>}
            </p>
          )}
        </div>
        {award.featured && (
          <button
            type="button"
            className="award-card__toggle"
            aria-expanded={isOpen}
            aria-controls={caseId}
            onClick={onToggle}
          >
            <span>{isOpen ? 'Close case' : 'View case'}</span>
            <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
          </button>
        )}
      </div>

      {award.featured && (
        <div
          id={caseId}
          className={`award-case${isOpen ? ' award-case--open' : ''}`}
          role="region"
          aria-label={`${award.title} case study`}
          aria-hidden={!isOpen}
        >
          <div className="award-case__inner">
            <div className="award-case__story">
              <div>
                <span>Challenge</span>
                <p>{award.caseStudy.challenge}</p>
              </div>
              <div>
                <span>My contribution</span>
                <p>{award.caseStudy.contribution}</p>
              </div>
              <div>
                <span>Outcome</span>
                <p>{award.caseStudy.outcome}</p>
              </div>
            </div>
            <div
              className={`award-case__media award-case__media--${Math.min(award.media.length, 3)}`}
              aria-label={`${award.title} media`}
            >
              {award.media.map(media => (
                <MediaPanel key={media.id} award={award} media={media} onOpen={onOpenMedia} />
              ))}
            </div>
            <AwardLinks award={award} />
          </div>
        </div>
      )}
    </article>
  )
}

export default function Awards() {
  const [openAwardId, setOpenAwardId] = useState(null)
  const [activeMedia, setActiveMedia] = useState(null)
  const dialogRef = useRef(null)

  const groupedAwards = useMemo(() => {
    return [...awards]
      .sort((a, b) => b.date.localeCompare(a.date))
      .reduce((groups, award) => {
        const year = award.date.slice(0, 4)
        if (!groups[year]) groups[year] = []
        groups[year].push(award)
        return groups
      }, {})
  }, [])

  const years = Object.keys(groupedAwards).sort((a, b) => b.localeCompare(a))
  const fields = new Set(awards.map(award => award.field)).size
  const yearSpan = `${years.at(-1)}—${years[0]}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!activeMedia || !dialog || dialog.open) return
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } catch {
      dialog.setAttribute('open', '')
    }
  }, [activeMedia])

  const closeMedia = () => {
    const dialog = dialogRef.current
    if (dialog?.open && typeof dialog.close === 'function') dialog.close()
    else dialog?.removeAttribute('open')
    setActiveMedia(null)
  }

  return (
    <section className="awards-page" aria-label="Awards and recognition">
      <header className="awards-hero">
        <div className="awards-hero__eyebrow">EVAN GONG / RECOGNITION</div>
        {awardsPage.isDemo && <div className="awards-hero__demo">DEMO CONTENT · FICTIONAL AWARDS</div>}
        <h1 className="awards-hero__title-wrap">
          <GlitchText
            className="awards-hero__title"
            speed={0.7}
            enableShadows
            afterShadow="-5px 0 rgba(255,255,255,0.65)"
            beforeShadow="5px 0 #00f0ff"
          >
            AWARDS
          </GlitchText>
        </h1>
        <p className="awards-hero__intro">{awardsPage.intro}</p>
        <dl className="awards-stats" aria-label="Awards overview">
          <div><dt>Awards</dt><dd>{String(awards.length).padStart(2, '0')}</dd></div>
          <div><dt>Fields</dt><dd>{String(fields).padStart(2, '0')}</dd></div>
          <div><dt>Timeline</dt><dd>{yearSpan}</dd></div>
        </dl>
      </header>

      <section className="awards-archive" aria-labelledby="awards-timeline-heading">
        <div className="awards-section-heading">
          <span>01</span>
          <h2 id="awards-timeline-heading">Recognition timeline</h2>
        </div>
        <div className="awards-timeline">
          {years.map(year => (
            <section key={year} className="awards-year" aria-labelledby={`awards-year-${year}`}>
              <h3 id={`awards-year-${year}`}>{year}</h3>
              <div className="awards-year__list">
                {groupedAwards[year].map(award => (
                  <AwardCard
                    key={award.id}
                    award={award}
                    isOpen={openAwardId === award.id}
                    onToggle={() => setOpenAwardId(current => current === award.id ? null : award.id)}
                    onOpenMedia={setActiveMedia}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="awards-cta" aria-label="Explore projects">
        <p>Recognition marks a moment. The work continues.</p>
        <a href="/projects" data-nav-link>
          Explore Projects <span aria-hidden="true">→</span>
        </a>
      </section>

      <dialog
        ref={dialogRef}
        className="awards-media-dialog"
        aria-labelledby="awards-media-dialog-title"
        onClose={() => setActiveMedia(null)}
        onCancel={event => {
          event.preventDefault()
          closeMedia()
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault()
            closeMedia()
          }
        }}
        onClick={event => {
          if (event.target === event.currentTarget) closeMedia()
        }}
      >
        <button type="button" className="awards-media-dialog__close" aria-label="Close media viewer" onClick={closeMedia}>×</button>
        {activeMedia && (
          <div className="awards-media-dialog__content">
            <div className="awards-media-dialog__visual">
              {activeMedia.src ? (
                <img
                  className="awards-media-dialog__image"
                  src={activeMedia.src}
                  alt={activeMedia.alt}
                />
              ) : (
                <div className="awards-media-dialog__mock" aria-hidden="true">
                  <span>MOCK MEDIA</span>
                  <strong>{activeMedia.label}</strong>
                </div>
              )}
            </div>
            <div>
              <span>{activeMedia.sourceLabel || (activeMedia.src ? 'DOCUMENTATION' : 'DEMO CONTENT')}</span>
              <h2 id="awards-media-dialog-title">{activeMedia.label}</h2>
              <p>{activeMedia.awardTitle}</p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
