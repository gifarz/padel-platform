import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug } from '@/server/queries'
import { fmtDate } from '@/lib/format'
import { Markdown } from '@/components/content/markdown'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const news = await getNewsBySlug(slug)
  if (!news) notFound()

  return (
    <article>
      <div className="border-b border-navy-dark bg-navy pt-[var(--header-h)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-12">
          <Link href="/news" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">← Kembali ke Berita</Link>

          <p className="lb mt-6 text-white/60">{CATEGORY_LABEL[news.category] ?? news.category} &middot; {fmtDate(news.publishedAt)}</p>
          <h1 className="d mt-3 text-4xl sm:text-5xl">{news.title}</h1>
          {news.author && <p className="mt-3 text-xs text-white/60">Oleh {news.author.name}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      {news.coverUrl && (
        <div className="relative mt-6 h-64 w-full overflow-hidden rounded-sm border border-line sm:h-80">
          <Image src={news.coverUrl} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="mt-8">
        <Markdown>{news.content}</Markdown>
      </div>
      </div>
    </article>
  )
}
