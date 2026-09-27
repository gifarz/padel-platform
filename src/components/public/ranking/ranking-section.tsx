import Link from 'next/link'
import { RankingTabs } from './ranking-tabs'
import { getLeaderboard } from '@/server/queries'

export async function RankingSection() {
  const [putra, putri, campuran] = await Promise.all([
    getLeaderboard({ gender: 'MALE', take: 5 }),
    getLeaderboard({ gender: 'FEMALE', take: 5 }),
    getLeaderboard({ take: 5 }),
  ])

  return (
    <section id="peringkat" className="section">
      <p className="section-title">Peringkat Pemain</p>
      <h2 className="d mt-2 text-3xl text-navy sm:text-4xl">Peringkat Pemain PBPI</h2>

      <RankingTabs putra={putra} putri={putri} campuran={campuran} />

      <Link href="/ranking" className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-accent">
        Lihat Semua Peringkat →
      </Link>
    </section>
  )
}
