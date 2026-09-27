'use client'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { searchAthletesAction, setAthletesActiveAction } from '@/server/actions/admin-athletes'
import { fmtNum } from '@/lib/format'

interface Row { id: string; name: string; city: string; rating: number; wins: number; losses: number; isActive: boolean }
interface Initial { rows: Row[]; total: number; pages: number }

export function AthletesTable({ initial }: { initial: Initial }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Initial>(initial)
  const [selected, setSelected] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(async () => setData(await searchAthletesAction(q, page)))
    }, 250)
    return () => clearTimeout(t)
  }, [q, page])

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          placeholder="Cari nama atau kota…"
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
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th w-10"></th><th className="th">Nama</th><th className="th">Kota</th>
              <th className="th">Rating</th><th className="th">M/K</th><th className="th">Status</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td"><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} /></td>
                <td className="td font-display text-base uppercase">{a.name}</td>
                <td className="td text-muted">{a.city}</td>
                <td className="td font-display text-accent">{fmtNum(a.rating)}</td>
                <td className="td">{a.wins}/{a.losses}</td>
                <td className="td">
                  <span className={`border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest ${a.isActive ? 'border-line' : 'border-red-500/30 text-red-400'}`}>
                    {a.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="td text-right"><Link href={`/admin/athletes/${a.id}`} className="text-xs font-bold uppercase tracking-widest text-accent">Buka →</Link></td>
              </tr>
            ))}
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
