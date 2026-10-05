import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, MapPin, MoveUpRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="bg-surface pt-[var(--header-h)]">
      <div className="mx-auto max-w-[1600px] px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="relative isolate overflow-hidden rounded-[24px] bg-navy-dark text-white sm:rounded-[32px]">
          <div className="absolute inset-0 court-lines" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 hidden w-[57%] lg:block">
            <Image src="/images/court-sunset.jpg" alt="Raket dan bola padel di tepi lapangan saat matahari terbenam" fill priority sizes="100vw" className="object-cover object-[72%_center]" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-navy-dark/10" />
          </div>

          <div className="relative mx-auto max-w-site px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:pb-10 lg:pt-20">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-xs">
              <span className="flex h-2 w-2 rounded-full bg-lime" />
              Official home of padel · Kabupaten Garut
            </div>
            <div className="relative mt-8 max-w-[900px] lg:mt-10">
              <h1 className="d text-[clamp(2.25rem,6vw,5.5rem)] !leading-[0.98]">
                SATU LAPANGAN.<br />
                <span className="text-lime">JUTAAN</span><br />
                <span className="hero-outline">KEMUNGKINAN.</span>
              </h1>
              <p className="mt-7 max-w-[420px] text-sm leading-7 text-white/65 sm:text-base">
                Dari rally pertama hingga podium juara. Temukan komunitasmu, tantang kemampuanmu, dan tumbuh bersama padel Garut.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-sport">Mulai Perjalananmu <ArrowUpRight size={19} aria-hidden="true" /></Link>
                <Link href="/tournaments" className="btn-o">Jelajahi Turnamen <ArrowUpRight size={18} aria-hidden="true" /></Link>
              </div>
            </div>

            <div className="relative mt-10 h-52 overflow-hidden rounded-2xl lg:hidden">
              <Image src="/images/court-sunset.jpg" alt="Lapangan padel saat matahari terbenam" fill priority sizes="(max-width: 1023px) 100vw, 1px" className="object-cover object-[65%_65%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 to-transparent" />
              <p className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-medium"><MapPin size={14} aria-hidden="true" /> Your next game starts here.</p>
            </div>

            <div className="mt-10 flex items-end justify-between gap-5 border-t border-white/15 pt-6 lg:mt-16">
              <a href="#jelajahi" className="group flex items-center gap-3 text-xs font-medium text-white/65 hover:text-lime">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition group-hover:border-lime"><ArrowDown size={15} aria-hidden="true" /></span>
                Kenali dunia padel Garut
              </a>
              <span className="hidden text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:block">Persatuan Besar Padel Indonesia<br /><span className="mt-1 block text-white">Pengurus Kabupaten Garut</span></span>
            </div>
          </div>

          <div className="absolute right-10 top-10 hidden h-24 w-24 rotate-12 items-center justify-center rounded-full border border-lime/60 bg-navy-dark/20 text-lime backdrop-blur-sm xl:flex" aria-hidden="true">
            <MoveUpRight size={42} strokeWidth={1.25} />
          </div>
        </div>
      </div>
    </section>
  )
}
