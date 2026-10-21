'use client'
import { useTransition } from 'react'
import { updateParticipantStatusAction, removeParticipantAction } from '@/server/actions/competitions'

const OPTIONS = [
  ['REGISTERED', 'Terdaftar'], ['CONFIRMED', 'Dikonfirmasi'], ['WAITLIST', 'Daftar tunggu'],
  ['ELIMINATED', 'Gugur'], ['WINNER', 'Juara'],
] as const

export function ParticipantStatus({ id, status, competitionId, locked = false }: { id: string; status: string; competitionId: string; locked?: boolean }) {
  const [pending, startTransition] = useTransition()

  // Server actions throw on rule violations (e.g. bracket already built); surface that instead of failing silently.
  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      try { await fn() } catch (err) { window.alert(err instanceof Error ? err.message : 'Gagal menyimpan.') }
    })

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => run(() => updateParticipantStatusAction(id, e.target.value, competitionId))}
        className="inp max-w-[11rem] py-1.5"
      >
        {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {!locked && (
        <button
          disabled={pending}
          onClick={() => { if (window.confirm('Keluarkan peserta ini dari kompetisi?')) run(() => removeParticipantAction(id, competitionId)) }}
          className="text-xs font-bold uppercase tracking-widest text-red-400"
        >
          Keluarkan
        </button>
      )}
    </div>
  )
}
