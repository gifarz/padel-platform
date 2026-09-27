import { getClubsAdmin, getDistricts } from '@/server/queries'
import { CreateClubForm } from '@/components/admin/create-club-form'
import { AdminToggle } from '@/components/admin/admin-toggle'
import { AdminDeleteButton } from '@/components/admin/admin-delete-button'
import { toggleClubVerifiedAction, deleteClubAction } from '@/server/actions/clubs'

export default async function AdminClubsPage() {
  const [clubs, districts] = await Promise.all([getClubsAdmin(), getDistricts()])

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Klub</h1>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="th">Nama</th><th className="th">Kecamatan</th><th className="th">Anggota</th>
              <th className="th">Terverifikasi</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base">{c.name}</td>
                <td className="td text-muted">{c.district?.name ?? '-'}</td>
                <td className="td">{c._count.members}</td>
                <td className="td"><AdminToggle id={c.id} checked={c.isVerified} action={toggleClubVerifiedAction} label={c.isVerified ? 'Ya' : 'Tidak'} /></td>
                <td className="td text-right"><AdminDeleteButton id={c.id} action={deleteClubAction} confirmMessage={`Hapus klub "${c.name}"?`} /></td>
              </tr>
            ))}
            {clubs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-sm text-muted">Belum ada klub. Buat satu di bawah.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="d mt-10 text-2xl">Tambah klub baru</h2>
      <CreateClubForm districts={districts} />
    </div>
  )
}
