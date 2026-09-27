'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function SortSelect({ options }: { options: readonly { value: string; label: string }[] }) {
  const router = useRouter()
  const params = useSearchParams()

  return (
    <select
      defaultValue={params.get('sort') ?? options[0]?.value}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString())
        next.set('sort', e.target.value)
        router.push(`?${next.toString()}`)
      }}
      className="border border-line bg-surface px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink"
    >
      {options.map((s) => <option key={s.value} value={s.value}>Urutkan: {s.label}</option>)}
    </select>
  )
}
