'use client'
import { useState } from 'react'
import { AthletesTable, type AthleteRow } from './athletes-table'
import { CreateAthleteForm } from './create-athlete-form'

interface Initial { rows: AthleteRow[]; total: number; pages: number }
type District = { id: string; name: string }
type Club = { id: string; name: string; districtId: string | null }

/**
 * Ties the "add athlete" form to the athletes table so a newly created
 * athlete shows up in the list right away, without a page reload.
 */
export function AthletesAdminSection({ initial, districts, clubs }: { initial: Initial; districts: District[]; clubs: Club[] }) {
  const [refreshSignal, setRefreshSignal] = useState(0)
  return (
    <div>
      <AthletesTable initial={initial} districts={districts} clubs={clubs} refreshSignal={refreshSignal} />

      <h2 className="d mt-10 text-2xl">Tambah atlet</h2>
      <CreateAthleteForm districts={districts} clubs={clubs} onCreated={() => setRefreshSignal((n) => n + 1)} />
    </div>
  )
}
