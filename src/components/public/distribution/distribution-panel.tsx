import Link from 'next/link'
import { fmtNum } from '@/lib/format'
import type { DistrictRow } from './garut-map'
import type { DistributionMode } from './distribution-toggle'

export function DistributionPanel({
  rows,
  mode,
  totalPlayers,
  totalClubs,
  activeDistricts,
  selectedSlug,
  onClearSelection,
}: {
  rows: DistrictRow[]
  mode: DistributionMode
  totalPlayers: number
  totalClubs: number
  activeDistricts: number
  selectedSlug: string | null
  onClearSelection: () => void
}) {
  const selected = selectedSlug ? rows.find((r) => r.slug === selectedSlug) : null
  const ranked = [...rows]
    .sort((a, b) => (mode === 'players' ? b.players - a.players : b.clubs - a.clubs))
    .filter((r) => (mode === 'players' ? r.players > 0 : r.clubs > 0))
    .slice(0, 5)

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card p-4">
          <p className="d text-2xl text-navy">{fmtNum(totalPlayers)}</p>
          <p className="lb mt-1">Pemain</p>
        </div>
        <div className="card p-4">
          <p className="d text-2xl text-navy">{fmtNum(totalClubs)}</p>
          <p className="lb mt-1">Klub</p>
        </div>
        <div className="card p-4">
          <p className="d text-2xl text-navy">{activeDistricts}/42</p>
          <p className="lb mt-1">Kecamatan Aktif</p>
        </div>
      </div>

      {selected && (
        <div className="card mt-4 flex items-center justify-between p-3 text-sm">
          <span>
            <span className="font-bold text-navy">{selected.district}</span> &middot; {selected.players} pemain &middot; {selected.clubs} klub
          </span>
          <div className="flex items-center gap-3">
            <Link href={`/players?districtId=${selected.districtId}`} className="text-xs font-bold uppercase tracking-widest text-accent">
              Lihat Pemain →
            </Link>
            <button type="button" onClick={onClearSelection} aria-label="Hapus filter kecamatan" className="text-muted hover:text-navy">
              ✕
            </button>
          </div>
        </div>
      )}

      <p className="section-title mt-6">Peringkat Kecamatan</p>
      <ol className="mt-3 divide-y divide-line border-y border-line">
        {ranked.length === 0 && (
          <li className="py-6 text-sm text-muted">Belum ada data untuk ditampilkan.</li>
        )}
        {ranked.map((r, i) => (
          <li key={r.districtId} className={`flex items-center gap-3 py-3 ${selectedSlug === r.slug ? 'bg-surface' : ''}`}>
            <span className="d w-6 text-lg text-muted">{i + 1}</span>
            <span className="flex-1 text-sm font-semibold text-ink">{r.district}</span>
            <span className="d text-lg text-navy">{mode === 'players' ? r.players : r.clubs}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
