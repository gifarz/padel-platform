import Link from 'next/link'
import Image from 'next/image'

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-navy text-white">
      <Image src="/images/player-return.jpg" alt="" fill className="object-cover object-[35%_center] opacity-30" />
      <div className="absolute inset-0 bg-navy/50" />
      <div className="relative section text-center sm:text-left">
        <h2 className="d text-4xl sm:text-5xl lg:text-6xl">Jadi Bagian dari<br />PBPI Kabupaten Garut</h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/80 sm:mx-0">
          Daftarkan dirimu sebagai pemain resmi lewat admin PBPI Kabupaten Garut, dapatkan rating awal, dan mulai naik peringkat.
        </p>
        <Link href="/register" className="btn-p mt-8 inline-flex">Cara Daftar Sebagai Pemain →</Link>
      </div>
    </section>
  )
}
