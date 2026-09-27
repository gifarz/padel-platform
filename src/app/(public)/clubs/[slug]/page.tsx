import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClubBySlug } from '@/server/queries'
import { fmtNum } from '@/lib/format'

export default async function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const club = await getClubBySlug(slug)
  if (!club) notFound()

  return (
    <div>
      <div className="border-b border-navy-dark bg-navy text-white">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-5 px-4 py-12 sm:px-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white">
            {club.logoUrl ? (
              <Image src={club.logoUrl} alt="" width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <span className="d text-2xl text-navy">{club.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            {club.isVerified && <p className="lb text-red-300">Terverifikasi ✓</p>}
            <h1 className="d mt-1 text-3xl sm:text-4xl">{club.name}</h1>
            <p className="mt-1 text-sm text-white/70">{club.district?.name ?? '-'} &middot; {club.members.length} anggota</p>
          </div>
        </div>
      </div>

      <div className="section grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {club.description && (
            <div className="mb-8">
              <p className="section-title">Tentang Klub</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{club.description}</p>
            </div>
          )}
          <p className="section-title">Kontak</p>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {club.address && <li>{club.address}</li>}
            {club.phone && <li><a href={`tel:${club.phone}`} className="text-accent">{club.phone}</a></li>}
            {club.instagram && <li><a href={club.instagram} target="_blank" rel="noreferrer" className="text-accent">Instagram</a></li>}
            {club.website && <li><a href={club.website} target="_blank" rel="noreferrer" className="text-accent">{club.website}</a></li>}
            {!club.address && !club.phone && !club.instagram && !club.website && <li className="text-muted">Belum ada informasi kontak.</li>}
          </ul>
        </div>

        <div>
          <p className="section-title">Anggota</p>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {club.members.length === 0 && <p className="py-6 text-sm text-muted">Belum ada anggota terdaftar.</p>}
            {club.members.map((m, i) => (
              <Link key={m.id} href={`/profile/${m.username}`} className="flex items-center gap-3 py-3 hover:bg-surface">
                <span className="d w-6 text-muted">{i + 1}</span>
                <span className="flex-1 text-sm font-semibold text-ink">{m.name}</span>
                <span className="d text-sm text-navy">{fmtNum(m.rating)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
