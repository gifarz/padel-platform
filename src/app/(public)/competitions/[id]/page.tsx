import { notFound } from 'next/navigation'
import { getPublicCompetitionDetail, getMe, getCompetitionBracket } from '@/server/queries'
import { StatusBadge } from '@/components/ui/badge'
import { RegisterCompetitionForm } from '@/components/athlete/register-competition-form'
import { WithdrawButton } from '@/components/athlete/withdraw-button'
import { BracketView } from '@/components/admin/bracket-view'
import { CATEGORY_LABEL, isDoublesCategory, isRegistrationOpen } from '@/lib/competition'
import { fmtDate, fmtNum } from '@/lib/format'

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [detail, me] = await Promise.all([getPublicCompetitionDetail(id), getMe()])
  if (!detail) notFound()
  const { competition: c, isRegistered, myStatus, confirmedCount } = detail
  const registrationOpen = isRegistrationOpen(c)
  const canWithdraw = isRegistered && (c.status === 'REGISTRATION_OPEN' || c.status === 'REGISTRATION_CLOSED') && myStatus !== 'ELIMINATED' && myStatus !== 'WINNER'
  const bracket = c.status === 'ONGOING' || c.status === 'COMPLETED' ? await getCompetitionBracket(c.id) : null
  const doubles = isDoublesCategory(c.category)

  return (
    <div>
      <div className="border-b border-navy-dark bg-navy pt-[var(--header-h)] text-white">
        <div className="mx-auto flex max-w-site flex-wrap items-end justify-between gap-4 px-4 py-10 sm:px-8 sm:py-12">
          <div>
            <p className="lb text-white/60">{CATEGORY_LABEL[c.category] ?? c.category} · {c.location.name}, {c.location.city}</p>
            <h1 className="d mt-2 text-5xl sm:text-7xl">{c.name}</h1>
          </div>
          <StatusBadge status={c.status} />
        </div>
      </div>

      <div className="section">
      {c.description && <p className="max-w-2xl text-sm text-muted">{c.description}</p>}

      <div className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <div className="bg-bg p-5"><p className="d text-3xl">{confirmedCount}/{c.maxPlayers}</p><p className="lb">Peserta</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(c.startsAt)}</p><p className="lb">Mulai</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(c.registrationDeadline)}</p><p className="lb">Batas daftar</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl text-accent">{c.prize ?? '-'}</p><p className="lb">Hadiah</p></div>
      </div>

      {(c.minRating || c.maxRating) && (
        <p className="mt-4 text-xs text-muted">
          Syarat poin: {c.minRating ? `minimal ${fmtNum(c.minRating)}` : ''}{c.minRating && c.maxRating ? ', ' : ''}{c.maxRating ? `maksimal ${fmtNum(c.maxRating)}` : ''}
        </p>
      )}

      <div className="mt-10">
        {!me && <p className="text-sm text-muted">Masuk dulu untuk mendaftar kompetisi ini.</p>}
        {me && isRegistered && (
          <div className="border border-line bg-surface p-5 text-sm">
            <p>Kamu sudah terdaftar dengan status: <StatusBadge status={myStatus ?? 'REGISTERED'} /></p>
            {canWithdraw && <WithdrawButton competitionId={c.id} />}
          </div>
        )}
        {me && !isRegistered && registrationOpen && (
          <RegisterCompetitionForm competitionId={c.id} doubles={doubles || c.category === 'OPEN'} partnerOptional={c.category === 'OPEN'} />
        )}
        {me && !isRegistered && !registrationOpen && (
          <p className="text-sm text-muted">
            {c.status === 'REGISTRATION_OPEN' ? 'Batas pendaftaran sudah lewat.' : 'Pendaftaran untuk kompetisi ini sudah ditutup.'}
          </p>
        )}
      </div>

      <h2 className="d mt-12 text-2xl">Peserta terdaftar</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {c.participants.length === 0 && <p className="py-6 text-sm text-muted">Belum ada peserta.</p>}
        {c.participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-3">
            <p className="font-display text-lg uppercase">
              {p.athlete.user.name}{p.partner ? ` / ${p.partner.user.name}` : ''}
              {p.status === 'WINNER' && <span className="ml-2 text-xs text-accent">Juara</span>}
              {p.status === 'ELIMINATED' && <span className="ml-2 text-xs text-muted">Gugur</span>}
            </p>
            <p className="text-sm text-muted">{fmtNum(p.athlete.rating)} poin</p>
          </div>
        ))}
      </div>

      {bracket && (
        <>
          <h2 className="d mt-12 text-2xl">Bagan pertandingan</h2>
          <div className="mt-4 border border-line p-4"><BracketView rounds={bracket} /></div>
        </>
      )}
      </div>
    </div>
  )
}
