import { getTrainers, getDistricts } from '@/server/queries'
import { CreateTrainerForm } from '@/components/admin/create-trainer-form'
import { TrainersTable } from '@/components/admin/trainers-table'

export default async function AdminTrainersPage() {
  const [trainers, districts] = await Promise.all([getTrainers(), getDistricts()])
  const rows = trainers.map((t) => ({
    id: t.id,
    name: t.user.name,
    phone: t.user.phone,
    districtId: t.districtId,
    districtName: t.district?.name ?? t.city ?? '-',
    specialties: t.specialties,
    yearsExp: t.yearsExp,
    sessionPrice: t.sessionPrice,
    status: t.status,
  }))
  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pelatih</h1>
      <TrainersTable trainers={rows} districts={districts} />
      <h2 className="d mt-10 text-2xl">Tambah pelatih</h2>
      <CreateTrainerForm districts={districts} />
    </div>
  )
}
