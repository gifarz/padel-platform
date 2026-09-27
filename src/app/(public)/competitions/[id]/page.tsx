import { notFound } from 'next/navigation'
import { getPublicCompetitionDetail, getMe } from '@/server/queries'
import { StatusBadge } from '@/components/ui/badge'
import { RegisterCompetitionForm } from '@/components/athlete/register-competition-form'
import { fmtDate, fmtNum } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda putra', WOMENS_DOUBLES: 'Ganda putri', MIXED_DOUBLES: 'Ganda campuran',
  MENS_SINGLES: 'Tunggal putra', WOMENS_SINGLES: 'Tunggal putri', OPEN: 'Terbuka',
}

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getPublicCompetitionDetail(id)
  if (!detail) notFound()
  const { competition: c, isRegistered, myStatus } = detail
  const me = await getMe()

  return (
    <div className="section">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="lb">{CATEGORY_LABEL[c.category] ?? c.category} · {c.location.name}, {c.location.city}</p>
          <h1 className="d text-5xl sm:text-7xl">{c.name}</h1>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {c.description && <p className="mt-6 max-w-2xl text-sm text-muted">{c.description}</p>}

      <div className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <div className="bg-bg p-5"><p className="d text-3xl">{c.participants.length}/{c.maxPlayers}</p><p className="lb">Peserta</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(c.startsAt)}</p><p className="lb">Mulai</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(c.registrationDeadline)}</p><p className="lb">Batas daftar</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl text-accent">{c.prize ?? '-'}</p><p className="lb">Hadiah</p></div>
      </div>

      {(c.minRating || c.maxRating) && (
        <p className="mt-4 text-xs text-muted">
          Syarat rating: {c.minRating ? `minimal ${fmtNum(c.minRating)}` : ''}{c.minRating && c.maxRating ? ', ' : ''}{c.maxRating ? `maksimal ${fmtNum(c.maxRating)}` : ''}
        </p>
      )}

      <div className="mt-10">
        {!me && <p className="text-sm text-muted">Masuk dulu untuk mendaftar kompetisi ini.</p>}
        {me && isRegistered && (
          <p className="border border-line bg-surface p-5 text-sm">
            Kamu sudah terdaftar dengan status: <StatusBadge status={myStatus ?? 'REGISTERED'} />
          </p>
        )}
        {me && !isRegistered && c.status === 'REGISTRATION_OPEN' && <RegisterCompetitionForm competitionId={c.id} />}
        {me && !isRegistered && c.status !== 'REGISTRATION_OPEN' && <p className="text-sm text-muted">Pendaftaran untuk kompetisi ini sudah ditutup.</p>}
      </div>

      <h2 className="d mt-12 text-2xl">Peserta terdaftar</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {c.participants.length === 0 && <p className="py-6 text-sm text-muted">Belum ada peserta.</p>}
        {c.participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-3">
            <p className="font-display text-lg uppercase">{p.athlete.user.name}</p>
            <p className="text-sm text-muted">{fmtNum(p.athlete.rating)} pts</p>
          </div>
        ))}
      </div>
    </div>
  )
}
