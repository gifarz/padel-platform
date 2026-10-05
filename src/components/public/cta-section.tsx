import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="bg-surface px-4 py-10 sm:px-8 sm:py-14">
      <div className="relative isolate mx-auto max-w-[1296px] overflow-hidden rounded-3xl bg-lime px-6 py-14 sm:px-12 lg:px-16 lg:py-16">
        <div className="absolute -right-28 -top-40 -z-10 h-[600px] w-[450px] rotate-[30deg] rounded-[100%] border-[2px] border-navy/15" aria-hidden="true" />
        <div className="absolute -right-16 -top-32 -z-10 h-[600px] w-[450px] rotate-[30deg] rounded-[100%] border-[2px] border-navy/15" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div><p className="lb text-navy/70">Your court. Your community.</p><h2 className="d mt-4 text-4xl text-navy sm:text-5xl lg:text-6xl">Giliranmu<br />masuk lapangan.</h2><p className="mt-5 max-w-md text-sm leading-7 text-navy/75">Jadilah bagian dari PBPI Kabupaten Garut. Mulai perjalananmu, temukan komunitasmu, dan buat setiap poin berarti.</p></div>
          <div className="shrink-0"><Link href="/register" className="inline-flex h-16 items-center justify-center gap-6 rounded-full bg-navy px-8 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-navy-dark">Gabung Sekarang <ArrowUpRight size={22} aria-hidden="true" /></Link><p className="mt-4 text-xs text-navy/65 lg:text-center">Langkah pertama menuju permainan hebat.</p></div>
        </div>
      </div>
    </section>
  )
}
