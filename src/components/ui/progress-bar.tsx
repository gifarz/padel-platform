export function ProgressBar({ percent, className = '' }: { percent: number; className?: string }) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div className={`h-1.5 w-full bg-line ${className}`}>
      <div className="h-full bg-accent transition-all duration-700" style={{ width: `${p}%` }} />
    </div>
  )
}
