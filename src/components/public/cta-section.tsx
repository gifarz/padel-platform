import Link from 'next/link'
import Image from 'next/image'

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-navy text-white">
      <Image src="/images/player-return.jpg" alt="" fill className="object-cover object-[35%_center] opacity-25" />
      <div className="relative section text-center sm:text-left">
        <h2 className="d text-3xl sm:text-4xl">Jadi Bagian dari<br />PBPI Kabupaten Garut</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75 sm:mx-0">
          Daftarkan dirimu sebagai pemain resmi lewat admin PBPI Kabupaten Garut, dapatkan rating awal, dan mulai naik peringkat.
        </p>
        <Link href="/register" className="btn-p mt-6 inline-flex px-7 py-3 text-xs">Cara Daftar Sebagai Pemain →</Link>
      </div>
    </section>
  )
}
