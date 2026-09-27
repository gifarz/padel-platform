'use client'

export type DistributionMode = 'players' | 'clubs'

export function DistributionToggle({
  mode,
  onChange,
}: {
  mode: DistributionMode
  onChange: (mode: DistributionMode) => void
}) {
  return (
    <div role="tablist" aria-label="Tampilkan berdasarkan" className="inline-flex overflow-hidden rounded-sm border border-line">
      {(['players', 'clubs'] as DistributionMode[]).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-widest transition ${
            mode === m ? 'bg-navy text-white' : 'bg-white text-muted hover:text-navy'
          }`}
        >
          {m === 'players' ? 'Pemain' : 'Klub'}
        </button>
      ))}
    </div>
  )
}
