import Link from 'next/link'
import { getLeaderboard, getCities, getRecentTrends } from '@/server/queries'
import { fmtNum } from '@/lib/format'
import { Trend } from '@/components/ui/trend'
import { PageBanner } from '@/components/public/page-banner'

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city: cityParam } = await searchParams
  const city = cityParam ?? 'Semua'
  const [rows, cities] = await Promise.all([getLeaderboard({ city, take: 200 }), getCities()])
  const trends = await getRecentTrends(rows.map((r) => r.id))
  const sorted = rows.map((r) => ({ ...r, ...(trends.get(r.id) ?? { trend: 'flat' as const, value: 0 }) }))

  return (
    <div>
      <PageBanner eyebrow="Peringkat" title="Peringkat Pemain PBPI" description="Peringkat resmi seluruh pemain terdaftar, berdasarkan sistem poin ELO PBPI Kabupaten Garut." />

      <div className="section">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kecamatan">
          {cities.map((c) => (
            <Link
              key={c}
              href={c === 'Semua' ? '?' : `?city=${encodeURIComponent(c)}`}
              aria-current={city === c ? 'true' : undefined}
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-widest ${city === c ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-navy hover:text-navy'}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* desktop table */}
        <div className="mt-8 hidden border border-line sm:block">
          <div className="grid grid-cols-[3rem_1fr_8rem_6rem_7rem_7rem_5rem] gap-2 border-b border-line bg-surface px-4 py-3 text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            <span>#</span><span>Pemain</span><span>Kecamatan</span><span>Main</span><span>M/K</span><span>Poin</span><span>Tren</span>
          </div>
          {sorted.map((p, i) => (
            <Link
              key={p.id}
              href={`/profile/${p.username}`}
              className={`grid grid-cols-[3rem_1fr_8rem_6rem_7rem_7rem_5rem] items-center gap-2 border-b border-line px-4 py-3 last:border-0 hover:bg-surface ${i < 3 ? 'bg-surface/60' : ''}`}
            >
              <span className="d text-xl text-navy">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg font-bold text-ink">{p.name}</span>
              <span className="text-sm text-muted">{p.city}</span>
              <span className="text-sm">{p.matchesPlayed}</span>
              <span className="text-sm">{p.wins}/{p.losses}</span>
              <span className="d text-lg text-navy">{fmtNum(p.rating)}</span>
              <Trend trend={p.trend} value={p.value} />
            </Link>
          ))}
          {sorted.length === 0 && <p className="px-4 py-6 text-sm text-muted">Belum ada atlet di kecamatan ini.</p>}
        </div>

        {/* mobile cards */}
        <div className="mt-8 divide-y divide-line border-y border-line sm:hidden">
          {sorted.map((p, i) => (
            <Link key={p.id} href={`/profile/${p.username}`} className="flex items-center gap-3 py-3">
              <span className="d w-8 text-2xl text-muted">{i + 1}</span>
              <div className="flex-1">
                <p className="font-display text-lg font-bold leading-tight text-ink">{p.name}</p>
                <p className="text-xs text-muted">{p.city} · {p.matchesPlayed} main</p>
              </div>
              <div className="text-right">
                <p className="d text-lg text-navy">{fmtNum(p.rating)}</p>
                <Trend trend={p.trend} value={p.value} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
