'use client'
import { useState } from 'react'
import { useActionForm } from './use-action-form'
import { AdminDeleteButton } from './admin-delete-button'
import { MatchFormFields, MATCH_STATUS_LABEL, type MatchFormOptions } from './match-form-fields'
import { updateMatchAction, deleteMatchAction } from '@/server/actions/matches'
import { fmtDateTime } from '@/lib/format'

type Player = { id: string; name: string }
export interface MatchRow {
  id: string
  status: string
  teamA: Player[]
  teamB: Player[]
  sets: number[][] | null
  winnerTeam: 'A' | 'B' | null
  scheduledAt: string | null
  scheduledInput: string
  courtId: string | null
  courtLabel: string | null
  refereeId: string | null
  refereeName: string | null
  trainerId: string | null
  trainerName: string | null
  competitionName: string | null
  isBracket: boolean
  cancelReason: string | null
}

const names = (t: Player[]) => t.map((p) => p.name).join(' & ') || '-'
const scoreText = (sets: number[][] | null) => (sets && sets.length ? sets.map(([a, b]) => `${a}-${b}`).join(', ') : '-')

function EditRow({ m, options, onDone }: { m: MatchRow; options: MatchFormOptions; onDone: () => void }) {
  const { state, pending, formRef, onSubmit } = useActionForm(updateMatchAction, onDone)
  const locked = m.status === 'PENDING_VERIFICATION' || m.status === 'VERIFIED'
  return (
    <tr className="border-b border-line bg-surface align-top">
      <td colSpan={5} className="td">
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="id" value={m.id} />
          <MatchFormFields
            options={options}
            lineupLocked={locked}
            showStatus
            defaults={{
              a1: m.teamA[0]?.id, a2: m.teamA[1]?.id, b1: m.teamB[0]?.id, b2: m.teamB[1]?.id,
              courtId: m.courtId, refereeId: m.refereeId, trainerId: m.trainerId,
              scheduledAt: m.scheduledInput, status: m.status, cancelReason: m.cancelReason,
            }}
          />
          {locked && (
            <p className="text-xs text-muted sm:col-span-2">
              Hasil sudah dikirim, jadi susunan pemain, status, dan skor dikunci. {m.status === 'VERIFIED' ? 'Gunakan koreksi di antrean verifikasi bila hasilnya keliru.' : 'Verifikasi atau koreksi di bagian atas halaman.'}
            </p>
          )}
          <div className="flex items-center gap-3 sm:col-span-2">
            <button disabled={pending} className="btn-p h-10 px-5 text-xs">{pending ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Batal</button>
          </div>
          {state?.error && <p role="alert" className="text-xs text-red-400 sm:col-span-2">{state.error}</p>}
        </form>
      </td>
    </tr>
  )
}

export function MatchesTable({ matches, options }: { matches: MatchRow[]; options: MatchFormOptions }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="mt-4 overflow-x-auto border border-line">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            <th className="th">Pertandingan</th><th className="th">Jadwal & tempat</th><th className="th">Petugas</th><th className="th">Status</th><th className="th"></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) =>
            editingId === m.id ? (
              <EditRow key={m.id} m={m} options={options} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={m.id} className="border-b border-line last:border-0 align-top hover:bg-surface">
                <td className="td">
                  <p className="font-display text-base uppercase">{names(m.teamA)} <span className="text-muted">vs</span> {names(m.teamB)}</p>
                  <p className="text-xs text-muted">
                    {m.sets ? `Skor ${scoreText(m.sets)}${m.winnerTeam ? ` · ${names(m.winnerTeam === 'A' ? m.teamA : m.teamB)} menang` : ''}` : 'Belum ada skor'}
                    {m.competitionName ? ` · ${m.competitionName}` : ''}
                  </p>
                </td>
                <td className="td text-muted">
                  {m.scheduledAt ? fmtDateTime(new Date(m.scheduledAt)) : 'Belum dijadwalkan'}
                  <span className="block text-xs">{m.courtLabel ?? 'Lapangan belum dipilih'}</span>
                </td>
                <td className="td text-xs text-muted">
                  Wasit: {m.refereeName ?? '-'}<br />Pelatih: {m.trainerName ?? '-'}
                </td>
                <td className="td">
                  <span className="border border-line px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest">{MATCH_STATUS_LABEL[m.status] ?? m.status}</span>
                </td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingId(m.id)} className="text-xs font-bold uppercase tracking-widest text-navy hover:text-accent">Ubah</button>
                    <AdminDeleteButton id={m.id} action={deleteMatchAction} confirmMessage={`Hapus pertandingan ${names(m.teamA)} vs ${names(m.teamB)}?`} />
                  </div>
                </td>
              </tr>
            ),
          )}
          {matches.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-sm text-muted">Belum ada pertandingan untuk filter ini.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
