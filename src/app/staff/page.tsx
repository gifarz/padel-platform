import { getMyStaffProfile } from '@/server/queries'

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Aktif', INACTIVE: 'Nonaktif', SUSPENDED: 'Ditangguhkan' }

export default async function StaffPage() {
  const profile = await getMyStaffProfile()
  if (!profile) return null // middleware/layout already gate this route

  const isTrainer = profile.role === 'TRAINER'

  return (
    <div>
      <p className="lb">{isTrainer ? 'Pelatih' : 'Wasit'} · PBPI Kabupaten Garut</p>
      <h1 className="d mt-2 text-4xl sm:text-5xl">{profile.user.name}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="lb">Nomor HP</p>
          <p className="mt-1 text-sm">{profile.user.phone}</p>
        </div>
        <div className="card p-5">
          <p className="lb">Kecamatan</p>
          <p className="mt-1 text-sm">{profile.district?.name ?? profile.city ?? '-'}</p>
        </div>
        <div className="card p-5">
          <p className="lb">Status</p>
          <p className="mt-1 text-sm">{STATUS_LABEL[profile.status] ?? profile.status}</p>
        </div>
        <div className="card p-5">
          <p className="lb">Pengalaman</p>
          <p className="mt-1 text-sm">{profile.yearsExp} tahun</p>
        </div>
        {isTrainer && 'specialties' in profile && profile.specialties.length > 0 && (
          <div className="card p-5 sm:col-span-2">
            <p className="lb">Spesialisasi</p>
            <p className="mt-1 text-sm">{profile.specialties.join(' · ')}</p>
          </div>
        )}
        {!isTrainer && 'certification' in profile && (
          <div className="card p-5 sm:col-span-2">
            <p className="lb">Sertifikasi</p>
            <p className="mt-1 text-sm">{profile.certification}</p>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-muted">
        Profil ini dikelola oleh admin PBPI Kabupaten Garut. Hubungi sekretariat jika ada data yang perlu diperbarui.
      </p>
    </div>
  )
}
