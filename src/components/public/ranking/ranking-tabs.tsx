'use client'
import { useState } from 'react'
import { fmtNum } from '@/lib/format'

type Player = { id: string; name: string; club: string | null; rating: number }
type Tab = 'putra' | 'putri' | 'campuran'

const TAB_LABEL: Record<Tab, string> = { putra: 'Putra', putri: 'Putri', campuran: 'Campuran' }

export function RankingTabs({ putra, putri, campuran }: Record<Tab, Player[]>) {
  const [tab, setTab] = useState<Tab>('campuran')
  const data = { putra, putri, campuran }[tab]

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Kategori peringkat" className="inline-flex overflow-hidden rounded-sm border border-line">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              tab === t ? 'bg-navy text-white' : 'bg-white text-muted hover:text-navy'
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="th w-12">#</th>
              <th className="th">Pemain</th>
              <th className="th">Klub</th>
              <th className="th text-right">Poin</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-sm text-muted">Belum ada pemain di kategori ini.</td></tr>
            )}
            {data.map((p, i) => (
              <tr key={p.id} className={`border-b border-line last:border-0 ${i === 0 ? 'bg-surface' : ''}`}>
                <td className="td d text-navy">{i + 1}</td>
                <td className="td font-semibold text-ink">{p.name}</td>
                <td className="td text-muted">{p.club ?? '-'}</td>
                <td className="td text-right font-bold text-navy">{fmtNum(p.rating)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
