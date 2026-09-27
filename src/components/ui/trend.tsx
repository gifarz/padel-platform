export function Trend({ trend, value }: { trend: 'up' | 'down' | 'flat'; value: number }) {
  if (trend === 'flat') return <span className="font-bold text-muted">-</span>
  return (
    <span className={`font-bold ${trend === 'up' ? 'text-accent' : 'text-red-400'}`}>
      {trend === 'up' ? '↑' : '↓'} {value}
    </span>
  )
}
