import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug } from '@/server/queries'
import { fmtDate } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const news = await getNewsBySlug(slug)
  if (!news) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <Link href="/news" className="text-xs font-bold uppercase tracking-widest text-accent">← Kembali ke Berita</Link>

      <p className="lb mt-6 text-accent">{CATEGORY_LABEL[news.category] ?? news.category} &middot; {fmtDate(news.publishedAt)}</p>
      <h1 className="d mt-2 text-3xl text-navy sm:text-4xl">{news.title}</h1>
      {news.author && <p className="mt-3 text-xs text-muted">Oleh {news.author.name}</p>}

      {news.coverUrl && (
        <div className="relative mt-6 h-64 w-full overflow-hidden rounded-sm border border-line sm:h-80">
          <Image src={news.coverUrl} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink sm:text-base">
        {news.content.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </article>
  )
}
