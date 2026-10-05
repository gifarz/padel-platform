'use client'
import { useId, useRef, useState } from 'react'
import { fmtNum, initials } from '@/lib/format'

type Player = { id: string; name: string; club: string | null; rating: number }
type Tab = 'putra' | 'putri' | 'campuran'

const TAB_LABEL: Record<Tab, string> = { putra: 'Putra', putri: 'Putri', campuran: 'Campuran' }

export function RankingTabs({ putra, putri, campuran }: Record<Tab, Player[]>) {
  const [tab, setTab] = useState<Tab>('campuran')
  const id = useId()
  const tabsRef = useRef<HTMLDivElement>(null)
  const data = { putra, putri, campuran }[tab]

  return (
    <div className="mt-5">
      <div ref={tabsRef} role="tablist" aria-label="Kategori peringkat" className="flex rounded-full bg-surface p-1">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${id}-${t}`}
            aria-controls={`${id}-panel`}
            tabIndex={tab === t ? 0 : -1}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            onKeyDown={(event) => {
              const tabs = Object.keys(TAB_LABEL) as Tab[]
              const index = tabs.indexOf(t)
              const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
              if (next === null) return
              event.preventDefault()
              const nextTab = tabs[next]
              if (!nextTab) return
              setTab(nextTab)
              tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
            }}
            className={`flex-1 rounded-full px-3 py-2.5 text-xs font-bold transition ${
              tab === t ? 'bg-navy text-white shadow-sm' : 'text-muted hover:text-navy'
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} tabIndex={0} className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="th w-12">#</th>
              <th className="th">Pemain</th>
              <th className="th hidden sm:table-cell">Klub</th>
              <th className="th text-right">Poin</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-sm text-muted">Belum ada pemain di kategori ini.</td></tr>
            )}
            {data.map((p, i) => (
              <tr key={p.id} className={`border-b border-line transition-colors last:border-0 hover:bg-surface ${i === 0 ? 'bg-lime/15' : ''}`}>
                <td className={`td d ${i === 0 ? 'text-accent' : 'text-muted'} text-lg`}>{String(i + 1).padStart(2, '0')}</td>
                <td className="td text-sm font-semibold text-ink"><div className="flex items-center gap-3"><span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:flex ${i === 0 ? 'bg-lime text-navy' : 'bg-surface2 text-muted'}`} aria-hidden="true">{initials(p.name)}</span><span>{p.name}</span></div></td>
                <td className="td hidden text-xs text-muted sm:table-cell">{p.club ?? '-'}</td>
                <td className="td text-right font-bold tabular-nums text-navy">{fmtNum(p.rating)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
