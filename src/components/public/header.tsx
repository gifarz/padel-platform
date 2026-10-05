'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
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
  const pathname = usePathname()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => {
    setOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Add elevation as content passes underneath the fixed navigation.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b transition-colors duration-300 ${
        scrolled || open
          ? 'border-line bg-white/95 shadow-sm backdrop-blur-xl'
          : 'border-transparent bg-surface'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-navy">Langsung ke konten</a>
      <div className="mx-auto flex h-full max-w-site items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Beranda PBPI Kabupaten Garut">
          <Image src="/logo/logo-black.svg" alt="PBPI Kabupaten Garut" width={200} height={54} className="h-10 w-auto sm:h-12" priority />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden h-full items-stretch text-[13px] font-semibold lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative flex h-full items-center">
                <Link
                  href={item.href}
                  className={`flex h-full items-center gap-1.5 px-3 transition group-hover:text-accent group-focus-within:text-accent ${item.children.some((child) => pathname.startsWith(child.href)) ? 'text-accent' : 'text-navy/70'}`}
                >
                  {item.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="transition group-hover:rotate-180">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                {/* Invisible bridge closes the hover gap between the trigger and the panel. */}
                <div className="absolute left-0 top-full hidden w-full group-hover:block group-focus-within:block" />

                <div className="invisible absolute left-0 top-full min-w-[13rem] translate-y-1 overflow-hidden rounded-2xl border border-line bg-white p-2 opacity-0 shadow-card transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={`relative flex h-full items-center px-3 transition hover:text-accent ${pathname === item.href ? 'text-accent after:absolute after:bottom-5 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-accent' : 'text-navy/70'}`}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-5 text-[13px] font-semibold lg:flex">
          <Link href="/login" className="text-navy/70 hover:text-accent">Masuk</Link>
          <Link href="/register" className="btn-p h-11 px-5 text-[13px]">Gabung Sekarang <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-navy lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

    </header>
    <MobileNav open={open} onClose={closeMenu} />
    </>
  )
}
