import { getAthletesPage, getDistricts, getClubsForPicker } from '@/server/queries'
import { AthletesTable } from '@/components/admin/athletes-table'
import { CreateAthleteForm } from '@/components/admin/create-athlete-form'

export default async function AdminAthletesPage() {
  const [initial, districts, clubs] = await Promise.all([
    getAthletesPage('', 1),
    getDistricts(),
    getClubsForPicker(),
  ])
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="d text-4xl sm:text-6xl">Atlet</h1>
        <p className="text-xs text-muted">Pendaftaran atlet baru dibuat langsung oleh admin di bawah.</p>
      </div>
      <AthletesTable initial={initial} />

      <h2 className="d mt-10 text-2xl">Tambah atlet</h2>
      <CreateAthleteForm districts={districts} clubs={clubs} />
    </div>
  )
}
