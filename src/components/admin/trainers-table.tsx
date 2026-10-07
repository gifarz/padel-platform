'use client'
import { useState } from 'react'
import { useActionForm } from './use-action-form'
import { AdminDeleteButton } from './admin-delete-button'
import { StaffStatus } from './staff-status'
import { updateTrainerAction, deleteTrainerAction } from '@/server/actions/staff'

export interface TrainerRow {
  id: string
  name: string
  phone: string
  districtId: string | null
  districtName: string
  specialties: string[]
  yearsExp: number
  sessionPrice: number | null
  status: string
}
type District = { id: string; name: string }

function EditRow({ t, districts, onDone }: { t: TrainerRow; districts: District[]; onDone: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(updateTrainerAction, onDone)
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={6} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-3">
          <input type="hidden" name="id" value={t.id} />
          <input name="name" defaultValue={t.name} placeholder="Nama lengkap" required className="inp" />
          <input name="phone" type="tel" defaultValue={t.phone} placeholder="Nomor HP" required className="inp" />
          <select name="districtId" defaultValue={t.districtId ?? ''} className="inp">
            <option value="">Tanpa kecamatan</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input name="yearsExp" type="number" min={0} defaultValue={t.yearsExp} placeholder="Tahun pengalaman" className="inp" />
          <input name="sessionPrice" type="number" min={0} defaultValue={t.sessionPrice ?? ''} placeholder="Harga per sesi (opsional)" className="inp" />
          <input name="specialties" defaultValue={t.specialties.join(', ')} placeholder="Spesialisasi (pisahkan koma)" className="inp" />
          <div className="flex items-center gap-3 sm:col-span-3">
            <button disabled={pending} className="btn-p h-10 px-5 text-xs">{pending ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-3">{state.error}</p>}
        </form>
      </td>
    </tr>
  )
}

export function TrainersTable({ trainers, districts }: { trainers: TrainerRow[]; districts: District[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            <th className="th">Nama</th><th className="th">Kecamatan</th><th className="th">Spesialisasi</th><th className="th">Pengalaman</th><th className="th">Status</th><th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) =>
            editingId === t.id ? (
              <EditRow key={t.id} t={t} districts={districts} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">{t.name}<span className="block text-[0.7rem] font-normal normal-case text-muted">{t.phone}</span></td>
                <td className="td text-muted">{t.districtName}</td>
                <td className="td text-muted">{t.specialties.join(' · ') || '-'}</td>
                <td className="td">{t.yearsExp} tahun</td>
                <td className="td"><StaffStatus id={t.id} status={t.status} kind="trainer" /></td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingId(t.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                    <AdminDeleteButton id={t.id} action={deleteTrainerAction} confirmMessage={`Hapus pelatih "${t.name}" beserta akunnya? Tindakan ini tidak bisa dibatalkan.`} />
                  </div>
                </td>
              </tr>
            ),
          )}
          {trainers.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-sm text-muted">Belum ada pelatih terdaftar.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
