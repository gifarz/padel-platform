'use client'
import { useActionState } from 'react'
import { generateBracketAction } from '@/server/actions/competitions'
import type { FormState } from '@/server/form-state'

export function GenerateBracketForm({ competitionId }: { competitionId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(generateBracketAction, undefined)
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="competitionId" value={competitionId} />
      <button disabled={pending} className="btn-p">{pending ? 'Membuat bracket…' : 'Buat bracket dari peserta yang dikonfirmasi'}</button>
      {state?.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
