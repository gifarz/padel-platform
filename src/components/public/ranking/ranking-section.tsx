import Link from 'next/link'
import { ArrowUpRight, Trophy } from 'lucide-react'
import { RankingTabs } from './ranking-tabs'
import { getLeaderboard } from '@/server/queries'

export async function RankingSection() {
  const [putra, putri, campuran] = await Promise.all([
    getLeaderboard({ gender: 'MALE', take: 5 }),
    getLeaderboard({ gender: 'FEMALE', take: 5 }),
    getLeaderboard({ take: 5 }),
  ])

  return (
    <section id="peringkat" className="bg-surface">
      <div className="section grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
        <div>
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-navy"><Trophy size={25} strokeWidth={1.5} aria-hidden="true" /></span>
          <p className="section-title">The leaderboard</p>
          <h2 className="d mt-4 text-4xl text-navy sm:text-5xl lg:text-6xl">Kerja keras.<br />Poin nyata.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">Kenali para pemain yang membawa permainan ke level berikutnya. Pantau peringkat dan temukan motivasi untuk rally selanjutnya.</p>
          <Link href="/ranking" className="section-link mt-7">Lihat Semua Peringkat <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="min-w-0 rounded-3xl border border-line bg-white p-4 shadow-card sm:p-7">
          <div className="flex items-center justify-between gap-3"><p className="font-display text-lg font-bold tracking-tight text-navy">Peringkat PBPI Garut</p><span className="rounded-full bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">Top 5</span></div>
          <RankingTabs putra={putra} putri={putri} campuran={campuran} />
        </div>
      </div>
    </section>
  )
}
