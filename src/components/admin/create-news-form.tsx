'use client'
import { useActionState } from 'react'
import { createNewsAction } from '@/server/actions/news'
import type { FormState } from '@/server/form-state'

const CATEGORIES = [
  { value: 'ORGANISASI', label: 'Organisasi' },
  { value: 'TURNAMEN', label: 'Turnamen' },
  { value: 'PRESTASI', label: 'Prestasi' },
  { value: 'KOMUNITAS', label: 'Komunitas' },
  { value: 'PENGUMUMAN', label: 'Pengumuman' },
]

export function CreateNewsForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createNewsAction, undefined)
  return (
    <form action={action} className="mt-4 grid gap-3 border border-line bg-surface p-5">
      <input name="title" placeholder="Judul berita" required className="inp" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="category" defaultValue="PENGUMUMAN" className="inp">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input name="coverUrl" placeholder="URL gambar sampul (opsional)" className="inp" />
      </div>
      <textarea name="excerpt" placeholder="Ringkasan singkat (opsional)" rows={2} className="inp" />
      <textarea name="content" placeholder="Isi berita" rows={6} required className="inp" />
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <input type="checkbox" name="isPublished" className="h-4 w-4 accent-accent" /> Publikasikan sekarang
      </label>
      <button disabled={pending} className="btn-p w-fit">{pending ? 'Menyimpan…' : 'Simpan berita'}</button>
      {state?.error && <p className="text-xs text-accent">{state.error}</p>}
      {state?.ok && <p className="text-xs text-accent">{state.ok}</p>}
    </form>
  )
}
