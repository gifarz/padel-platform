'use client'
import { useActionState } from 'react'
import { updateMyProfileAction } from '@/server/actions/profile'
import type { FormState } from '@/server/form-state'

interface Props {
  city: string
  bio: string | null
  dominantHand: string | null
  preferredPosition: string | null
}

export function SettingsForm({ city, bio, dominantHand, preferredPosition }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateMyProfileAction, undefined)
  return (
    <form action={action} className="mt-6 max-w-lg space-y-4 border border-line bg-surface p-6">
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Kota
        <input name="city" defaultValue={city} required className="inp mt-1" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Tangan dominan
        <select name="dominantHand" defaultValue={dominantHand ?? ''} className="inp mt-1">
          <option value="">Belum diisi</option>
          <option value="RIGHT">Kanan</option>
          <option value="LEFT">Kiri</option>
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Posisi favorit
        <select name="preferredPosition" defaultValue={preferredPosition ?? ''} className="inp mt-1">
          <option value="">Belum diisi</option>
          <option value="LEFT">Kiri</option>
          <option value="RIGHT">Kanan</option>
          <option value="BOTH">Keduanya</option>
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted">
        Bio singkat
        <textarea name="bio" defaultValue={bio ?? ''} maxLength={300} rows={3} className="inp mt-1 resize-none" placeholder="Ceritakan sedikit tentang gaya mainmu…" />
      </label>
      <button disabled={pending} className="btn-p">{pending ? 'Menyimpan…' : 'Simpan perubahan'}</button>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
