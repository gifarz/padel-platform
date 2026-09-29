import Link from 'next/link'
import { getCompetitions, getLocations } from '@/server/queries'
import { StatusBadge } from '@/components/ui/badge'
import { fmtDate } from '@/lib/format'
import { CreateCompetitionForm } from '@/components/admin/create-competition-form'

const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda putra', WOMENS_DOUBLES: 'Ganda putri', MIXED_DOUBLES: 'Ganda campuran',
  MENS_SINGLES: 'Tunggal putra', WOMENS_SINGLES: 'Tunggal putri', OPEN: 'Terbuka',
}

export default async function AdminCompetitionsPage() {
  const [competitions, locations] = await Promise.all([getCompetitions(), getLocations()])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="d text-4xl sm:text-6xl">Kompetisi</h1>
      </div>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-bold uppercase tracking-widest text-muted">
              <th className="th">Nama</th><th className="th">Kategori</th><th className="th">Lokasi</th>
              <th className="th">Mulai</th><th className="th">Batas daftar</th><th className="th">Peserta</th>
              <th className="th">Status</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base uppercase">{c.name}</td>
                <td className="td text-muted">{CATEGORY_LABEL[c.category] ?? c.category}</td>
                <td className="td text-muted">{c.location.city}</td>
                <td className="td">{fmtDate(c.startsAt)}</td>
                <td className="td">{fmtDate(c.registrationDeadline)}</td>
                <td className="td">{c._count.participants}/{c.maxPlayers}</td>
                <td className="td"><StatusBadge status={c.status} /></td>
                <td className="td text-right">
                  <Link href={`/admin/competitions/${c.id}`} className="text-xs font-bold uppercase tracking-widest text-accent">Kelola →</Link>
                </td>
              </tr>
            ))}
            {competitions.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-sm text-muted">Belum ada kompetisi. Buat satu di bawah.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="d mt-10 text-2xl">Buat kompetisi baru</h2>
      <CreateCompetitionForm locations={locations.map((l: { id: string; name: string; city: string }) => ({ id: l.id, name: l.name, city: l.city }))} />
    </div>
  )
}
