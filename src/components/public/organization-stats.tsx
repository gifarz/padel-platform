import { CountUp } from '@/components/marketing/count-up'
import { ArrowUpRight, MapPin, Trophy, Users, ShieldCheck } from 'lucide-react'

type Stats = { players: number; clubs: number; activeDistricts: number; activeCompetitions: number }

export function OrganizationStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Pemain Terdaftar', value: stats.players, icon: Users },
    { label: 'Klub Padel', value: stats.clubs, icon: ShieldCheck },
    { label: 'Kecamatan Aktif', value: stats.activeDistricts, icon: MapPin },
    { label: 'Turnamen Berjalan', value: stats.activeCompetitions, icon: Trophy },
  ]

  return (
    <section id="jelajahi" className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-site gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_3fr] lg:items-center lg:py-12">
        <div>
          <p className="section-title">Bertumbuh bersama</p>
          <p className="mt-3 max-w-56 text-xl font-bold leading-snug tracking-tight text-navy">Satu komunitas.<br />Semangat tanpa batas. <ArrowUpRight className="inline text-accent" size={21} aria-hidden="true" /></p>
        </div>
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border-l border-navy/15 px-5 sm:px-6">
              <Icon size={18} strokeWidth={1.5} className="mb-4 text-muted" aria-hidden="true" />
              <CountUp value={value} className="d block text-4xl tabular-nums text-navy sm:text-5xl" />
              <p className="mt-2 text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
