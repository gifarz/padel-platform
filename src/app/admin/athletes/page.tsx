import { getAthletesAdminPage, getDistricts, getClubsForPicker } from '@/server/queries'
import { AthletesAdminSection } from '@/components/admin/athletes-admin-section'

export default async function AdminAthletesPage() {
  const [initial, districts, clubs] = await Promise.all([
    getAthletesAdminPage('', 1),
    getDistricts(),
    getClubsForPicker(),
  ])
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="d text-4xl sm:text-6xl">Atlet</h1>
        <p className="text-xs text-muted">Tambah, ubah, atau hapus atlet di sini. Atlet yang sudah punya riwayat pertandingan hanya bisa dinonaktifkan.</p>
      </div>
      <AthletesAdminSection initial={initial} districts={districts} clubs={clubs} />
    </div>
  )
}
