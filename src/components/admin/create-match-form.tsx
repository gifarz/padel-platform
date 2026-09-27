'use client'
import { useActionState } from 'react'
import { adminCreateMatchAction } from '@/server/actions/matches'
import type { FormState } from '@/server/form-state'

export function CreateMatchForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminCreateMatchAction, undefined)
  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="teamA" placeholder="ID atlet Tim A (pisahkan koma)" className="inp" />
      <input name="teamB" placeholder="ID atlet Tim B (pisahkan koma)" className="inp" />
      <input name="courtId" placeholder="ID lapangan (opsional)" className="inp" />
      <input name="refereeId" placeholder="ID wasit (opsional)" className="inp" />
      <input name="scheduledAt" type="datetime-local" className="inp" />
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Buat pertandingan'}</button>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
