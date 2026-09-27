import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-navy pt-[var(--header-h)] text-white">
      <Image
        src="/images/court-sunset.jpg"
        alt=""
        fill
        priority
        className="object-cover object-[60%_center]"
      />
      {/* Restrained global overlay + a localized left-side gradient for text
          readability — the photography stays the dominant visual element. */}
      <div className="absolute inset-0 bg-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-dark/50 to-transparent" />

      <div className="relative mx-auto w-full max-w-site px-4 py-24 sm:px-8">
        <div className="max-w-[760px]">
          <p className="lb text-white/70">
            Pengurus Kabupaten &middot; Persatuan Besar Padel Indonesia
          </p>
          <h1 className="d mt-5 text-6xl sm:text-7xl lg:text-8xl">
            PBPI KABUPATEN
            <br />
            GARUT
          </h1>
          <p className="d mt-3 text-2xl font-extrabold normal-case text-white/90 sm:text-3xl lg:text-4xl">
            Memajukan Padel. Membangun Prestasi Garut.
          </p>
          <p className="mt-6 max-w-[600px] text-base leading-relaxed text-white/80 sm:text-lg">
            PBPI Kabupaten Garut adalah organisasi resmi yang menaungi pengembangan olahraga padel di wilayah
            Kabupaten Garut, mendukung atlet, klub, turnamen, pelatih, dan wasit di seluruh 42 kecamatan.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/ranking" className="btn-p">Lihat Peringkat</Link>
            <Link href="/register" className="btn-o">Cara Gabung</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
