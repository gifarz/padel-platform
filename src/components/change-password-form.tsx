'use client'
import { useActionState, useEffect, useRef } from 'react'
import { changePasswordAction } from '@/server/actions/profile'
import type { FormState } from '@/server/form-state'
import { MIN_PASSWORD_LENGTH } from '@/lib/password-rules'

/** Shared by the athlete settings page and the staff page — admins hand out temp passwords, this replaces them. */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, undefined)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state?.ok) ref.current?.reset() }, [state])

  return (
    <form ref={ref} action={action} className="mt-6 max-w-lg space-y-4 border border-line bg-surface p-6">
      <p className="lb">Ganti kata sandi</p>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Kata sandi saat ini
        <input name="currentPassword" type="password" autoComplete="current-password" required className="inp mt-1" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Kata sandi baru
        <input name="newPassword" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className="inp mt-1" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Ulangi kata sandi baru
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className="inp mt-1" />
      </label>
      <button disabled={pending} className="btn-p">{pending ? 'Menyimpan…' : 'Ganti kata sandi'}</button>
      {state?.error && <p role="alert" className="text-xs text-red-400">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
