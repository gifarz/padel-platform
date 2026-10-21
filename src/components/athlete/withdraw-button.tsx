'use client'
import { useTransition } from 'react'
import { withdrawFromCompetitionAction } from '@/server/actions/competitions'

export function WithdrawButton({ competitionId }: { competitionId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Batalkan pendaftaranmu di kompetisi ini?')) return
        startTransition(async () => {
          try { await withdrawFromCompetitionAction(competitionId) } catch (err) { window.alert(err instanceof Error ? err.message : 'Gagal membatalkan.') }
        })
      }}
      className="btn-line mt-3"
    >
      {pending ? 'Membatalkan…' : 'Batalkan pendaftaran'}
    </button>
  )
}
