import Link from 'next/link'
import { getPublicCompetitions } from '@/server/queries'
import { StatusBadge } from '@/components/ui/badge'
import { fmtDate } from '@/lib/format'
import { PageBanner } from '@/components/public/page-banner'

const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda putra', WOMENS_DOUBLES: 'Ganda putri', MIXED_DOUBLES: 'Ganda campuran',
  MENS_SINGLES: 'Tunggal putra', WOMENS_SINGLES: 'Tunggal putri', OPEN: 'Terbuka',
}

export default async function CompetitionsPage() {
  const competitions = await getPublicCompetitions()

  return (
    <div>
      <PageBanner eyebrow="Kompetisi" title="Turnamen & Kompetisi" />
      <div className="section">
      {competitions.length === 0 && <p className="mt-8 text-sm text-muted">Belum ada kompetisi yang dibuka pendaftarannya.</p>}

      <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
        {competitions.map((c) => (
          <Link key={c.id} href={`/competitions/${c.id}`} className="flex flex-col gap-3 bg-bg p-6 hover:bg-surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="lb">{CATEGORY_LABEL[c.category] ?? c.category} · {c.location.city}</p>
                <p className="font-display text-2xl uppercase leading-tight">{c.name}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 text-sm text-muted">
              <span>{fmtDate(c.startsAt)}</span>
              <span>{c._count.participants}/{c.maxPlayers} peserta</span>
              {c.prize && <span className="text-accent">Hadiah {c.prize}</span>}
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  )
}
