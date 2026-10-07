import Link from 'next/link'
import { getMyMatches } from '@/server/queries'
import { MatchRow } from '@/components/athlete/match-row'

const GROUPS: { title: string; statuses: string[] }[] = [
  { title: 'Perlu tindakan', statuses: ['REQUESTED', 'ACCEPTED', 'PENDING_VERIFICATION'] },
  { title: 'Terjadwal', statuses: ['SCHEDULED'] },
  { title: 'Selesai', statuses: ['VERIFIED', 'PLAYED', 'CANCELLED'] },
]

export default async function MatchesPage() {
  const matches = await getMyMatches()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="d text-5xl sm:text-7xl">
          Pertandingan<br /><span className="text-accent">kamu.</span>
        </h1>
        <Link href="/find-opponent" className="btn-p">+ Tantang pemain baru</Link>
      </div>

      <div className="mt-10 space-y-10">
        {GROUPS.map((g) => {
          const rows = matches.filter((m) => g.statuses.includes(m.status))
          if (!rows.length) return null
          return (
            <section key={g.title}>
              <h2 className="d text-2xl">{g.title}</h2>
              <div className="mt-3 divide-y divide-line border-y border-line">
                {rows.map((m) => <MatchRow key={m.id} {...m} />)}
              </div>
            </section>
          )
        })}
        {matches.length === 0 && <p className="text-sm text-muted">Belum ada pertandingan. Cari lawan di halaman Pemain.</p>}
      </div>

      <div className="mt-12 border border-line bg-surface p-6">
        <p className="lb">Alur pertandingan</p>
        <p className="mt-2 text-sm text-muted">
          Ajukan tantangan → lawan terima → main → input skor → hasil diverifikasi admin/wasit → poin diperbarui otomatis.
        </p>
      </div>
    </div>
  )
}
