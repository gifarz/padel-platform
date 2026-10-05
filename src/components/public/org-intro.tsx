import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

export function OrgIntro() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div className="court-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div className="section grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
          <Image src="/images/player-return.jpg" alt="Pemain padel bersiap mengembalikan bola di lapangan" fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />
          <div className="absolute bottom-7 left-7 border-l-2 border-lime pl-4"><p className="lb text-lime">Dari Garut, untuk Indonesia.</p><p className="mt-2 text-lg font-bold">Bersama, kita melangkah lebih jauh.</p></div>
        </div>
        <div>
          <p className="lb flex items-center gap-3 text-lime"><span className="h-2 w-2 rounded-full bg-lime" />Tentang PBPI Garut</p>
          <h2 className="d mt-4 text-4xl sm:text-5xl">Membangun<br />permainan.<br /><span className="text-lime">Menggerakkan<br />masa depan.</span></h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/65">Kami menaungi pembinaan atlet, pengembangan klub, penyelenggaraan turnamen, serta sertifikasi pelatih dan wasit. Bersama, kita membangun ekosistem padel yang lebih kuat di Kabupaten Garut.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6"><Link href="/about" className="btn-o">Kenali Kami <ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/organization" className="text-sm font-semibold text-white/75 transition hover:text-lime">Struktur Pengurus ↗</Link></div>
        </div>
      </div>
    </section>
  )
}
