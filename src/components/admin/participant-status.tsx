'use client'
import { useTransition } from 'react'
import { updateParticipantStatusAction, removeParticipantAction } from '@/server/actions/competitions'

const OPTIONS = [
  ['REGISTERED', 'Terdaftar'], ['CONFIRMED', 'Dikonfirmasi'], ['WAITLIST', 'Daftar tunggu'],
  ['ELIMINATED', 'Gugur'], ['WINNER', 'Juara'],
] as const

export function ParticipantStatus({ id, status, competitionId }: { id: string; status: string; competitionId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => startTransition(() => updateParticipantStatusAction(id, e.target.value, competitionId))}
        className="inp max-w-[11rem] py-1.5"
      >
        {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <button
        disabled={pending}
        onClick={() => startTransition(() => removeParticipantAction(id, competitionId))}
        className="text-xs font-bold uppercase tracking-widest text-red-400"
      >
        Keluarkan
      </button>
    </div>
  )
}
