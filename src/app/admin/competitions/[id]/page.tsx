import { notFound } from 'next/navigation'
import { getCompetitionDetail, getCompetitionBracket } from '@/server/queries'
import { StatusBadge } from '@/components/ui/badge'
import { ParticipantStatus } from '@/components/admin/participant-status'
import { GenerateBracketForm } from '@/components/admin/generate-bracket-form'
import { BracketView } from '@/components/admin/bracket-view'
import { fmtDate, fmtNum } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda putra', WOMENS_DOUBLES: 'Ganda putri', MIXED_DOUBLES: 'Ganda campuran',
  MENS_SINGLES: 'Tunggal putra', WOMENS_SINGLES: 'Tunggal putri', OPEN: 'Terbuka',
}

export default async function AdminCompetitionDetail({ params }: { params: { id: string } }) {
  const comp = await getCompetitionDetail(params.id)
  if (!comp) notFound()
  const bracket = await getCompetitionBracket(comp.id)
  const confirmedCount = comp.participants.filter((p) => p.status === 'CONFIRMED').length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="lb">{CATEGORY_LABEL[comp.category] ?? comp.category} · {comp.location.city}</p>
          <h1 className="d text-4xl sm:text-6xl">{comp.name}</h1>
        </div>
        <StatusBadge status={comp.status} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <div className="bg-bg p-5"><p className="d text-3xl">{comp.participants.length}/{comp.maxPlayers}</p><p className="lb">Peserta</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(comp.startsAt)}</p><p className="lb">Mulai</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl">{fmtDate(comp.registrationDeadline)}</p><p className="lb">Batas daftar</p></div>
        <div className="bg-bg p-5"><p className="d text-3xl text-accent">{comp.prize ?? '-'}</p><p className="lb">Hadiah</p></div>
      </div>

      <h2 className="d mt-10 text-2xl">Peserta</h2>
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th">Pasangan</th><th className="th">Rating</th><th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {comp.participants.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">
                  {p.athlete.user.name}{p.partner ? ` / ${p.partner.user.name}` : ''}
                </td>
                <td className="td text-accent">{fmtNum(p.athlete.rating)}</td>
                <td className="td"><ParticipantStatus id={p.id} status={p.status} competitionId={comp.id} /></td>
              </tr>
            ))}
            {comp.participants.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-sm text-muted">Belum ada peserta terdaftar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="d mt-10 text-2xl">Bracket turnamen</h2>
      {bracket ? (
        <div className="mt-4 border border-line p-4">
          <BracketView rounds={bracket} />
        </div>
      ) : (
        <div className="mt-4 border border-dashed border-line p-6">
          <p className="text-sm text-muted">
            Belum dibuat. {confirmedCount} peserta berstatus "Dikonfirmasi" siap diundi. Ubah status peserta di atas dulu kalau ada yang belum dikonfirmasi.
            Sistem otomatis mengisi bye kalau jumlah peserta bukan kelipatan 2, dan pemenang tiap babak maju otomatis begitu hasilnya diverifikasi.
          </p>
          <GenerateBracketForm competitionId={comp.id} />
        </div>
      )}
    </div>
  )
}
