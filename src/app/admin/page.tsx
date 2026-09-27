import Link from 'next/link'
import { getAdminStats, getPendingVerifications } from '@/server/queries'
import { fmtDate } from '@/lib/format'

export default async function AdminDashboard() {
  const [stats, pending] = await Promise.all([getAdminStats(), getPendingVerifications()])

  const cards = [
    { label: 'Total atlet', value: stats.totalAthletes, href: '/admin/athletes' },
    { label: 'Kompetisi aktif', value: stats.activeCompetitions, href: '/admin/competitions' },
    { label: 'Pertandingan bulan ini', value: stats.matchesThisMonth, href: '/admin/matches' },
    { label: 'Hasil menunggu verifikasi', value: stats.pendingResults, href: '/admin/matches' },
    { label: 'Pelatih', value: stats.trainers, href: '/admin/trainers' },
    { label: 'Wasit', value: stats.referees, href: '/admin/referees' },
  ]

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Ringkasan</h1>

      <div className="mt-8 grid grid-cols-2 gap-px bg-line lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-bg p-6 hover:bg-surface">
            <p className="d text-5xl">{c.value}</p>
            <p className="lb mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="d text-2xl">Hasil menunggu verifikasi</h2>
          <Link href="/admin/matches" className="text-xs font-bold uppercase tracking-widest text-accent">Lihat semua →</Link>
        </div>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {pending.length === 0 && <p className="py-6 text-sm text-muted">Tidak ada hasil yang menunggu verifikasi saat ini.</p>}
          {pending.slice(0, 5).map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-display text-lg uppercase">{m.teamA} vs {m.teamB}</p>
                <p className="text-sm text-muted">{fmtDate(m.date)} · {m.court ?? '-'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
