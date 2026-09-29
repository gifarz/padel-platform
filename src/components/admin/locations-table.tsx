'use client'
import { useState } from 'react'
import { useActionForm } from './use-action-form'
import { updateLocationAction, deleteLocationAction } from '@/server/actions/locations'
import { AdminDeleteButton } from './admin-delete-button'

export interface LocationRow {
  id: string
  name: string
  city: string
  province: string
  address: string | null
  lat: number | null
  lng: number | null
  courts: { id: string }[]
  _count: { competitions: number }
}

function EditRow({ loc, onDone }: { loc: LocationRow; onDone: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(updateLocationAction, onDone)
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={5} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-5">
          <input type="hidden" name="id" value={loc.id} />
          <input name="name" defaultValue={loc.name} placeholder="Nama lokasi" required className="inp" />
          <input name="city" defaultValue={loc.city} placeholder="Kota" required className="inp" />
          <input name="province" defaultValue={loc.province} placeholder="Provinsi" className="inp" />
          <input name="address" defaultValue={loc.address ?? ''} placeholder="Alamat" className="inp sm:col-span-2" />
          <input name="lat" defaultValue={loc.lat ?? ''} placeholder="Latitude (opsional)" className="inp" />
          <input name="lng" defaultValue={loc.lng ?? ''} placeholder="Longitude (opsional)" className="inp" />
          <div className="flex items-center gap-3 sm:col-span-2">
            <button disabled={pending} className="btn-p h-10 px-5 text-xs">{pending ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {state?.error && <p role="alert" className="text-xs text-accent sm:col-span-5">{state.error}</p>}
        </form>
      </td>
    </tr>
  )
}

export function LocationsTable({ locations }: { locations: LocationRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            <th className="th">Nama</th><th className="th">Kota</th><th className="th">Lapangan</th>
            <th className="th">Kompetisi</th><th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {locations.map((l) =>
            editingId === l.id ? (
              <EditRow key={l.id} loc={l} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base">{l.name}</td>
                <td className="td text-muted">{l.city}, {l.province}</td>
                <td className="td text-muted">{l.courts.length}</td>
                <td className="td text-muted">{l._count.competitions}</td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingId(l.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                    <AdminDeleteButton
                      id={l.id}
                      action={deleteLocationAction}
                      confirmMessage={l._count.competitions > 0 ? `"${l.name}" masih dipakai ${l._count.competitions} kompetisi dan tidak bisa dihapus. Tetap coba?` : `Hapus lokasi "${l.name}"?`}
                    />
                  </div>
                </td>
              </tr>
            ),
          )}
          {locations.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-6 text-sm text-muted">Belum ada lokasi. Tambahkan satu di bawah.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
