import Link from 'next/link'
import { getAthletesPage, getDistricts, getClubsForPicker, AthleteFilters } from '@/server/queries'
import { PageBanner } from '@/components/public/page-banner'
import { fmtNum } from '@/lib/format'
import { DEFAULT_LEVELS } from '@/lib/rating/levels'

const GENDER_LABEL: Record<string, string> = { MALE: 'Laki-laki', FEMALE: 'Perempuan' }

type Search = { q?: string; gender?: string; districtId?: string; clubId?: string; level?: string; page?: string }

export default async function PlayersDirectoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const filters: AthleteFilters = {
    gender: sp.gender === 'MALE' ? 'MALE' : sp.gender === 'FEMALE' ? 'FEMALE' : undefined,
    districtId: sp.districtId || undefined,
    clubId: sp.clubId || undefined,
    levelSlug: sp.level || undefined,
  }

  const [{ rows, total, pages }, districts, clubs] = await Promise.all([
    getAthletesPage(sp.q ?? '', page, filters),
    getDistricts(),
    getClubsForPicker(),
  ])

  // Preserves every other filter when a <select> or pagination link changes one of them.
  const qs = (over: Partial<Search>) => {
    const merged: Search = { ...sp, page: undefined, ...over }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v)
    const s = p.toString()
    return s ? `?${s}` : '?'
  }

  return (
    <div>
      <PageBanner
        eyebrow="Direktori"
        title="Direktori Pemain"
        description={`${total} pemain terdaftar resmi di PBPI Kabupaten Garut.`}
      />

      <div className="section">
        <form method="GET" className="grid gap-3 sm:grid-cols-5">
          <label htmlFor="players-q" className="sr-only">Cari pemain</label>
          <input id="players-q" name="q" defaultValue={sp.q} placeholder="Cari nama atau kecamatan…" className="inp sm:col-span-2" />
          <label htmlFor="players-gender" className="sr-only">Filter jenis kelamin</label>
          <select id="players-gender" name="gender" defaultValue={sp.gender ?? ''} className="inp">
            <option value="">Semua Gender</option>
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
          <label htmlFor="players-district" className="sr-only">Filter kecamatan</label>
          <select id="players-district" name="districtId" defaultValue={sp.districtId ?? ''} className="inp">
            <option value="">Semua Kecamatan</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label htmlFor="players-club" className="sr-only">Filter klub</label>
          <select id="players-club" name="clubId" defaultValue={sp.clubId ?? ''} className="inp">
            <option value="">Semua Klub</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2 sm:col-span-5" role="group" aria-label="Filter berdasarkan level">
            {DEFAULT_LEVELS.map((l) => (
              <Link
                key={l.slug}
                href={qs({ level: sp.level === l.slug ? undefined : l.slug })}
                aria-pressed={sp.level === l.slug}
                className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${sp.level === l.slug ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-navy hover:text-navy'}`}
              >
                {l.name}
              </Link>
            ))}
            <button type="submit" className="btn-p ml-auto">Terapkan Filter</button>
          </div>
        </form>

        {rows.length === 0 ? (
          <p className="mt-10 text-sm text-muted">Tidak ada pemain yang cocok dengan filter ini.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <Link key={p.id} href={`/profile/${p.username}`} className="card flex flex-col gap-3 p-5 transition hover:border-navy">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.city} {p.club ? `· ${p.club}` : ''}</p>
                  </div>
                  <span className="lb text-accent">{GENDER_LABEL[p.gender] ?? ''}</span>
                </div>
                <div className="flex gap-6 border-t border-line pt-3 text-sm">
                  <div><span className="d block text-lg text-navy">{fmtNum(p.rating)}</span><span className="lb">Poin</span></div>
                  <div><span className="d block text-lg text-navy">{p.winRate}%</span><span className="lb">Menang</span></div>
                  <div><span className="d block text-lg text-navy">{p.matchesPlayed}</span><span className="lb">Main</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Navigasi halaman" className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={qs({ page: String(p) })}
                aria-current={p === page ? 'page' : undefined}
                className={`flex h-9 w-9 items-center justify-center border text-sm font-semibold ${p === page ? 'border-navy bg-navy text-white' : 'border-line text-ink hover:border-navy'}`}
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
