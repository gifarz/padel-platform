import { notFound } from 'next/navigation'
import { getAthleteAdminDetail, levelInfo } from '@/server/queries'
import { fmtNum, fmtDate } from '@/lib/format'
import { StatusBadge } from '@/components/ui/badge'

export default async function AdminAthleteDetail({ params }: { params: { id: string } }) {
  const detail = await getAthleteAdminDetail(params.id)
  if (!detail) notFound()
  const { athlete, history, matchCount, competitions } = detail
  const { level } = levelInfo(athlete.rating)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="lb">@{athlete.username} · {athlete.city} · {level.name}</p>
          <h1 className="d text-4xl sm:text-6xl">{athlete.user.name}</h1>
          <p className="mt-1 text-sm text-muted">{athlete.user.phone} · Terdaftar {fmtDate(athlete.user.createdAt)}</p>
        </div>
        <span className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${athlete.user.isActive ? 'border-line' : 'border-red-500/30 text-red-400'}`}>
          {athlete.user.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <div className="bg-bg p-5"><p className="d text-3xl text-accent">{fmtNum(athlete.rating)}</p><p className="lb">Rating</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtNum(athlete.peakRating)}</p><p className="lb">Puncak rating</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{matchCount}</p><p className="lb">Pertandingan</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{athlete.wins}/{athlete.losses}</p><p className="lb">Menang/Kalah</p></div>
      </div>

      <h2 className="d mt-10 text-2xl">Riwayat rating</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {history.length === 0 && <p className="py-6 text-sm text-muted">Belum ada riwayat perubahan rating.</p>}
        {history.map((h) => (
          <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm">{h.reason === 'MATCH' ? 'Hasil pertandingan' : h.reason === 'CORRECTION' ? 'Koreksi hasil' : h.reason === 'INITIAL' ? 'Rating awal' : 'Penyesuaian admin'}</p>
              <p className="text-xs text-muted">{fmtDate(h.createdAt)} · {h.ratingBefore} → {h.ratingAfter}{h.note ? ` · ${h.note}` : ''}</p>
            </div>
            <span className={`font-display text-lg ${h.ratingDelta > 0 ? 'text-accent' : h.ratingDelta < 0 ? 'text-red-400' : 'text-muted'}`}>
              {h.ratingDelta > 0 ? '+' : ''}{h.ratingDelta}
            </span>
          </div>
        ))}
      </div>

      <h2 className="d mt-10 text-2xl">Kompetisi diikuti</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {competitions.length === 0 && <p className="py-6 text-sm text-muted">Belum pernah ikut kompetisi.</p>}
        {competitions.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <p className="font-display text-lg uppercase">{c.competition.name}</p>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
