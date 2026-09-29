'use client'
import { createAthleteAction } from '@/server/actions/admin-athletes'
import { useActionForm } from './use-action-form'

type District = { id: string; name: string }
type Club = { id: string; name: string; districtId: string | null }

export function CreateAthleteForm({ districts, clubs, onCreated }: { districts: District[]; clubs: Club[]; onCreated?: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(createAthleteAction, onCreated)
  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama lengkap" required className="inp" />
      <input name="username" placeholder="Username" required className="inp" />
      <input name="phone" type="tel" placeholder="Nomor HP (cth. 081234567890)" required className="inp" />
      <select name="gender" defaultValue="MALE" className="inp">
        <option value="MALE">Laki-laki</option>
        <option value="FEMALE">Perempuan</option>
      </select>
      <select name="districtId" required defaultValue="" className="inp">
        <option value="" disabled>Pilih kecamatan</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select name="clubId" defaultValue="" className="inp">
        <option value="">Klub (opsional)</option>
        {clubs.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Tambah atlet'}</button>
      {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
