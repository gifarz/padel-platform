import Link from 'next/link'
import Image from 'next/image'
import { PageBanner } from '@/components/public/page-banner'
import { getNewsList } from '@/server/queries'
import { fmtDate } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export default async function NewsListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { rows, totalPages } = await getNewsList(page)

  return (
    <div>
      <PageBanner eyebrow="Kabar Terkini" title="Berita" description="Kabar seputar organisasi, turnamen, prestasi, dan komunitas padel Kabupaten Garut." />

      <div className="section">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Belum ada berita yang dipublikasikan.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((n) => (
              <Link key={n.id} href={`/news/${n.slug}`} className="card block overflow-hidden">
                <div className="relative h-44 w-full bg-surface2">
                  {n.coverUrl && <Image src={n.coverUrl} alt="" fill className="object-cover" />}
                </div>
                <div className="p-4">
                  <p className="lb text-accent">{CATEGORY_LABEL[n.category] ?? n.category} &middot; {fmtDate(n.publishedAt)}</p>
                  <p className="mt-2 font-display text-base font-bold leading-snug text-ink">{n.title}</p>
                  {n.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{n.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Navigasi halaman" className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/news?page=${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`flex h-9 w-9 items-center justify-center border text-sm font-semibold ${
                  p === page ? 'border-navy bg-navy text-white' : 'border-line text-ink hover:border-navy'
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
