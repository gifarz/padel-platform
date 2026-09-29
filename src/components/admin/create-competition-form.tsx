'use client'
import { useState, useTransition } from 'react'
import { createCompetitionAction } from '@/server/actions/competitions'
import { createLocationQuickAction } from '@/server/actions/locations'
import { useActionForm } from './use-action-form'

interface Location { id: string; name: string; city: string }

const CATEGORIES = [
  ['MENS_DOUBLES', 'Ganda putra'], ['WOMENS_DOUBLES', 'Ganda putri'], ['MIXED_DOUBLES', 'Ganda campuran'],
  ['MENS_SINGLES', 'Tunggal putra'], ['WOMENS_SINGLES', 'Tunggal putri'], ['OPEN', 'Terbuka'],
] as const

export function CreateCompetitionForm({ locations: initialLocations }: { locations: Location[] }) {
  const { state, pending, formRef, onSubmit } = useActionForm(createCompetitionAction)
  const [locations, setLocations] = useState(initialLocations)
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [showNewLocation, setShowNewLocation] = useState(false)
  const [newLocationError, setNewLocationError] = useState<string | null>(null)
  const [addingLocation, startAddingLocation] = useTransition()

  // Deliberately a sibling <form>, not nested inside the competition form below —
  // HTML doesn't allow nested <form> elements.
  function handleAddLocation(formData: FormData) {
    setNewLocationError(null)
    startAddingLocation(async () => {
      const result = await createLocationQuickAction(formData)
      if (!result.location) { setNewLocationError(result.error ?? 'Gagal menambahkan lokasi.'); return }
      const created = result.location
      setLocations((ls) => [...ls, created])
      setSelectedLocationId(created.id)
      setShowNewLocation(false)
    })
  }

  return (
    <div className="mt-4 grid gap-3">
      {showNewLocation && (
        <form action={handleAddLocation} className="grid gap-2 border border-line bg-white p-4 sm:grid-cols-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted sm:col-span-2">Lokasi baru</p>
          <input name="name" placeholder="Nama lokasi / venue" required className="inp" />
          <input name="city" placeholder="Kota" required className="inp" />
          <input name="province" placeholder="Provinsi (opsional)" className="inp" />
          <input name="address" placeholder="Alamat (opsional)" className="inp" />
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={addingLocation} className="btn-o h-10 w-fit px-4 text-xs">
              {addingLocation ? 'Menambahkan…' : 'Simpan lokasi'}
            </button>
            <button type="button" onClick={() => setShowNewLocation(false)} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {newLocationError && <p role="alert" className="text-xs text-accent sm:col-span-2">{newLocationError}</p>}
        </form>
      )}

      <form ref={formRef} onSubmit={onSubmit} className="grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
        <input name="name" placeholder="Nama kompetisi" required className="inp sm:col-span-2" />

        <div>
          <select name="locationId" required value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} className="inp">
            <option value="">Pilih lokasi…</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
          </select>
          {!showNewLocation && (
            <button type="button" onClick={() => setShowNewLocation(true)} className="mt-1.5 text-xs font-bold uppercase tracking-widest text-accent hover:text-accentDeep">
              + Tambah lokasi baru
            </button>
          )}
        </div>

        <select name="category" required className="inp">
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <input name="maxPlayers" type="number" min={2} placeholder="Maks. peserta" required className="inp" />
        <input name="prize" placeholder="Hadiah (opsional)" className="inp" />
        <label className="text-xs text-muted">Mulai<input name="startsAt" type="datetime-local" required className="inp mt-1" /></label>
        <label className="text-xs text-muted">Selesai<input name="endsAt" type="datetime-local" required className="inp mt-1" /></label>
        <label className="text-xs text-muted sm:col-span-2">Batas pendaftaran<input name="registrationDeadline" type="datetime-local" required className="inp mt-1" /></label>
        <input name="minRating" type="number" placeholder="Rating minimum (opsional)" className="inp" />
        <input name="maxRating" type="number" placeholder="Rating maksimum (opsional)" className="inp" />
        <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Membuat…' : 'Buat sebagai draf'}</button>
        {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
        {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
      </form>
    </div>
  )
}
