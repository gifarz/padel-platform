import Link from 'next/link'
import { getMe, getDiscovery, getMyMatches, levelInfo, getLeaderboard } from '@/server/queries'
import { fmtNum, fmtDate } from '@/lib/format'
import { ProgressBar } from '@/components/ui/progress-bar'
import { StatusBadge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const me = await getMe()
  if (!me) return null // middleware already redirects signed-out visitors

  const [{ level, next }, rivals, matches, board] = await Promise.all([
    Promise.resolve(levelInfo(me.rating)),
    getDiscovery({ sort: 'match' }).then((r) => r.slice(0, 3)),
    getMyMatches(),
    getLeaderboard({ take: 500 }),
  ])
  const rank = board.findIndex((a) => a.id === me.id) + 1
  const upcoming = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'REQUESTED').slice(0, 4)

  return (
    <div className="space-y-14">
      <section>
        <p className="lb">Selamat datang kembali,</p>
        <h1 className="d text-5xl sm:text-7xl">{me.name.split(' ')[0]}.</h1>

        <div className="mt-8 grid gap-1 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="border border-line bg-surface p-6">
            <p className="lb">Poin saat ini</p>
            <p className="d text-6xl text-accent sm:text-7xl">{fmtNum(me.rating)}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest">{level.name}</p>
          </div>
          <div className="border border-t-0 border-line bg-surface p-6 sm:border-t sm:border-l-0">
            <p className="lb">Peringkat</p>
            <p className="d text-5xl">{rank ? `#${rank}` : '-'}</p>
            <p className="mt-1 text-sm text-muted">dari {board.length} atlet</p>
          </div>
          <div className="border border-t-0 border-line bg-surface p-6 sm:border-t sm:border-l-0">
            <p className="lb">Win rate</p>
            <p className="d text-5xl">{me.winRate}%</p>
            <p className="mt-1 text-sm text-muted">{me.wins} menang / {me.losses} kalah</p>
          </div>
        </div>

        {next && (
          <div className="mt-1 border border-t-0 border-line bg-surface p-6">
            <div className="flex items-baseline justify-between">
              <p className="lb">Menuju level {next.level.name}</p>
              <p className="text-sm font-bold text-accent">{next.points} poin lagi</p>
            </div>
            <ProgressBar percent={100 - (next.points / (next.level.minRating - level.minRating || 1)) * 100} className="mt-3" />
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="d text-3xl sm:text-4xl">Lawan yang cocok buatmu</h2>
          <Link href="/find-opponent" className="text-xs font-bold uppercase tracking-widest text-accent">Lihat semua →</Link>
        </div>
        {rivals.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Belum ada atlet lain yang terdaftar di kotamu.</p>
        ) : (
          <div className="mt-5 grid gap-px bg-line sm:grid-cols-3">
            {rivals.map((r) => (
              <div key={r.id} className="bg-bg p-5">
                <p className="d text-4xl text-accent">{r.match}%</p>
                <p className="lb">Level match</p>
                <p className="mt-3 font-display text-2xl uppercase">{r.name}</p>
                <p className="text-sm text-muted">{r.city} · {fmtNum(r.rating)} poin</p>
                <Link href={`/profile/${r.username}`} className="mt-4 inline-block border border-ink px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-bg">
                  Tantang →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="d text-3xl sm:text-4xl">Pertandingan mendatang</h2>
          <Link href="/matches" className="text-xs font-bold uppercase tracking-widest text-accent">Semua pertandingan →</Link>
        </div>
        <div className="mt-5 divide-y divide-line border-y border-line">
          {upcoming.length === 0 && <p className="py-6 text-sm text-muted">Belum ada pertandingan yang dijadwalkan.</p>}
          {upcoming.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-display text-xl uppercase">vs {m.label}</p>
                <p className="text-sm text-muted">{fmtDate(m.date)} · {m.court ?? 'Lapangan belum ditentukan'}</p>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
