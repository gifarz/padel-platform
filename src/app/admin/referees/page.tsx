import { getReferees, getDistricts } from '@/server/queries'
import { StaffStatus } from '@/components/admin/staff-status'
import { CreateRefereeForm } from '@/components/admin/create-referee-form'

export default async function AdminRefereesPage() {
  const [referees, districts] = await Promise.all([getReferees(), getDistricts()])
  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Wasit</h1>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th">Nama</th><th className="th">Kecamatan</th><th className="th">Sertifikasi</th><th className="th">Pengalaman</th><th className="th">Pertandingan</th><th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {referees.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">{r.user.name}</td>
                <td className="td text-muted">{r.district?.name ?? r.city ?? '-'}</td>
                <td className="td text-muted">{r.certification}</td>
                <td className="td">{r.yearsExp} tahun</td>
                <td className="td">{r._count.matches}</td>
                <td className="td"><StaffStatus id={r.id} status={r.status} kind="referee" /></td>
              </tr>
            ))}
            {referees.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-sm text-muted">Belum ada wasit terdaftar.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="d mt-10 text-2xl">Tambah wasit</h2>
      <CreateRefereeForm districts={districts} />
    </div>
  )
}
