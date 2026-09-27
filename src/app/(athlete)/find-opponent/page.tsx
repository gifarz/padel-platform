import Link from 'next/link'
import { getDiscovery, getCities } from '@/server/queries'
import { SortSelect } from '@/components/athlete/sort-select'
import { fmtNum } from '@/lib/format'

const SORTS = [
  { value: 'match', label: 'Level match terbaik' },
  { value: 'rating', label: 'Rating' },
  { value: 'active', label: 'Paling aktif' },
] as const

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { city?: string; sort?: 'match' | 'rating' | 'active' }
}) {
  const city = searchParams.city ?? 'Semua'
  const sort = searchParams.sort ?? 'match'
  const [list, cities] = await Promise.all([getDiscovery({ city, sort }), getCities()])

  const qs = (over: Partial<{ city: string; sort: string }>) => {
    const p = new URLSearchParams({ city, sort, ...over })
    if (p.get('city') === 'Semua') p.delete('city')
    return `?${p.toString()}`
  }

  return (
    <div>
      <h1 className="d text-5xl sm:text-7xl">
        Cari<br /><span className="text-accent">lawan main.</span>
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c}
            href={qs({ city: c })}
            className={`border px-4 py-2 text-xs font-bold uppercase tracking-widest ${city === c ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-ink hover:text-ink'}`}
          >
            {c}
          </Link>
        ))}
        <div className="ml-auto">
          <SortSelect options={SORTS} />
        </div>
      </div>

      {list.length === 0 && <p className="mt-10 text-sm text-muted">Tidak ada atlet lain yang cocok dengan filter ini.</p>}

      <div className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 bg-bg p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-2xl uppercase">{p.name}</p>
                <p className="text-sm text-muted">{p.city}</p>
              </div>
              <div className="text-right">
                <p className="d text-3xl text-accent">{p.match}%</p>
                <p className="lb">Match</p>
              </div>
            </div>
            <div className="flex gap-6 border-t border-line pt-3 text-sm">
              <div><span className="block font-display text-lg">{fmtNum(p.rating)}</span><span className="lb">Poin</span></div>
              <div><span className="block font-display text-lg">{p.winRate}%</span><span className="lb">Menang</span></div>
              <div><span className="block font-display text-lg">{p.matchesPlayed}</span><span className="lb">Main</span></div>
            </div>
            <Link href={`/profile/${p.username}`} className="mt-1 border border-ink py-2.5 text-center text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-bg">
              Lihat profil →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
