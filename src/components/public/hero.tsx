import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative -mt-0.5 flex min-h-[calc(100dvh-var(--header-h))] items-center overflow-hidden bg-navy text-white">
      <Image
        src="/images/court-sunset.jpg"
        alt=""
        fill
        priority
        className="object-cover object-[60%_center] opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/60" />

      <div className="relative mx-auto w-full max-w-site px-4 py-24 sm:px-8">
        <p className="lb text-white/60">
          Pengurus Kabupaten &middot; Persatuan Besar Padel Indonesia &middot; Kabupaten Garut
        </p>
        <h1 className="d mt-4 text-4xl sm:text-6xl">
          PBPI KABUPATEN GARUT
        </h1>
        <p className="d mt-2 text-2xl text-white/85 sm:text-3xl">
          Memajukan Padel. Membangun Prestasi Garut.
        </p>
        <p className="mt-5 max-w-xl text-sm text-white/75 sm:text-base">
          PBPI Kabupaten Garut adalah organisasi resmi yang menaungi pengembangan olahraga padel di wilayah
          Kabupaten Garut, mendukung atlet, klub, turnamen, pelatih, dan wasit di seluruh 42 kecamatan.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/ranking" className="btn-p px-6 py-3 text-xs">Lihat Peringkat</Link>
          <Link href="/register" className="btn-o border-white/30 bg-transparent px-6 py-3 text-xs text-white hover:border-white">
            Cara Gabung
          </Link>
        </div>
      </div>
    </section>
  )
}
