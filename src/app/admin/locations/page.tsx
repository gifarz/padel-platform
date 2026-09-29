import { getLocationsAdmin } from '@/server/queries'
import { LocationsTable } from '@/components/admin/locations-table'
import { CreateLocationForm } from '@/components/admin/create-location-form'

export default async function AdminLocationsPage() {
  const locations = await getLocationsAdmin()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="d text-4xl sm:text-6xl">Lokasi</h1>
        <p className="max-w-md text-xs text-muted">Venue/lapangan yang bisa dipilih saat membuat kompetisi baru. Lokasi yang masih dipakai kompetisi tidak bisa dihapus.</p>
      </div>

      <LocationsTable locations={locations} />

      <h2 className="d mt-10 text-2xl">Tambah lokasi baru</h2>
      <CreateLocationForm />
    </div>
  )
}
