'use client'
import { useState } from 'react'
import { createMemberAction } from '@/server/actions/organization'
import { useActionForm } from './use-action-form'
import { ImageUploadField } from './image-upload-field'

export function CreateMemberForm() {
  const [photoUrl, setPhotoUrl] = useState('')
  const { state, pending, formRef, onSubmit } = useActionForm(createMemberAction, () => setPhotoUrl(''))
  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nama lengkap" required className="inp" />
      <input name="position" placeholder="Jabatan (cth. Ketua, Wakil Ketua, Anggota)" required className="inp" />
      <input name="division" placeholder="Divisi / bidang (opsional)" className="inp" />
      <input name="sortOrder" type="number" placeholder="Urutan tampil (kecil = lebih dulu)" className="inp" />
      <div className="sm:col-span-2">
        <ImageUploadField name="photoUrl" label="Foto pengurus" folder="organization" value={photoUrl} onChange={setPhotoUrl} shape="logo" />
      </div>
      <button disabled={pending} className="btn-p sm:col-span-2 sm:w-fit">{pending ? 'Menyimpan…' : 'Tambah pengurus'}</button>
      {state?.error && <p role="alert" className="text-xs text-accent sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-xs text-accent sm:col-span-2">{state.ok}</p>}
    </form>
  )
}
