'use client'
import { createLocationAction } from '@/server/actions/locations'
import { useActionForm } from './use-action-form'

export function CreateLocationForm() {
  const { state, pending, formRef, onSubmit } = useActionForm(createLocationAction)
  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama lokasi / venue" required className="inp" />
      <input name="city" placeholder="Kota / kabupaten" required className="inp" />
      <input name="province" placeholder="Provinsi" defaultValue="Jawa Barat" className="inp" />
      <input name="address" placeholder="Alamat (opsional)" className="inp" />
      <label className="grid gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Jumlah lapangan</span>
        <input name="courtCount" type="number" min={1} max={50} step={1} defaultValue={1} required placeholder="cth. 4" className="inp" />
      </label>
      <div className="hidden sm:block" />
      <input name="lat" placeholder="Latitude (opsional)" className="inp" />
      <input name="lng" placeholder="Longitude (opsional)" className="inp" />
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Menambahkan…' : 'Tambah lokasi'}</button>
      {state?.error && <p role="alert" className="text-xs text-accent sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
