import { getTrainers, getDistricts } from '@/server/queries'
import { StaffStatus } from '@/components/admin/staff-status'
import { CreateTrainerForm } from '@/components/admin/create-trainer-form'

export default async function AdminTrainersPage() {
  const [trainers, districts] = await Promise.all([getTrainers(), getDistricts()])
  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pelatih</h1>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th">Nama</th><th className="th">Kecamatan</th><th className="th">Spesialisasi</th><th className="th">Pengalaman</th><th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">{t.user.name}</td>
                <td className="td text-muted">{t.district?.name ?? t.city ?? '-'}</td>
                <td className="td text-muted">{t.specialties.join(' · ') || '-'}</td>
                <td className="td">{t.yearsExp} tahun</td>
                <td className="td"><StaffStatus id={t.id} status={t.status} kind="trainer" /></td>
              </tr>
            ))}
            {trainers.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-sm text-muted">Belum ada pelatih terdaftar.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="d mt-10 text-2xl">Tambah pelatih</h2>
      <CreateTrainerForm districts={districts} />
    </div>
  )
}
