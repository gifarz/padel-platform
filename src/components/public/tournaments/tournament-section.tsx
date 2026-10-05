import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react'
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
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="section-title">Saatnya bertanding</p><h2 className="d mt-4 text-4xl text-navy sm:text-5xl">Next up. Game on.</h2><p className="mt-4 text-sm text-muted">Tandai kalendermu. Tantangan berikutnya menanti.</p></div>
        <Link href="/tournaments" className="section-link">Semua Turnamen <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="empty-state"><CalendarDays size={28} className="mx-auto mb-4 text-navy/40" aria-hidden="true" /><p className="font-semibold text-navy">Bersiap untuk pertandingan berikutnya.</p><p className="mt-2">Belum ada turnamen yang dijadwalkan saat ini. Pantau terus agenda kami.</p></div>
      ) : (
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.id}`} className="card group flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-navy text-center text-white">
                  <span className="d text-3xl">{t.startsAt.getDate()}</span><span className="mt-1 text-[10px] font-bold tracking-widest text-lime">{MONTH[t.startsAt.getMonth()]} {t.startsAt.getFullYear()}</span>
                </div>
                <span className={`rounded-full px-3 py-2 text-[10px] font-semibold ${t.status === 'REGISTRATION_OPEN' ? 'bg-lime/35 text-navy' : 'bg-surface text-muted'}`}>{STATUS_LABEL[t.status] ?? t.status}</span>
              </div>
              <p className="lb mt-7 text-accent">{CATEGORY_LABEL[t.category] ?? t.category}</p>
              <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-navy">{t.name}</h3>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted"><MapPin size={14} aria-hidden="true" />{t.location.city}</p>
              <div className="mt-auto pt-6"><div className="flex items-center justify-between border-t border-line pt-4"><p className="flex items-center gap-2 text-xs text-muted"><Users size={15} aria-hidden="true" />{t._count.participants} / {t.maxPlayers} Peserta</p><span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-navy transition group-hover:bg-lime"><ArrowUpRight size={18} aria-hidden="true" /></span></div></div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
