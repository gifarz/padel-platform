'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/server/actions/auth'

const LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/find-opponent', label: 'Cari Lawan' },
  { href: '/matches', label: 'Pertandingan' },
  { href: '/competitions', label: 'Kompetisi' },
  { href: '/ranking', label: 'Peringkat' },
]

export function AthleteNav({ username, initials }: { username: string; initials: string }) {
  const pathname = usePathname()
  const profileHref = `/profile/${username}`
  const allLinks = [...LINKS, { href: profileHref, label: 'Profil' }]

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/dashboard" className="font-display text-xl uppercase tracking-wide">
          PBPI<span className="text-accent"> Garut</span>
        </Link>
        <nav className="hidden gap-6 text-xs font-bold uppercase tracking-widest sm:flex">
          {allLinks.map((l) => (
            <Link key={l.href} href={l.href} className={pathname?.startsWith(l.href) ? 'text-accent' : 'text-ink/80 hover:text-accent'}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={profileHref} className="flex h-10 w-10 items-center justify-center border border-line font-display text-sm">
            {initials}
          </Link>
          <Link href="/settings" className="hidden text-xs font-bold uppercase tracking-widest text-muted hover:text-ink sm:inline">Pengaturan</Link>
          <form action={logoutAction}>
            <button className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Keluar</button>
          </form>
        </div>
      </div>
      <nav className="flex overflow-x-auto border-t border-line text-[0.65rem] font-bold uppercase tracking-widest sm:hidden">
        {allLinks.map((l) => (
          <Link key={l.href} href={l.href} className={`flex-1 whitespace-nowrap px-3 py-2.5 text-center ${pathname?.startsWith(l.href) ? 'text-accent' : 'text-muted'}`}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
