'use client'
import { useState } from 'react'
import { GarutMap, type DistrictRow } from './garut-map'
import { DistributionPanel } from './distribution-panel'
import { DistributionToggle, type DistributionMode } from './distribution-toggle'

export function DistributionInteractive({ rows }: { rows: DistrictRow[] }) {
  const [mode, setMode] = useState<DistributionMode>('players')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const totalPlayers = rows.reduce((sum, r) => sum + r.players, 0)
  const totalClubs = rows.reduce((sum, r) => sum + r.clubs, 0)
  const activeDistricts = rows.filter((r) => r.players > 0 || r.clubs > 0).length

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="lb text-navy">42 Kecamatan</p>
          <DistributionToggle mode={mode} onChange={setMode} />
        </div>
        <GarutMap rows={rows} mode={mode} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
        <p className="mt-3 text-center text-xs text-muted">Ketuk atau klik kecamatan untuk melihat detail.</p>
      </div>

      <DistributionPanel
        rows={rows}
        mode={mode}
        totalPlayers={totalPlayers}
        totalClubs={totalClubs}
        activeDistricts={activeDistricts}
        selectedSlug={selectedSlug}
        onClearSelection={() => setSelectedSlug(null)}
      />
    </div>
  )
}
