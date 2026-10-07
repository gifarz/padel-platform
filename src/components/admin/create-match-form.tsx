'use client'
import { adminCreateMatchAction } from '@/server/actions/matches'
import { useActionForm } from './use-action-form'
import { MatchFormFields, type MatchFormOptions } from './match-form-fields'

export function CreateMatchForm({ options }: { options: MatchFormOptions }) {
  const { state, pending, formRef, onSubmit } = useActionForm(adminCreateMatchAction)
  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <MatchFormFields options={options} />
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Buat pertandingan'}</button>
      {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
