'use client'
import { useActionState } from 'react'
import { registerForCompetitionAction } from '@/server/actions/competitions'
import type { FormState } from '@/server/form-state'

export function RegisterCompetitionForm({ competitionId }: { competitionId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerForCompetitionAction, undefined)
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 border border-line bg-surface p-5">
      <input type="hidden" name="competitionId" value={competitionId} />
      <label className="text-xs text-muted">
        ID pasangan (opsional, untuk ganda)
        <input name="partnerId" className="inp mt-1" placeholder="Kosongkan jika belum ada pasangan" />
      </label>
      <button disabled={pending} className="btn-p">{pending ? 'Mendaftar…' : 'Daftar sekarang'}</button>
      {state?.error && <p className="w-full text-xs text-red-400">{state.error}</p>}
      {state?.ok && <p className="w-full text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
