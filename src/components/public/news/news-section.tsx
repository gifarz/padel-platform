import Link from 'next/link'
import Image from 'next/image'
import { getLatestNews } from '@/server/queries'
import { fmtDate } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export async function NewsSection() {
  const news = await getLatestNews(3)

  return (
    <section className="section">
      <p className="section-title">Kabar Terkini</p>
      <h2 className="d mt-3 text-4xl text-navy sm:text-5xl lg:text-6xl">Berita Terbaru</h2>

      {news.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Belum ada berita yang dipublikasikan.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="card block overflow-hidden">
              <div className="relative h-40 w-full bg-surface2">
                {n.coverUrl && <Image src={n.coverUrl} alt="" fill className="object-cover" />}
              </div>
              <div className="p-4">
                <p className="lb text-accent">{CATEGORY_LABEL[n.category] ?? n.category} &middot; {fmtDate(n.publishedAt)}</p>
                <p className="mt-2 font-display text-xl font-extrabold leading-snug text-ink">{n.title}</p>
                {n.excerpt && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{n.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/news" className="mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.06em] text-accent">
        Lihat Semua Berita →
      </Link>
    </section>
  )
}
