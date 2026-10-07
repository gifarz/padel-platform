import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'

/**
 * Full-bleed hero: the photo fills the whole first screen and runs *under* the
 * fixed navbar (Header goes transparent over it on "/" until the page scrolls).
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy-dark text-white">
      <Image
        src="/images/court-sunset.jpg"
        alt="Raket dan bola padel di tepi lapangan saat matahari terbenam"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[68%_center]"
      />
      {/* Legibility layers: left-to-right for the headline, bottom-up for the footer bar, top-down for the navbar. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-dark/90 via-navy-dark/55 to-navy-dark/10" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark/85 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-navy-dark/70 to-transparent" aria-hidden="true" />
      <div className="court-lines absolute inset-0 -z-10 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-site flex-1 flex-col justify-center px-5 pb-10 pt-[calc(var(--header-h)+2.5rem)] sm:px-8">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 sm:text-xs">
          <span className="flex h-2 w-2 rounded-full bg-lime" />
          Official home of padel · Kabupaten Garut
        </div>

        <div className="mt-8 max-w-[900px]">
          <h1 className="d text-[clamp(2.5rem,7vw,6rem)] !leading-[0.98]">
            SATU LAPANGAN.<br />
            <span className="text-lime">JUTAAN</span><br />
            <span className="hero-outline">KEMUNGKINAN.</span>
          </h1>
          <p className="mt-7 max-w-[440px] text-sm leading-7 text-white/80 sm:text-base">
            Dari rally pertama hingga podium juara. Temukan komunitasmu, tantang kemampuanmu, dan tumbuh bersama padel Garut.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-sport">Mulai Perjalananmu <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <Link href="/tournaments" className="btn-o">Jelajahi Turnamen <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-site px-5 pb-8 sm:px-8">
        <div className="flex items-end justify-between gap-5 border-t border-white/20 pt-6">
          <a href="#jelajahi" className="group flex items-center gap-3 text-xs font-medium text-white/80 hover:text-lime">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition group-hover:border-lime"><ArrowDown size={15} aria-hidden="true" /></span>
            Kenali dunia padel Garut
          </a>
          <span className="hidden text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:block">
            Persatuan Besar Padel Indonesia<br /><span className="mt-1 block text-white">Pengurus Kabupaten Garut</span>
          </span>
        </div>
      </div>
    </section>
  )
}
