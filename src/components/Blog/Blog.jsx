import { useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import GlitchText from '../GlitchText/GlitchText.jsx'
import ProtectedImage from '../ProtectedImage/ProtectedImage.jsx'
import './Blog.css'
import { articleTags, articles, featuredArticles } from './blogData.js'

function groupByYear(items) {
  return items.reduce((groups, article) => {
    if (!groups[article.year]) groups[article.year] = []
    groups[article.year].push(article)
    return groups
  }, {})
}

function formatDate(date) {
  if (!date) return 'Undated'
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function ArticleMeta({ article }) {
  return (
    <div className="blog-card__meta">
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      <span>{article.readingTime} min read</span>
    </div>
  )
}

function ArticleLink({ article, featured = false }) {
  return (
    <a href={`/blog/${article.slug}`} data-nav-link className={featured ? 'blog-featured-card' : 'blog-article-row'}>
      <div className="blog-card__image-wrap">
        <ProtectedImage src={article.cover} alt={`${article.title} cover`} className="blog-card__image" loading="lazy" sizes="(max-width: 700px) 90vw, 30rem" />
      </div>
      <div className="blog-card__content">
        <ArticleMeta article={article} />
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <div className="blog-card__tags" aria-label="Article tags">
          {article.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      <span className="blog-card__arrow" aria-hidden="true">↗</span>
    </a>
  )
}

export default function Blog() {
  const rafRef = useRef(null)
  const [activeTag, setActiveTag] = useState('All')

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075
    })

    const raf = time => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [])

  const filteredArticles = useMemo(
    () => activeTag === 'All' ? articles : articles.filter(article => article.tags.includes(activeTag)),
    [activeTag]
  )
  const groupedArticles = useMemo(() => groupByYear(filteredArticles), [filteredArticles])
  const years = Object.keys(groupedArticles).sort((a, b) => b.localeCompare(a))

  return (
    <section className="blog-page" aria-label="Blog and field notes">
      <header className="blog-hero">
        <div className="blog-hero__eyebrow">EVAN GONG / FIELD NOTES</div>
        <h1 className="blog-hero__title-wrap">
          <GlitchText
            className="blog-hero__title"
            enableShadows
            afterShadow="-5px 0 rgba(255,255,255,0.65)"
            beforeShadow="5px 0 #00f0ff"
          >
            BLOG
          </GlitchText>
        </h1>
        <p className="blog-hero__intro">
          Notes on building AI agents, physical systems, and the tools that connect ideas to something real.
        </p>
      </header>

      <section className="blog-featured" aria-labelledby="blog-featured-heading">
        <div className="blog-section-heading">
          <span className="blog-section-heading__index">01</span>
          <h2 id="blog-featured-heading">Selected notes</h2>
        </div>
        <div className="blog-featured__grid">
          {featuredArticles.map(article => <ArticleLink key={article.slug} article={article} featured />)}
        </div>
      </section>

      <section className="blog-archive" aria-labelledby="blog-archive-heading">
        <div className="blog-section-heading">
          <span className="blog-section-heading__index">02</span>
          <h2 id="blog-archive-heading">All field notes</h2>
        </div>
        <div className="blog-filters" aria-label="Filter articles by topic">
          {['All', ...articleTags].map(tag => (
            <button
              key={tag}
              type="button"
              className={activeTag === tag ? 'blog-filter blog-filter--active' : 'blog-filter'}
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="blog-year-groups">
          {years.map(year => (
            <section key={year} className="blog-year-group" aria-labelledby={`blog-year-${year}`}>
              <h3 id={`blog-year-${year}`}>{year}</h3>
              <div className="blog-article-list">
                {groupedArticles[year].map(article => <ArticleLink key={article.slug} article={article} />)}
              </div>
            </section>
          ))}
        </div>
      </section>
    </section>
  )
}
