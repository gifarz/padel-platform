import { StatusBadge } from '@/components/ui/badge'

interface BracketRound {
  round: number
  matches: { id: string; status: string; winnerTeam: string | null; teamA: string; teamB: string }[]
}

export function BracketView({ rounds }: { rounds: BracketRound[] }) {
  const roundLabel = (round: number, total: number) => {
    const fromEnd = total - round
    if (fromEnd === 0) return 'Final'
    if (fromEnd === 1) return 'Semifinal'
    if (fromEnd === 2) return 'Perempat final'
    return `Babak ${round}`
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {rounds.map((r) => (
        <div key={r.round} className="flex w-64 shrink-0 flex-col justify-around gap-4">
          <p className="lb text-center">{roundLabel(r.round, rounds.length)}</p>
          {r.matches.map((m) => (
            <div key={m.id} className="border border-line bg-surface p-3 text-sm">
              <p className={m.winnerTeam === 'A' ? 'font-bold text-accent' : ''}>{m.teamA}</p>
              <p className="my-1 text-center text-xs text-muted">vs</p>
              <p className={m.winnerTeam === 'B' ? 'font-bold text-accent' : ''}>{m.teamB}</p>
              <div className="mt-2"><StatusBadge status={m.status} /></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
