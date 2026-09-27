'use client'
import { useActionState } from 'react'
import { createTrainerAction } from '@/server/actions/staff'
import type { FormState } from '@/server/form-state'

type District = { id: string; name: string }

export function CreateTrainerForm({ districts }: { districts: District[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createTrainerAction, undefined)
  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama lengkap" required className="inp" />
      <input name="phone" type="tel" placeholder="Nomor HP (cth. 081234567890)" required className="inp" />
      <select name="districtId" required className="inp" defaultValue="">
        <option value="" disabled>Pilih kecamatan</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <input name="yearsExp" type="number" min={0} placeholder="Tahun pengalaman" className="inp" />
      <input name="specialties" placeholder="Spesialisasi (pisahkan koma)" className="inp sm:col-span-2" />
      <input name="sessionPrice" type="number" min={0} placeholder="Harga per sesi (opsional)" className="inp" />
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Tambah pelatih'}</button>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
