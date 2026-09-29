import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

/** Minimal shape of the hast nodes react-markdown hands to component overrides. */
type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] }

const YOUTUBE_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/

function youtubeIdOf(node?: HNode): string | null {
  // A paragraph that is just one bare YouTube URL becomes an embedded player.
  const kids = node?.children?.filter((c) => !(c.type === 'text' && !c.value?.trim()))
  const link = kids?.length === 1 ? kids[0] : undefined
  if (!link || link.tagName !== 'a') return null
  const href = String(link.properties?.href ?? '')
  const text = link.children?.map((c) => c.value ?? '').join('') ?? ''
  if (text.replace(/^https?:\/\//, '') !== href.replace(/^https?:\/\//, '')) return null // real [label](url) links stay links
  return href.match(YOUTUBE_RE)?.[1] ?? null
}

const components: Components = {
  h1: ({ children }) => <h2 className="d mt-10 text-3xl text-navy sm:text-4xl">{children}</h2>,
  h2: ({ children }) => <h2 className="d mt-10 text-3xl text-navy sm:text-4xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-display text-xl font-extrabold text-navy sm:text-2xl">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 font-display text-lg font-bold text-navy">{children}</h4>,

  p: ({ node, children }) => {
    const n = node as HNode | undefined
    const yt = youtubeIdOf(n)
    if (yt) {
      return (
        <div className="my-8 aspect-video w-full overflow-hidden rounded border border-line bg-navy-dark">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            title="Video YouTube"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }
    // <figure> can't live inside <p>, so paragraphs holding images become a <div>.
    if (n?.children?.some((c) => c.tagName === 'img')) return <div className="my-8 space-y-6">{children}</div>
    return <p className="my-5">{children}</p>
  },

  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string') return null
    return (
      <figure className="mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''} loading="lazy" className="mx-auto max-h-[36rem] w-full rounded border border-line object-cover" />
        {alt && <figcaption className="mt-2 text-center text-xs text-muted">{alt}</figcaption>}
      </figure>
    )
  },

  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="font-semibold text-accent underline underline-offset-2 hover:text-accentDeep"
      >
        {children}
      </a>
    )
  },

  ul: ({ children }) => <ul className="my-5 list-disc space-y-1.5 pl-6 marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 list-decimal space-y-1.5 pl-6 marker:font-bold marker:text-navy">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-accent bg-surface py-3 pl-5 pr-4 text-lg italic text-navy [&>p]:my-1">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-line" />,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => <pre className="my-6 overflow-x-auto rounded border border-line bg-surface p-4 text-sm">{children}</pre>,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[420px] border border-line text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line bg-surface px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2">{children}</td>,
}

/**
 * Renders admin-authored news content. Raw HTML in the source is NOT rendered
 * (react-markdown escapes it), so admin-written content can't inject scripts.
 * remark-breaks keeps single line breaks, which is how articles written before
 * the rich editor (plain text, one paragraph per line) were displayed.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-base leading-relaxed text-ink sm:text-lg [&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
