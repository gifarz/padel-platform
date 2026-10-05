import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, BadgeCheck, MapPin, Users } from 'lucide-react'
import { getClubsPreview } from '@/server/queries'

export async function ClubSection() {
  const clubs = await getClubsPreview(4)

  return (
    <section className="border-t border-line bg-surface">
      <div className="section">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="section-title">Find your people</p><h2 className="d mt-4 text-4xl text-navy sm:text-5xl">Klub lokal.<br />Energi luar biasa.</h2></div>
          <Link href="/clubs" className="section-link">Jelajahi Direktori Klub <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>

        {clubs.length === 0 ? (
          <p className="empty-state">Direktori klub sedang disusun. Pantau terus halaman ini.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map((c) => (
              <Link key={c.id} href={`/clubs/${c.slug}`} className="card group flex flex-col p-6">
                <div className="mb-6 flex items-center justify-between"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface">
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
                  ) : (
                    <span className="d text-lg text-navy">{c.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div><ArrowUpRight size={20} className="text-muted transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" /></div>
                <p className="font-display text-lg font-bold tracking-tight text-ink">{c.name}</p>
                {c.isVerified && <span className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-accent"><BadgeCheck size={13} aria-hidden="true" />Klub Terverifikasi</span>}
                <p className="mt-4 flex items-center gap-2 text-xs text-muted"><MapPin size={13} aria-hidden="true" />{c.district?.name ?? '-'}</p>
                <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted"><Users size={14} aria-hidden="true" />{c._count.members} anggota</p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
