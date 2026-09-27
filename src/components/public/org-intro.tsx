import Link from 'next/link'

export function OrgIntro() {
  return (
    <section className="border-t border-line bg-navy text-white">
      <div className="section grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="lb text-white/60">Tentang Kami</p>
          <h2 className="d mt-3 text-4xl sm:text-5xl lg:text-6xl">
            MEMBANGUN
            <br />
            EKOSISTEM PADEL
            <br />
            KABUPATEN GARUT
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Kami bertanggung jawab atas pembinaan atlet, pengembangan klub, penyelenggaraan turnamen, serta
            sertifikasi pelatih dan wasit, sejalan dengan visi PB PABSI dalam memajukan padel di seluruh Indonesia.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/about" className="btn-o">Tentang PBPI Garut</Link>
          <Link href="/organization" className="btn-o">Struktur Pengurus</Link>
        </div>
      </div>
    </section>
  )
}
