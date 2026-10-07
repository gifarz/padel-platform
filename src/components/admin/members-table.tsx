'use client'
import { useState } from 'react'
import { useActionForm } from './use-action-form'
import { ImageUploadField } from './image-upload-field'
import { AdminToggle } from './admin-toggle'
import { AdminDeleteButton } from './admin-delete-button'
import { updateMemberAction, toggleMemberActiveAction, deleteMemberAction } from '@/server/actions/organization'

export interface MemberRow {
  id: string
  name: string
  position: string
  division: string | null
  photoUrl: string | null
  sortOrder: number
  isActive: boolean
}

function EditRow({ m, onDone }: { m: MemberRow; onDone: () => void }) {
  const [photoUrl, setPhotoUrl] = useState(m.photoUrl ?? '')
  const { state, pending, formRef, onSubmit } = useActionForm(updateMemberAction, onDone)
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={7} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="id" value={m.id} />
          <input name="name" defaultValue={m.name} placeholder="Nama lengkap" required className="inp" />
          <input name="position" defaultValue={m.position} placeholder="Jabatan" required className="inp" />
          <input name="division" defaultValue={m.division ?? ''} placeholder="Divisi (opsional)" className="inp" />
          <input name="sortOrder" type="number" defaultValue={m.sortOrder} placeholder="Urutan tampil" className="inp" />
          <div className="sm:col-span-2">
            <ImageUploadField name="photoUrl" label="Foto pengurus" folder="organization" value={photoUrl} onChange={setPhotoUrl} shape="logo" />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button disabled={pending} className="btn-p h-10 px-5 text-xs">{pending ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {state?.error && <p role="alert" className="text-xs text-accent sm:col-span-2">{state.error}</p>}
        </form>
      </td>
    </tr>
  )
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="th w-16">Foto</th><th className="th">Nama</th><th className="th">Jabatan</th><th className="th">Divisi</th>
            <th className="th">Urutan</th><th className="th">Aktif</th><th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) =>
            editingId === m.id ? (
              <EditRow key={m.id} m={m} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-white text-[0.65rem] font-bold text-navy">
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      m.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                </td>
                <td className="td font-display text-base">{m.name}</td>
                <td className="td text-muted">{m.position}</td>
                <td className="td text-muted">{m.division ?? '-'}</td>
                <td className="td">{m.sortOrder}</td>
                <td className="td"><AdminToggle id={m.id} checked={m.isActive} action={toggleMemberActiveAction} label={m.isActive ? 'Ya' : 'Tidak'} /></td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingId(m.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                    <AdminDeleteButton id={m.id} action={deleteMemberAction} confirmMessage={`Hapus "${m.name}" dari struktur pengurus?`} />
                  </div>
                </td>
              </tr>
            ),
          )}
          {members.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-6 text-sm text-muted">Belum ada pengurus. Tambahkan di bawah.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
