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
      <h2 className="d mt-3 text-4xl text-navy sm:text-5xl lg:text-6xl">Peringkat Pemain PBPI</h2>

      <RankingTabs putra={putra} putri={putri} campuran={campuran} />

      <Link href="/ranking" className="mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.06em] text-accent">
        Lihat Semua Peringkat →
      </Link>
    </section>
  )
}
