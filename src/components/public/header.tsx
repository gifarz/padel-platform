'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MobileNav } from './mobile-nav'

export type NavLink = { href: string; label: string }
export type NavItem = NavLink & { children?: NavLink[] }

// Grouped nav: related pages sit under one hoverable label instead of each
// getting its own top-level slot. Flat entries (no `children`) render as a
// plain link, same as before.
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Beranda' },
  {
    href: '/about',
    label: 'Organisasi',
    children: [
      { href: '/about', label: 'Tentang' },
      { href: '/organization', label: 'Pengurus' },
    ],
  },
  {
    href: '/players',
    label: 'Pemain',
    children: [
      { href: '/players', label: 'Daftar Pemain' },
      { href: '/ranking', label: 'Peringkat' },
    ],
  },
  {
    href: '/clubs',
    label: 'Kompetisi',
    children: [
      { href: '/clubs', label: 'Klub' },
      { href: '/tournaments', label: 'Turnamen' },
    ],
  },
  { href: '/news', label: 'Berita' },
  { href: '/contact', label: 'Kontak' },
]

// Kept for components that still want the fully flattened list (e.g. a
// sitemap or search index) — derived from NAV_ITEMS so the two never drift.
export const NAV_LINKS: NavLink[] = NAV_ITEMS.flatMap((i) => (i.children ? i.children : [{ href: i.href, label: i.label }]))

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Transparent over the hero/banner at the top of the page; solid navy
  // once the person scrolls past it, so nav text stays legible over
  // whatever content follows underneath.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b transition-colors duration-300 ${
        scrolled || open
          ? 'border-navy-dark bg-navy shadow-sm'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-site items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Beranda PBPI Kabupaten Garut">
          <Image src="/logo/favicon-white.svg" alt="" width={32} height={32} className="h-9 w-auto lg:hidden" />
          <Image src="/logo/logo-white.svg" alt="PBPI Kabupaten Garut" width={240} height={64} className="hidden h-16 w-auto lg:block" priority />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden h-full items-stretch gap-1 text-[15px] font-semibold tracking-[0.01em] lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative flex h-full items-center">
                <Link
                  href={item.href}
                  className="flex h-full items-center gap-1.5 px-4 text-white/80 transition group-hover:text-white group-focus-within:text-white"
                >
                  {item.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="transition group-hover:rotate-180">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                {/* Invisible bridge closes the hover gap between the trigger and the panel. */}
                <div className="absolute left-0 top-full hidden w-full group-hover:block group-focus-within:block" />

                <div className="invisible absolute left-0 top-full min-w-[13rem] translate-y-1 overflow-hidden rounded border border-line bg-white opacity-0 shadow-md transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block border-b border-line px-4 py-3 text-[15px] font-medium text-ink transition-colors duration-150 last:border-0 hover:bg-navy hover:text-white hover:shadow-[inset_3px_0_0_#C81E2C] focus-visible:bg-navy focus-visible:text-white focus-visible:outline-none focus-visible:shadow-[inset_3px_0_0_#C81E2C]"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="flex h-full items-center px-4 text-white/80 transition hover:text-white">
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 text-[15px] font-semibold tracking-[0.01em] lg:flex">
          <Link href="/login" className="text-white/80 hover:text-white">Masuk</Link>
          <Link href="/register" className="btn-p h-11 px-6 text-[13px]">Gabung</Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center text-white lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <MobileNav open={open} onClose={() => setOpen(false)} />
    </header>
  )
}
