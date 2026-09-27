import { getOrganizationMembersAdmin } from '@/server/queries'
import { CreateMemberForm } from '@/components/admin/create-member-form'
import { AdminToggle } from '@/components/admin/admin-toggle'
import { AdminDeleteButton } from '@/components/admin/admin-delete-button'
import { toggleMemberActiveAction, deleteMemberAction } from '@/server/actions/organization'

export default async function AdminOrganizationPage() {
  const members = await getOrganizationMembersAdmin()

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pengurus</h1>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="th">Nama</th><th className="th">Jabatan</th><th className="th">Divisi</th>
              <th className="th">Urutan</th><th className="th">Aktif</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base">{m.name}</td>
                <td className="td text-muted">{m.position}</td>
                <td className="td text-muted">{m.division ?? '-'}</td>
                <td className="td">{m.sortOrder}</td>
                <td className="td"><AdminToggle id={m.id} checked={m.isActive} action={toggleMemberActiveAction} label={m.isActive ? 'Ya' : 'Tidak'} /></td>
                <td className="td text-right"><AdminDeleteButton id={m.id} action={deleteMemberAction} confirmMessage={`Hapus "${m.name}" dari struktur pengurus?`} /></td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-sm text-muted">Belum ada pengurus. Tambahkan di bawah.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="d mt-10 text-2xl">Tambah pengurus</h2>
      <CreateMemberForm />
    </div>
  )
}
