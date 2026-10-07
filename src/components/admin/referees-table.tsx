'use client'
import { useState } from 'react'
import { useActionForm } from './use-action-form'
import { AdminDeleteButton } from './admin-delete-button'
import { StaffStatus } from './staff-status'
import { updateRefereeAction, deleteRefereeAction } from '@/server/actions/staff'

export interface RefereeRow {
  id: string
  name: string
  phone: string
  districtId: string | null
  districtName: string
  certification: string
  yearsExp: number
  matchCount: number
  status: string
}
type District = { id: string; name: string }

function EditRow({ r, districts, onDone }: { r: RefereeRow; districts: District[]; onDone: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(updateRefereeAction, onDone)
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={7} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-3">
          <input type="hidden" name="id" value={r.id} />
          <input name="name" defaultValue={r.name} placeholder="Nama lengkap" required className="inp" />
          <input name="phone" type="tel" defaultValue={r.phone} placeholder="Nomor HP" required className="inp" />
          <select name="districtId" defaultValue={r.districtId ?? ''} className="inp">
            <option value="">Tanpa kecamatan</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input name="certification" defaultValue={r.certification} placeholder="Sertifikasi" required className="inp" />
          <input name="yearsExp" type="number" min={0} defaultValue={r.yearsExp} placeholder="Tahun pengalaman" className="inp" />
          <div className="flex items-center gap-3">
            <button disabled={pending} className="btn-p h-10 px-5 text-xs">{pending ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-3">{state.error}</p>}
        </form>
      </td>
    </tr>
  )
}

export function RefereesTable({ referees, districts }: { referees: RefereeRow[]; districts: District[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            <th className="th">Nama</th><th className="th">Kecamatan</th><th className="th">Sertifikasi</th><th className="th">Pengalaman</th><th className="th">Pertandingan</th><th className="th">Status</th><th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {referees.map((r) =>
            editingId === r.id ? (
              <EditRow key={r.id} r={r} districts={districts} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">{r.name}<span className="block text-[0.7rem] font-normal normal-case text-muted">{r.phone}</span></td>
                <td className="td text-muted">{r.districtName}</td>
                <td className="td text-muted">{r.certification}</td>
                <td className="td">{r.yearsExp} tahun</td>
                <td className="td">{r.matchCount}</td>
                <td className="td"><StaffStatus id={r.id} status={r.status} kind="referee" /></td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingId(r.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                    <AdminDeleteButton id={r.id} action={deleteRefereeAction} confirmMessage={`Hapus wasit "${r.name}" beserta akunnya? Tindakan ini tidak bisa dibatalkan.`} />
                  </div>
                </td>
              </tr>
            ),
          )}
          {referees.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-sm text-muted">Belum ada wasit terdaftar.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
