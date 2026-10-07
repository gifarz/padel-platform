'use client'
import { useActionState, useState, useTransition } from 'react'
import { StatusBadge } from '@/components/ui/badge'
import { acceptMatchAction, declineMatchAction, submitResultAction } from '@/server/actions/matches'
import type { FormState } from '@/server/form-state'
import { fmtDate } from '@/lib/format'

interface Props {
  id: string
  label: string
  date: Date | null
  court: string | null
  status: string
  delta: number | null
  canAccept: boolean
  canSubmitResult: boolean
}

export function MatchRow({ id, label, date, court, status, delta, canAccept, canSubmitResult }: Props) {
  const [pending, startTransition] = useTransition()
  const [showScore, setShowScore] = useState(false)
  const [state, action, submitting] = useActionState<FormState, FormData>(submitResultAction, undefined)

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl uppercase">vs {label}</p>
          <p className="text-sm text-muted">{fmtDate(date)} · {court ?? 'Lapangan belum ditentukan'}</p>
        </div>
        <div className="flex items-center gap-3">
          {delta != null && (
            <span className={`font-display text-lg ${delta > 0 ? 'text-accent' : 'text-red-400'}`}>{delta > 0 ? '+' : ''}{delta} poin</span>
          )}
          <StatusBadge status={status} />
          {canAccept && (
            <div className="flex gap-2">
              <button disabled={pending} onClick={() => startTransition(() => acceptMatchAction(id))} className="btn-p">Terima</button>
              <button disabled={pending} onClick={() => startTransition(() => declineMatchAction(id))} className="btn-o">Tolak</button>
            </div>
          )}
          {canSubmitResult && !showScore && (
            <button onClick={() => setShowScore(true)} className="btn-o">Input skor</button>
          )}
        </div>
      </div>

      {showScore && (
        <form action={action} className="mt-3 flex flex-wrap items-center gap-2 border border-line bg-surface p-3">
          <input type="hidden" name="matchId" value={id} />
          <input name="score" placeholder="cth. 6-4, 3-6, 6-2 (dari sisi kamu)" className="inp max-w-xs" />
          <button disabled={submitting} className="btn-p">{submitting ? 'Mengirim…' : 'Kirim skor'}</button>
          {state?.error && <p className="w-full text-xs text-red-400">{state.error}</p>}
          {state?.ok && <p className="w-full text-xs text-accent">{state.ok}</p>}
        </form>
      )}
    </div>
  )
}
