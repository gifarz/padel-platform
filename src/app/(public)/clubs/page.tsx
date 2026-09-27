import Link from 'next/link'
import Image from 'next/image'
import { PageBanner } from '@/components/public/page-banner'
import { getClubsDirectory, getDistricts } from '@/server/queries'

export default async function ClubsDirectoryPage({ searchParams }: { searchParams: Promise<{ districtId?: string }> }) {
  const { districtId } = await searchParams
  const [clubs, districts] = await Promise.all([getClubsDirectory(districtId), getDistricts()])

  return (
    <div>
      <PageBanner eyebrow="Federasi" title="Direktori Klub" description="Klub padel resmi yang terdaftar di bawah PBPI Kabupaten Garut." />

      <div className="section">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kecamatan">
          <Link href="/clubs" aria-current={!districtId ? 'true' : undefined} className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${!districtId ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-navy hover:text-navy'}`}>
            Semua Kecamatan
          </Link>
          {districts.map((d) => (
            <Link
              key={d.id}
              href={`/clubs?districtId=${d.id}`}
              aria-current={districtId === d.id ? 'true' : undefined}
              className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${districtId === d.id ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:border-navy hover:text-navy'}`}
            >
              {d.name}
            </Link>
          ))}
        </div>

        {clubs.length === 0 ? (
          <p className="mt-10 text-sm text-muted">Belum ada klub terdaftar untuk kecamatan ini.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map((c) => (
              <Link key={c.id} href={`/clubs/${c.slug}`} className="card flex flex-col items-center gap-2 p-6 text-center transition hover:border-navy">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
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
      </div>
    </div>
  )
}
