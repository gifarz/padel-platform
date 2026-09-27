'use client'
import { useActionState } from 'react'
import { createMemberAction } from '@/server/actions/organization'
import type { FormState } from '@/server/form-state'

export function CreateMemberForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createMemberAction, undefined)
  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama lengkap" required className="inp" />
      <input name="position" placeholder="Jabatan (cth. Ketua, Anggota)" required className="inp" />
      <input name="division" placeholder="Divisi (opsional)" className="inp" />
      <input name="sortOrder" type="number" placeholder="Urutan tampil" className="inp" />
      <input name="photoUrl" placeholder="URL foto (opsional)" className="inp sm:col-span-2" />
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Menyimpan…' : 'Tambah pengurus'}</button>
      {state?.error && <p className="text-xs text-accent sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
