import { getReferees, getDistricts } from '@/server/queries'
import { CreateRefereeForm } from '@/components/admin/create-referee-form'
import { RefereesTable } from '@/components/admin/referees-table'

export default async function AdminRefereesPage() {
  const [referees, districts] = await Promise.all([getReferees(), getDistricts()])
  const rows = referees.map((r) => ({
    id: r.id,
    name: r.user.name,
    phone: r.user.phone,
    districtId: r.districtId,
    districtName: r.district?.name ?? r.city ?? '-',
    certification: r.certification,
    yearsExp: r.yearsExp,
    matchCount: r._count.matches,
    status: r.status,
  }))
  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Wasit</h1>
      <RefereesTable referees={rows} districts={districts} />
      <h2 className="d mt-10 text-2xl">Tambah wasit</h2>
      <CreateRefereeForm districts={districts} />
    </div>
  )
}
