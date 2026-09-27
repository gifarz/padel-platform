'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { NAV_ITEMS } from './header'

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-navy-dark/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        // `inert` when closed keeps the off-screen links out of both tab order
        // and screen-reader traversal, instead of relying on translate-x alone.
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-[82vw] max-w-sm flex-col bg-navy text-white shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="lb text-white/70">Menu</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Tutup menu" className="flex h-9 w-9 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav aria-label="Navigasi mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">
          {NAV_ITEMS.map((item) => {
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="border-b border-white/10 py-3 text-base font-bold uppercase tracking-wide text-white/90"
                >
                  {item.label}
                </Link>
              )
            }
            const isOpen = expanded === item.label
            return (
              <div key={item.label} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : item.label)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between py-3 text-base font-bold uppercase tracking-wide text-white/90"
                >
                  {item.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className={`transition ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1 pb-3 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={onClose}
                        className="py-2 text-sm font-semibold uppercase tracking-wide text-white/70"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-5">
          <Link href="/login" onClick={onClose} className="btn-o justify-center border-white/30 bg-transparent text-white hover:border-white">
            Masuk
          </Link>
          <Link href="/register" onClick={onClose} className="btn-p justify-center">
            Gabung
          </Link>
        </div>
      </div>
    </div>
  )
}
