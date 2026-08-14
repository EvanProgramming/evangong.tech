import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Lenis from 'lenis'
import Shuffle from '../Shuffle/Shuffle.jsx'
import ProtectedImage from '../ProtectedImage/ProtectedImage.jsx'
import './BlogPost.css'
import { articles, getArticle } from './blogData.js'

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

function formatDate(date) {
  if (!date) return 'Undated'
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function getHeadings(content) {
  return [...content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match, index) => ({
    id: slugify(match[1]),
    label: match[1],
    level: match[0].startsWith('###') ? 3 : 2,
    index
  }))
}

function MarkdownHeading({ level, children }) {
  const Tag = `h${level}`
  const text = Array.isArray(children) ? children.join('') : String(children)
  return <Tag id={slugify(text)}>{children}</Tag>
}

export default function BlogPost() {
  const { slug } = useParams()
  const article = getArticle(slug)
  const rafRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const headings = useMemo(() => article ? getHeadings(article.content) : [], [article])
  const related = useMemo(() => article
    ? articles.filter(candidate => candidate.slug !== article.slug && candidate.tags.some(tag => article.tags.includes(tag))).slice(0, 2)
    : [], [article])

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

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [slug])

  if (!article) return <Navigate to="/blog" replace />

  return (
    <article className="blog-post" aria-label={article.title}>
      <div className="blog-post__progress" style={{ '--blog-progress': `${progress}%` }} aria-hidden="true" />
      <a href="/blog" data-nav-link className="blog-post__back">← <span>Back to Field Notes</span></a>

      <header className="blog-post__hero">
        <div className="blog-post__eyebrow">FIELD NOTE / {article.year}</div>
        <Shuffle
          key={article.slug}
          text={article.title}
          tag="h1"
          className="blog-post__title"
          colorTo="#00f0ff"
          triggerOnHover={false}
          triggerOnce
          shuffleTimes={2}
          animationMode="evenodd"
          style={{ display: 'inline-block' }}
        />
        <p className="blog-post__excerpt">{article.excerpt}</p>
        <div className="blog-post__meta">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span>{article.readingTime} min read</span>
          <div className="blog-card__tags" aria-label="Article tags">
            {article.tags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </header>

      <div className="blog-post__cover-wrap">
        <ProtectedImage src={article.cover} alt={article.imageAlt} className="blog-post__cover" loading="eager" fetchPriority="high" data-transition-critical="true" sizes="(max-width: 900px) 100vw, 70rem" />
      </div>

      <div className="blog-post__layout">
        <aside className="blog-post__toc" aria-label="Article contents">
          <span className="blog-post__toc-label">ON THIS PAGE</span>
          <nav aria-label="Article contents">
            {headings.map(heading => (
              <a key={heading.index} className={heading.level === 3 ? 'blog-post__toc-link blog-post__toc-link--sub' : 'blog-post__toc-link'} href={`#${heading.id}`}>
                {heading.label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="blog-post__body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: props => <MarkdownHeading level={2} {...props} />,
              h3: props => <MarkdownHeading level={3} {...props} />,
              img: ({ alt, ...props }) => <ProtectedImage {...props} alt={alt || 'Article image'} loading="lazy" sizes="(max-width: 700px) 100vw, 46rem" />,
              a: ({ href, children, ...props }) => <a {...props} href={href}>{children}</a>
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>

      {related.length > 0 && (
        <section className="blog-post__related" aria-labelledby="related-notes-heading">
          <div className="blog-section-heading">
            <span className="blog-section-heading__index">03</span>
            <h2 id="related-notes-heading">Keep reading</h2>
          </div>
          <div className="blog-post__related-grid">
            {related.map(relatedArticle => (
              <a key={relatedArticle.slug} href={`/blog/${relatedArticle.slug}`} data-nav-link className="blog-related-card">
                <span>{relatedArticle.year}</span>
                <h3>{relatedArticle.title}</h3>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <a href="/blog" data-nav-link className="blog-post__end-link">Back to all field notes <span aria-hidden="true">→</span></a>
    </article>
  )
}
