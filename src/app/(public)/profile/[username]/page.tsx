import { notFound } from 'next/navigation'
import { getAthleteByUsername, getVerifiedMatches, getMe, levelInfo } from '@/server/queries'
import { requestMatchAction } from '@/server/actions/matches'
import { fmtNum, fmtDate } from '@/lib/format'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const athlete = await getAthleteByUsername(username)
  if (!athlete) notFound()

  const [me, matches] = await Promise.all([getMe(), getVerifiedMatches(athlete.id)])
  const { level } = levelInfo(athlete.rating)
  const isMe = me?.id === athlete.id

  async function challenge() {
    'use server'
    await requestMatchAction(athlete!.id)
  }

  return (
    <div>
      <div className="border-b border-navy-dark bg-navy pt-[var(--header-h)] text-white">
        <div className="mx-auto flex max-w-site flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-8 sm:py-12">
          <div>
            <p className="lb text-white/60">{level.name} · {athlete.city}</p>
            <h1 className="d mt-2 text-5xl sm:text-7xl">{athlete.name}</h1>
            <p className="mt-1 text-white/70">@{athlete.username}</p>
            {(athlete.dominantHand || athlete.preferredPosition) && (
              <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-white/70">
                {athlete.dominantHand && <span>Tangan dominan: {athlete.dominantHand}</span>}
                {athlete.preferredPosition && <span>Posisi favorit: {athlete.preferredPosition}</span>}
              </p>
            )}
          </div>
          {isMe ? (
            <a href="/settings" className="border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/80 hover:border-white hover:text-white">
              Edit profil
            </a>
          ) : me && (
            <form action={challenge}>
              <button className="border border-accent bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">
                Tantang pemain →
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="section">
      {athlete.bio && <p className="text-sm text-ink/85">{athlete.bio}</p>}

      <div className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <div className="bg-bg p-5"><p className="d text-4xl text-accent">{fmtNum(athlete.rating)}</p><p className="lb">Poin</p></div>
        <div className="bg-bg p-5"><p className="d text-4xl">{athlete.matchesPlayed}</p><p className="lb">Pertandingan</p></div>
        <div className="bg-bg p-5"><p className="d text-4xl">{athlete.winRate}%</p><p className="lb">Win rate</p></div>
        <div className="bg-bg p-5"><p className="d text-4xl">{athlete.wins}/{athlete.losses}</p><p className="lb">Menang/Kalah</p></div>
      </div>

      <div className="mt-12">
        <h2 className="d text-3xl">Pertandingan terakhir</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {matches.length === 0 && <p className="py-6 text-sm text-muted">Belum ada riwayat pertandingan yang bisa ditampilkan.</p>}
          {matches.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-display text-xl uppercase">
                  {m.result === 'W' ? 'Menang' : 'Kalah'} lawan {m.label}
                </p>
                <p className="text-sm text-muted">{fmtDate(m.date)} · {m.court ?? '-'}</p>
              </div>
              {m.delta != null && (
                <span className={`font-display text-lg ${m.delta > 0 ? 'text-accent' : 'text-red-400'}`}>
                  {m.delta > 0 ? '+' : ''}{m.delta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}
