import Link from 'next/link'
import { getPendingVerifications, getMatchesAdmin, getMatchFormOptions } from '@/server/queries'
import { VerifyRow } from '@/components/admin/verify-row'
import { CreateMatchForm } from '@/components/admin/create-match-form'
import { MatchesTable } from '@/components/admin/matches-table'
import { MATCH_STATUS_LABEL } from '@/components/admin/match-form-fields'
import { toLocalDateTimeInput } from '@/lib/format'

const STATUSES = ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'PLAYED', 'PENDING_VERIFICATION', 'VERIFIED', 'CANCELLED'] as const

export default async function AdminMatchesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam } = await searchParams
  const status = STATUSES.find((s) => s === statusParam)

  const [pending, matches, options] = await Promise.all([
    getPendingVerifications(),
    getMatchesAdmin(status),
    getMatchFormOptions(),
  ])

  const rows = matches.map((m) => ({ ...m, scheduledInput: toLocalDateTimeInput(m.scheduledAt ? new Date(m.scheduledAt) : null) }))

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pertandingan</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Memverifikasi hasil langsung memicu perhitungan poin lewat <code className="text-ink">verifyMatch()</code>.
        Poin kedua atlet, riwayat poin, dan statistik menang/kalah diperbarui dalam satu transaksi database.
      </p>

      <h2 className="d mt-8 text-2xl">Menunggu verifikasi</h2>
      <div className="mt-3 divide-y divide-line border-y border-line">
        {pending.length === 0 && <p className="py-6 text-sm text-muted">Tidak ada hasil yang menunggu verifikasi.</p>}
        {pending.map((m) => <VerifyRow key={m.id} {...m} />)}
      </div>

      <h2 className="d mt-12 text-2xl">Semua pertandingan</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter status">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `?status=${s}` : '?'}
            aria-current={status === s ? 'true' : undefined}
            className={`border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-widest ${status === s ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-navy hover:text-navy'}`}
          >
            {s ? MATCH_STATUS_LABEL[s] : 'Semua'}
          </Link>
        ))}
      </div>
      <MatchesTable matches={rows} options={options} />
      <p className="mt-2 text-xs text-muted">Menampilkan maksimal 100 pertandingan terbaru.</p>

      <h2 className="d mt-10 text-2xl">Buat pertandingan</h2>
      <CreateMatchForm options={options} />
    </div>
  )
}
