import Link from 'next/link'
import { getUpcomingTournaments } from '@/server/queries'

const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda Putra', WOMENS_DOUBLES: 'Ganda Putri', MIXED_DOUBLES: 'Ganda Campuran',
  MENS_SINGLES: 'Tunggal Putra', WOMENS_SINGLES: 'Tunggal Putri', OPEN: 'Terbuka',
}
const STATUS_LABEL: Record<string, string> = {
  REGISTRATION_OPEN: 'Pendaftaran Dibuka', REGISTRATION_CLOSED: 'Pendaftaran Ditutup', ONGOING: 'Berlangsung',
}
const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']

export async function TournamentSection() {
  const tournaments = await getUpcomingTournaments(3)

  return (
    <section className="section">
      <p className="section-title">Kompetisi</p>
      <h2 className="d mt-3 text-4xl text-navy sm:text-5xl lg:text-6xl">Turnamen Mendatang</h2>

      {tournaments.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Belum ada turnamen yang dijadwalkan saat ini.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {tournaments.map((t) => (
            <div key={t.id} className="card flex gap-4 p-5">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center border border-line bg-surface text-center">
                <span className="d text-lg leading-none text-navy">{t.startsAt.getDate()}</span>
                <span className="lb !text-[0.6rem]">{MONTH[t.startsAt.getMonth()]}</span>
              </div>
              <div className="min-w-0">
                <p className="lb text-accent">{STATUS_LABEL[t.status] ?? t.status}</p>
                <p className="mt-1 truncate font-display text-lg font-extrabold text-ink">{t.name}</p>
                <p className="mt-1 text-xs text-muted">{t.location.city} &middot; {CATEGORY_LABEL[t.category] ?? t.category}</p>
                <p className="mt-1 text-xs font-semibold text-navy">{t._count.participants} / {t.maxPlayers} Peserta</p>
                <Link href={`/tournaments/${t.id}`} className="mt-2 inline-block text-[13px] font-bold uppercase tracking-[0.06em] text-accent">
                  Detail Turnamen →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
