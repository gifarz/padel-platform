import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { getLatestNews } from '@/server/queries'
import { fmtDate } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export async function NewsSection() {
  const news = await getLatestNews(3)

  return (
    <section className="section">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="section-title">Di dalam & di luar lapangan</p><h2 className="d mt-4 text-4xl text-navy sm:text-5xl">Cerita dari lapangan.</h2></div>
        <Link href="/news" className="section-link">Semua Berita <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>

      {news.length === 0 ? (
        <p className="empty-state">Cerita baru segera hadir. Belum ada berita yang dipublikasikan.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="card group block overflow-hidden">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface2">
                <Image src={n.coverUrl || '/images/racket-balls.jpg'} alt="" fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-navy">{CATEGORY_LABEL[n.category] ?? n.category}</span>
              </div>
              <div className="p-6">
                <p className="text-xs text-muted">{fmtDate(n.publishedAt)}</p>
                <p className="mt-2 font-display text-xl font-extrabold leading-snug text-ink">{n.title}</p>
                {n.excerpt && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{n.excerpt}</p>}
                <span className="mt-6 flex items-center gap-2 text-xs font-bold text-navy">Baca Cerita <ArrowUpRight size={16} aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </section>
  )
}
