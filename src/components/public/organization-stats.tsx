import { CountUp } from '@/components/marketing/count-up'

type Stats = { players: number; clubs: number; activeDistricts: number; activeCompetitions: number }

export function OrganizationStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Pemain Terdaftar', value: stats.players },
    { label: 'Klub', value: stats.clubs },
    { label: 'Kecamatan Aktif', value: stats.activeDistricts },
    { label: 'Turnamen Berjalan', value: stats.activeCompetitions },
  ]

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-site grid-cols-2 sm:grid-cols-4">
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`border-line px-6 py-10 text-center sm:px-8 sm:py-14 ${i % 2 === 0 ? 'border-r' : ''} sm:border-r sm:last:border-r-0`}
          >
            <CountUp value={s.value} className="d block text-5xl text-navy sm:text-6xl lg:text-7xl" />
            <p className="lb mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
