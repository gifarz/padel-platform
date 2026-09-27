'use client'
import { useTransition } from 'react'
import { setTrainerStatusAction, setRefereeStatusAction } from '@/server/actions/staff'

const OPTIONS = [['ACTIVE', 'Aktif'], ['INACTIVE', 'Nonaktif'], ['SUSPENDED', 'Ditangguhkan']] as const

export function StaffStatus({ id, status, kind }: { id: string; status: string; kind: 'trainer' | 'referee' }) {
  const [pending, startTransition] = useTransition()
  const action = kind === 'trainer' ? setTrainerStatusAction : setRefereeStatusAction
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => action(id, e.target.value as never))}
      className="inp max-w-[9rem] py-1.5"
    >
      {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}
