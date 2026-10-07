'use client'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { searchAthletesAction, setAthletesActiveAction, updateAthleteAction, deleteAthleteAction } from '@/server/actions/admin-athletes'
import { fmtNum } from '@/lib/format'
import { useActionForm } from './use-action-form'
import { AdminDeleteButton } from './admin-delete-button'

export interface AthleteRow {
  id: string
  name: string
  username: string
  phone: string
  city: string
  gender: 'MALE' | 'FEMALE'
  districtId: string | null
  clubId: string | null
  rating: number
  wins: number
  losses: number
  isActive: boolean
}
interface Initial { rows: AthleteRow[]; total: number; pages: number }
type District = { id: string; name: string }
type Club = { id: string; name: string; districtId: string | null }

function EditRow({ a, districts, clubs, onDone }: { a: AthleteRow; districts: District[]; clubs: Club[]; onDone: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(updateAthleteAction, onDone)
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={7} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-3">
          <input type="hidden" name="id" value={a.id} />
          <input name="name" defaultValue={a.name} placeholder="Nama lengkap" required className="inp" />
          <input name="username" defaultValue={a.username} placeholder="Username" required className="inp" />
          <input name="phone" type="tel" defaultValue={a.phone} placeholder="Nomor HP" required className="inp" />
          <select name="gender" defaultValue={a.gender} className="inp">
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
          <select name="districtId" defaultValue={a.districtId ?? ''} required className="inp">
            <option value="" disabled>Pilih kecamatan</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select name="clubId" defaultValue={a.clubId ?? ''} className="inp">
            <option value="">Tanpa klub</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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

export function AthletesTable({ initial, districts, clubs, refreshSignal = 0 }: { initial: Initial; districts: District[]; clubs: Club[]; refreshSignal?: number }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Initial>(initial)
  const [selected, setSelected] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const reload = () => startTransition(async () => setData(await searchAthletesAction(q, page)))

  // Debounced on every keystroke, but immediate (no wait) when triggered by
  // refreshSignal — e.g. right after the "Tambah atlet" form below creates a
  // new athlete, so it shows up in the table without a manual page reload.
  useEffect(() => {
    const delay = refreshSignal > 0 ? 0 : 250
    const t = setTimeout(reload, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, refreshSignal])

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          placeholder="Cari nama, username, atau kecamatan…"
          className="inp w-full max-w-xs"
        />
        {selected.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="text-muted">{selected.length} dipilih</span>
            <button
              onClick={() => startTransition(async () => { await setAthletesActiveAction(selected, false); setSelected([]); setData(await searchAthletesAction(q, page)) })}
              className="btn-o"
            >
              Nonaktifkan
            </button>
            <button
              onClick={() => startTransition(async () => { await setAthletesActiveAction(selected, true); setSelected([]); setData(await searchAthletesAction(q, page)) })}
              className="btn-o"
            >
              Aktifkan
            </button>
          </div>
        )}
      </div>

      <div className={`mt-6 overflow-x-auto border border-line ${pending ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th w-10"></th><th className="th">Nama</th><th className="th">Kota</th>
              <th className="th">Poin</th><th className="th">M/K</th><th className="th">Status</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((a) =>
              editingId === a.id ? (
                <EditRow key={a.id} a={a} districts={districts} clubs={clubs} onDone={() => { setEditingId(null); reload() }} />
              ) : (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-surface">
                  <td className="td"><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} /></td>
                  <td className="td font-display text-base uppercase">{a.name}<span className="block text-[0.7rem] font-normal normal-case text-muted">@{a.username}</span></td>
                  <td className="td text-muted">{a.city}</td>
                  <td className="td font-display text-accent">{fmtNum(a.rating)}</td>
                  <td className="td">{a.wins}/{a.losses}</td>
                  <td className="td">
                    <span className={`border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest ${a.isActive ? 'border-line' : 'border-red-500/30 text-red-400'}`}>
                      {a.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="td text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/athletes/${a.id}`} className="text-xs font-bold uppercase tracking-widest text-accent">Buka →</Link>
                      <button onClick={() => setEditingId(a.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                      <AdminDeleteButton
                        id={a.id}
                        action={async (id) => { await deleteAthleteAction(id); reload() }}
                        confirmMessage={`Hapus atlet "${a.name}"? Tindakan ini tidak bisa dibatalkan.`}
                      />
                    </div>
                  </td>
                </tr>
              ),
            )}
            {data.rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-sm text-muted">Tidak ada atlet yang cocok.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted">
        <span>Halaman {page} dari {data.pages} · {data.total} atlet</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-o">← Sebelumnya</button>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn-o">Berikutnya →</button>
        </div>
      </div>
    </div>
  )
}
