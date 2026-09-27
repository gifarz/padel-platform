import { getDistrictsAdmin } from '@/server/queries'
import { AdminToggle } from '@/components/admin/admin-toggle'
import { toggleDistrictActiveAction } from '@/server/actions/districts'

export default async function AdminDistrictsPage() {
  const districts = await getDistrictsAdmin()

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Kecamatan</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        42 kecamatan Kabupaten Garut sudah tersedia dari data awal. Nonaktifkan kecamatan di sini untuk
        menyembunyikannya dari formulir pendaftaran dan filter direktori, batas administrasinya sendiri
        tidak dapat diubah dari sini.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((d) => (
          <div key={d.id} className="flex items-center justify-between border border-line px-4 py-3">
            <span className="text-sm font-semibold text-ink">{d.name}</span>
            <AdminToggle id={d.id} checked={d.isActive} action={toggleDistrictActiveAction} label={d.isActive ? 'Aktif' : 'Nonaktif'} />
          </div>
        ))}
      </div>
    </div>
  )
}
