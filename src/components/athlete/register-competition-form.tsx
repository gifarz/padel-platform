'use client'
import { useActionState } from 'react'
import { registerForCompetitionAction } from '@/server/actions/competitions'
import type { FormState } from '@/server/form-state'

export function RegisterCompetitionForm({ competitionId, doubles, partnerOptional }: { competitionId: string; doubles: boolean; partnerOptional: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerForCompetitionAction, undefined)
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 border border-line bg-surface p-5">
      <input type="hidden" name="competitionId" value={competitionId} />
      {doubles && (
        <label className="text-xs text-muted">
          Username pasangan {partnerOptional ? '(opsional)' : '(wajib untuk ganda)'}
          <input name="partnerUsername" required={!partnerOptional} autoCapitalize="none" autoCorrect="off" className="inp mt-1" placeholder="cth. andre" />
        </label>
      )}
      <button disabled={pending} className="btn-p">{pending ? 'Mendaftar…' : 'Daftar sekarang'}</button>
      {state?.error && <p role="alert" className="w-full text-xs text-red-400">{state.error}</p>}
      {state?.ok && <p role="status" className="w-full text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
