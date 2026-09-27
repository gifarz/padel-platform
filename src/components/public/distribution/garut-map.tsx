'use client'
import { useEffect, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import { fillForCount } from './scale'
import { MapTooltip } from './map-tooltip'
import type { DistributionMode } from './distribution-toggle'

export type DistrictRow = { districtId: string; district: string; slug: string; players: number; clubs: number }

type KecamatanProps = { code: string; name: string; kemendagriCode: string }

const WIDTH = 620
const HEIGHT = 640

export function GarutMap({
  rows,
  mode,
  selectedSlug,
  onSelect,
}: {
  rows: DistrictRow[]
  mode: DistributionMode
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry, KecamatanProps> | null>(null)
  const [hover, setHover] = useState<{ slug: string; x: number; y: number } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/maps/garut-kecamatan.geojson')
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setGeo(data) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return <p className="p-6 text-center text-sm text-muted">Gagal memuat data peta.</p>
  }
  if (!geo) {
    return <div className="flex h-[420px] items-center justify-center text-sm text-muted">Memuat peta…</div>
  }

  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geo)
  const pathGen = geoPath(projection)
  const bySlug = new Map(rows.map((r) => [r.slug, r]))

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Peta sebaran padel 42 kecamatan Kabupaten Garut"
      >
        {geo.features.map((f: Feature<Geometry, KecamatanProps>) => {
          const slug = f.properties.code
          const row = bySlug.get(slug)
          const count = mode === 'players' ? row?.players ?? 0 : row?.clubs ?? 0
          const isSelected = selectedSlug === slug
          const d = pathGen(f) ?? undefined
          return (
            <path
              key={slug}
              d={d}
              fill={fillForCount(count)}
              stroke={isSelected ? '#0B2545' : '#FFFFFF'}
              strokeWidth={isSelected ? 2 : 0.75}
              tabIndex={0}
              role="button"
              aria-label={`${f.properties.name}: ${count} ${mode === 'players' ? 'pemain' : 'klub'}`}
              onMouseMove={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                if (!rect) return
                setHover({ slug, x: e.clientX - rect.left, y: e.clientY - rect.top })
              }}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(isSelected ? null : slug)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(isSelected ? null : slug) }
              }}
              className="cursor-pointer outline-none transition-opacity hover:opacity-85 focus-visible:stroke-2"
            />
          )
        })}
      </svg>

      {hover && (() => {
        const feature = geo.features.find((f) => f.properties.code === hover.slug)
        const row = bySlug.get(hover.slug)
        if (!feature) return null
        return (
          <MapTooltip x={hover.x} y={hover.y} name={feature.properties.name} players={row?.players ?? 0} clubs={row?.clubs ?? 0} />
        )
      })()}
    </div>
  )
}
