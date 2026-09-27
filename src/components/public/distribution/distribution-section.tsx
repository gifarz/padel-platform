import { DistributionInteractive } from './distribution-interactive'
import type { DistrictRow } from './garut-map'

export type { DistrictRow }

export function DistributionSection({ rows }: { rows: DistrictRow[] }) {
  return (
    <section className="border-t border-line bg-surface">
      <div className="section">
        <p className="section-title">Sebaran Wilayah</p>
        <h2 className="d mt-2 text-3xl text-navy sm:text-4xl">
          Peta Sebaran<br />Padel Kabupaten Garut
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Sebaran pemain dan klub padel resmi di seluruh 42 kecamatan Kabupaten Garut, berdasarkan batas
          administrasi kecamatan.
        </p>

        <DistributionInteractive rows={rows} />
      </div>
    </section>
  )
}
