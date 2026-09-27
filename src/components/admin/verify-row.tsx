'use client'
import { useActionState, useState } from 'react'
import { verifyMatchAction, correctMatchAction } from '@/server/actions/matches'
import type { FormState } from '@/server/form-state'

interface Props {
  id: string
  teamA: string
  teamB: string
  sets: number[][] | null
  winnerTeam: 'A' | 'B' | null
}

const scoreText = (sets: number[][] | null) => (sets && sets.length ? sets.map(([a, b]) => `${a}-${b}`).join(', ') : '-')

export function VerifyRow({ id, teamA, teamB, sets, winnerTeam }: Props) {
  const [correcting, setCorrecting] = useState(false)
  const [verifyState, verifyAction, verifying] = useActionState<FormState, FormData>(
    async () => verifyMatchAction(id),
    undefined,
  )
  const [correctState, correctAction, correctPending] = useActionState<FormState, FormData>(correctMatchAction, undefined)

  const verified = verifyState?.ok != null

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg uppercase">{teamA} <span className="text-muted">vs</span> {teamB}</p>
          <p className="text-sm text-muted">
            Skor: {scoreText(sets)} {winnerTeam && `· ${winnerTeam === 'A' ? teamA : teamB} menang`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!verified ? (
            <form action={verifyAction} className="flex items-center gap-2">
              <button disabled={verifying} className="btn-p">{verifying ? 'Memverifikasi…' : 'Verifikasi'}</button>
              <button type="button" onClick={() => setCorrecting((c) => !c)} className="btn-o">Koreksi</button>
            </form>
          ) : (
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Rating diperbarui ✓</span>
          )}
        </div>
      </div>
      {verifyState?.error && <p className="mt-2 text-xs text-red-400">{verifyState.error}</p>}

      {correcting && (
        <form action={correctAction} className="mt-3 flex flex-wrap items-center gap-2 border border-line bg-surface p-3">
          <input type="hidden" name="matchId" value={id} />
          <select name="winner" className="inp max-w-[10rem]">
            <option value="A">{teamA} menang</option>
            <option value="B">{teamB} menang</option>
          </select>
          <input name="note" placeholder="Catatan koreksi (opsional)" className="inp max-w-xs" />
          <button disabled={correctPending} className="btn-p">{correctPending ? 'Menyimpan…' : 'Simpan koreksi'}</button>
          {correctState?.error && <p className="w-full text-xs text-red-400">{correctState.error}</p>}
          {correctState?.ok && <p className="w-full text-xs text-accent">{correctState.ok}</p>}
        </form>
      )}
    </div>
  )
}
