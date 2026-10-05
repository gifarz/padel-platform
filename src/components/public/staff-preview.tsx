import Link from 'next/link'
import { getTrainers, getReferees } from '@/server/queries'

export async function StaffPreview() {
  const [trainers, referees] = await Promise.all([getTrainers(), getReferees()])
  const t = trainers.slice(0, 3)
  const r = referees.slice(0, 3)

  return (
    <section id="tim-pendukung" className="section">
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <p className="section-title">Pelatih</p>
          <h3 className="d mt-3 text-3xl text-navy sm:text-4xl">Pelatih Bersertifikat</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {t.length === 0 && <li className="py-4 text-sm text-muted">Belum ada pelatih terdaftar.</li>}
            {t.map((x) => (
              <li key={x.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold text-ink">{x.user.name}</span>
                <span className="text-xs text-muted">{x.district?.name ?? x.city ?? '-'}</span>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="section-link mt-5">Hubungi Kami untuk Info Pelatih ↗</Link>
        </div>

        <div>
          <p className="section-title">Wasit</p>
          <h3 className="d mt-3 text-3xl text-navy sm:text-4xl">Wasit Bersertifikat</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {r.length === 0 && <li className="py-4 text-sm text-muted">Belum ada wasit terdaftar.</li>}
            {r.map((x) => (
              <li key={x.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold text-ink">{x.user.name}</span>
                <span className="text-xs text-muted">{x.district?.name ?? x.city ?? '-'}</span>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="section-link mt-5">Hubungi Kami untuk Info Wasit ↗</Link>
        </div>
      </div>
    </section>
  )
}
