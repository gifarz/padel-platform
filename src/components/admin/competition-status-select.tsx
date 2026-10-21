'use client'
import { useState, useTransition } from 'react'
import { updateCompetitionStatusAction } from '@/server/actions/competitions'
import { COMPETITION_STATUS_LABEL, STATUS_TRANSITIONS, type CompetitionStatusKey } from '@/lib/competition'

/**
 * The missing piece of the competition flow: without this nothing ever moved a
 * competition out of DRAFT. It only offers the transitions the server allows.
 */
export function CompetitionStatusSelect({ id, status }: { id: string; status: CompetitionStatusKey }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const next = STATUS_TRANSITIONS[status]

  if (next.length === 0) return null

  function change(target: CompetitionStatusKey) {
    setMessage(null)
    startTransition(async () => {
      const res = await updateCompetitionStatusAction(id, target)
      if (res?.error) setMessage({ kind: 'error', text: res.error })
      else if (res?.ok) setMessage({ kind: 'ok', text: res.ok })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((t) => (
        <button
          key={t}
          type="button"
          disabled={pending}
          onClick={() => {
            if (t === 'CANCELLED' && !window.confirm('Batalkan kompetisi ini?')) return
            change(t)
          }}
          className={t === 'CANCELLED' ? 'btn-line text-red-400' : t === 'ONGOING' || t === 'REGISTRATION_OPEN' ? 'btn-p' : 'btn-line'}
        >
          {pending ? '…' : buttonLabel(t)}
        </button>
      ))}
      {message && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`w-full text-xs ${message.kind === 'error' ? 'text-red-400' : 'text-accent'}`}>{message.text}</p>}
    </div>
  )
}

function buttonLabel(t: CompetitionStatusKey) {
  switch (t) {
    case 'REGISTRATION_OPEN': return 'Buka pendaftaran'
    case 'REGISTRATION_CLOSED': return 'Tutup pendaftaran'
    case 'ONGOING': return 'Mulai kompetisi'
    case 'COMPLETED': return 'Tandai selesai'
    case 'CANCELLED': return 'Batalkan'
    case 'DRAFT': return 'Kembalikan ke draf'
  }
}

export { COMPETITION_STATUS_LABEL }
