import Link from 'next/link'
import Image from 'next/image'

/**
 * Contact/social details live here as one config object instead of being
 * scattered across components — swap these once the organization confirms
 * its official channels.
 */
const CONTACT = {
  address: 'Sekretariat PBPI Kabupaten Garut, Jl. Ciledug, Tarogong Kidul, Kabupaten Garut, Jawa Barat',
  phone: '+62 262 000 0000',
  email: 'pengurus@pbpigarut.id',
  instagram: 'https://instagram.com/pbpigarut',
  youtube: 'https://youtube.com/@pbpigarut',
}

const NAV_COLUMN = [
  { href: '/about', label: 'Tentang' },
  { href: '/organization', label: 'Pengurus' },
  { href: '/players', label: 'Pemain' },
  { href: '/ranking', label: 'Peringkat' },
  { href: '/clubs', label: 'Klub' },
  { href: '/tournaments', label: 'Turnamen' },
]

const INFO_COLUMN = [
  { href: '/news', label: 'Berita' },
  { href: '/trainers', label: 'Pelatih' },
  { href: '/referees', label: 'Wasit' },
  { href: '/contact', label: 'Kontak' },
]

export function Footer() {
  return (
    <footer className="border-t border-navy-dark bg-navy text-white">
      <div className="mx-auto max-w-site px-4 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo/pbpi-full.svg" alt="PBPI Kabupaten Garut" width={220} height={58} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Persatuan Besar Padel Indonesia, Pengurus Kabupaten Garut. Organisasi resmi yang menaungi atlet,
              klub, pelatih, dan wasit padel di Kabupaten Garut.
            </p>
          </div>

          <div>
            <p className="lb text-white/50">Navigasi</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_COLUMN.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-white/80 hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="lb text-white/50">Informasi</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {INFO_COLUMN.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-white/80 hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="lb text-white/50">Kontak</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>{CONTACT.address}</li>
              <li><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="hover:text-white">{CONTACT.phone}</a></li>
              <li><a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a></li>
            </ul>
            <div className="mt-4 flex gap-4 text-sm">
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">Instagram</a>
              <a href={CONTACT.youtube} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">YouTube</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} PBPI Kabupaten Garut. Semua hak dilindungi.</span>
          <span>Memajukan Padel. Membangun Prestasi Garut.</span>
        </div>
      </div>
    </footer>
  )
}
