import Link from 'next/link'
import Image from 'next/image'
import { getClubsPreview } from '@/server/queries'

export async function ClubSection() {
  const clubs = await getClubsPreview(4)

  return (
    <section className="border-t border-line bg-surface">
      <div className="section">
        <p className="section-title">Federasi</p>
        <h2 className="d mt-3 text-4xl text-navy sm:text-5xl lg:text-6xl">Klub Padel di Kabupaten Garut</h2>

        {clubs.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Direktori klub sedang disusun. Pantau terus halaman ini.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map((c) => (
              <Link key={c.id} href={`/clubs/${c.slug}`} className="card flex flex-col items-center gap-2 p-6 text-center transition hover:border-navy">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line bg-white">
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
                  ) : (
                    <span className="d text-lg text-navy">{c.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <p className="font-display text-sm font-bold text-ink">{c.name}</p>
                {c.isVerified && <span className="text-[0.65rem] font-bold uppercase tracking-widest text-accent">Terverifikasi ✓</span>}
                <p className="text-xs text-muted">{c.district?.name ?? '-'}</p>
                <p className="text-xs text-muted">{c._count.members} anggota</p>
              </Link>
            ))}
          </div>
        )}

        <Link href="/clubs" className="mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.06em] text-accent">
          Lihat Direktori Klub →
        </Link>
      </div>
    </section>
  )
}
