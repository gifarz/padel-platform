'use client'
import { useState } from 'react'
import { updateCompetitionAction } from '@/server/actions/competitions'
import { CATEGORY_KEYS, CATEGORY_LABEL } from '@/lib/competition'
import { useActionForm } from './use-action-form'

interface Props {
  competition: {
    id: string; name: string; description: string | null; locationId: string; category: string; maxPlayers: number
    prize: string | null; minRating: number | null; maxRating: number | null
    startsAt: string; endsAt: string; registrationDeadline: string // datetime-local values (Jakarta time)
  }
  locations: { id: string; name: string; city: string }[]
  categoryLocked: boolean
}

export function EditCompetitionForm({ competition: c, locations, categoryLocked }: Props) {
  const [open, setOpen] = useState(false)
  // reset() on success would wipe the edited values back to the *old* defaults, so keep them.
  const { state, pending, onSubmit } = useActionForm(updateCompetitionAction)

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn-line">Ubah kompetisi</button>

  return (
    <form onSubmit={onSubmit} className="grid w-full gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input type="hidden" name="id" value={c.id} />
      <input name="name" defaultValue={c.name} placeholder="Nama kompetisi" required className="inp sm:col-span-2" />
      <textarea name="description" defaultValue={c.description ?? ''} placeholder="Deskripsi (opsional)" rows={3} maxLength={2000} className="inp resize-none sm:col-span-2" />
      <select name="locationId" defaultValue={c.locationId} required className="inp">
        {locations.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
      </select>
      <select name="category" defaultValue={c.category} disabled={categoryLocked} className="inp" title={categoryLocked ? 'Kategori terkunci setelah ada peserta' : undefined}>
        {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>)}
      </select>
      {/* a disabled <select> isn't submitted, so send the locked value explicitly */}
      {categoryLocked && <input type="hidden" name="category" value={c.category} />}
      <input name="maxPlayers" type="number" min={2} max={256} defaultValue={c.maxPlayers} placeholder="Maks. peserta" required className="inp" />
      <input name="prize" defaultValue={c.prize ?? ''} placeholder="Hadiah (opsional)" className="inp" />
      <label className="text-xs text-muted">Mulai<input name="startsAt" type="datetime-local" defaultValue={c.startsAt} required className="inp mt-1" /></label>
      <label className="text-xs text-muted">Selesai<input name="endsAt" type="datetime-local" defaultValue={c.endsAt} required className="inp mt-1" /></label>
      <label className="text-xs text-muted sm:col-span-2">Batas pendaftaran<input name="registrationDeadline" type="datetime-local" defaultValue={c.registrationDeadline} required className="inp mt-1" /></label>
      <input name="minRating" type="number" min={0} defaultValue={c.minRating ?? ''} placeholder="Poin minimum (opsional)" className="inp" />
      <input name="maxRating" type="number" min={0} defaultValue={c.maxRating ?? ''} placeholder="Poin maksimum (opsional)" className="inp" />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-p">{pending ? 'Menyimpan…' : 'Simpan perubahan'}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Tutup</button>
      </div>
      {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
