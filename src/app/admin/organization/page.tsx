import { getOrganizationMembersAdmin } from '@/server/queries'
import { CreateMemberForm } from '@/components/admin/create-member-form'
import { MembersTable } from '@/components/admin/members-table'
import { OrgChart } from '@/components/public/org-chart'

export default async function AdminOrganizationPage() {
  const members = await getOrganizationMembersAdmin()

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pengurus</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Bagan disusun otomatis dari jabatan dan divisi: <b>Ketua</b> di puncak, lalu <b>Wakil Ketua / Sekretaris / Bendahara</b>,
        kemudian satu kolom per <b>divisi</b>. Gunakan kolom urutan untuk mengatur posisi.
      </p>

      <MembersTable members={members} />

      <h2 className="d mt-10 text-2xl">Tambah pengurus</h2>
      <CreateMemberForm />

      <h2 className="d mt-12 text-2xl">Pratinjau bagan</h2>
      <p className="mt-1 text-xs text-muted">Hanya pengurus berstatus aktif yang tampil di situs publik.</p>
      <div className="mt-6 border border-line p-6">
        {members.filter((m) => m.isActive).length === 0 ? (
          <p className="text-sm text-muted">Belum ada pengurus aktif.</p>
        ) : (
          <OrgChart members={members.filter((m) => m.isActive)} />
        )}
      </div>
    </div>
  )
}
