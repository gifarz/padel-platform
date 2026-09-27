'use client'
import { useActionState } from 'react'
import { createClubAction } from '@/server/actions/clubs'
import type { FormState } from '@/server/form-state'

type District = { id: string; name: string }

export function CreateClubForm({ districts }: { districts: District[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createClubAction, undefined)
  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama klub" required className="inp" />
      <select name="districtId" required className="inp" defaultValue="">
        <option value="" disabled>Pilih kecamatan</option>
        {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <input name="address" placeholder="Alamat" className="inp sm:col-span-2" />
      <input name="phone" placeholder="Nomor telepon" className="inp" />
      <input name="instagram" placeholder="Instagram (URL)" className="inp" />
      <input name="website" placeholder="Website (URL)" className="inp" />
      <input name="logoUrl" placeholder="URL logo" className="inp" />
      <textarea name="description" placeholder="Deskripsi klub" rows={2} className="inp sm:col-span-2" />
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <input type="checkbox" name="isVerified" className="h-4 w-4 accent-accent" /> Terverifikasi
      </label>
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Tambah klub'}</button>
      {state?.error && <p className="text-xs text-accent sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
