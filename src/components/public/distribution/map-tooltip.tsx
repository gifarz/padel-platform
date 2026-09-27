export function MapTooltip({
  x,
  y,
  name,
  players,
  clubs,
}: {
  x: number
  y: number
  name: string
  players: number
  clubs: number
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-sm border border-line bg-white px-3 py-2 text-xs shadow-card"
      style={{ left: x, top: y - 10 }}
      role="status"
    >
      <p className="font-bold text-navy">{name}</p>
      <p className="text-muted">{players} Pemain</p>
      <p className="text-muted">{clubs} Klub</p>
    </div>
  )
}
