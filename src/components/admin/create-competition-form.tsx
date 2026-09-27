'use client'
import { useActionState, useEffect, useState } from 'react'
import { createCompetitionAction } from '@/server/actions/competitions'
import type { FormState } from '@/server/form-state'

interface Location { id: string; name: string; city: string }

const CATEGORIES = [
  ['MENS_DOUBLES', 'Ganda putra'], ['WOMENS_DOUBLES', 'Ganda putri'], ['MIXED_DOUBLES', 'Ganda campuran'],
  ['MENS_SINGLES', 'Tunggal putra'], ['WOMENS_SINGLES', 'Tunggal putri'], ['OPEN', 'Terbuka'],
] as const

export function CreateCompetitionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCompetitionAction, undefined)
  const [locations, setLocations] = useState<Location[]>([])

  // Fetched client-side to keep this a small island; the server list page already
  // loaded competitions server-side, so this extra round trip only happens if
  // the admin opens the create form.
  useEffect(() => {
    fetch('/api/locations').then((r) => r.json()).then(setLocations).catch(() => {})
  }, [])

  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama kompetisi" required className="inp sm:col-span-2" />
      <select name="locationId" required className="inp">
        <option value="">Pilih lokasi…</option>
        {locations.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
      </select>
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
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
