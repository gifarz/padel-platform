import { getPendingVerifications } from '@/server/queries'
import { VerifyRow } from '@/components/admin/verify-row'
import { CreateMatchForm } from '@/components/admin/create-match-form'

export default async function AdminMatchesPage() {
  const pending = await getPendingVerifications()

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Pertandingan</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Memverifikasi hasil langsung memicu perhitungan rating lewat <code className="text-ink">verifyMatch()</code>.
        Rating kedua atlet, riwayat rating, dan statistik menang/kalah diperbarui dalam satu transaksi database.
      </p>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {pending.length === 0 && <p className="py-6 text-sm text-muted">Tidak ada hasil yang menunggu verifikasi.</p>}
        {pending.map((m) => <VerifyRow key={m.id} {...m} />)}
      </div>

      <h2 className="d mt-10 text-2xl">Buat pertandingan manual</h2>
      <CreateMatchForm />
    </div>
  )
}
