'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/server/actions/auth'

const LINKS = [
  { href: '/admin', label: 'Ringkasan' },
  { href: '/admin/athletes', label: 'Atlet' },
  { href: '/admin/matches', label: 'Pertandingan' },
  { href: '/admin/competitions', label: 'Kompetisi' },
  { href: '/admin/locations', label: 'Lokasi' },
  { href: '/admin/clubs', label: 'Klub' },
  { href: '/admin/trainers', label: 'Pelatih' },
  { href: '/admin/referees', label: 'Wasit' },
  { href: '/admin/news', label: 'Berita' },
  { href: '/admin/organization', label: 'Pengurus' },
  { href: '/admin/districts', label: 'Kecamatan' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="border-line sm:sticky sm:top-0 sm:h-screen sm:w-60 sm:shrink-0 sm:border-r">
      <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:block">
        <Link href="/admin" className="font-display text-lg uppercase tracking-wide">
          PBPI<span className="text-accent"> Admin</span>
        </Link>
      </div>
      <div className="hidden border-b border-line px-5 py-3 sm:block">
        <form action={logoutAction}>
          <button className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">← Keluar</button>
        </form>
      </div>
      <nav className="flex overflow-x-auto text-xs font-bold uppercase tracking-widest sm:block sm:overflow-visible">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin' && pathname?.startsWith(l.href))
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block whitespace-nowrap border-b border-line px-5 py-3.5 sm:border-b-0 ${active ? 'bg-accent text-bg' : 'text-muted hover:bg-surface hover:text-ink'}`}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
