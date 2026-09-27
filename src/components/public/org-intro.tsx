import Link from 'next/link'

export function OrgIntro() {
  return (
    <section className="border-t border-line bg-navy text-white">
      <div className="section grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="lb text-white/50">Tentang Kami</p>
          <h2 className="d mt-2 text-2xl sm:text-3xl">
            PBPI Kabupaten Garut adalah induk organisasi resmi olahraga padel di wilayah Kabupaten Garut.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-white/75">
            Kami bertanggung jawab atas pembinaan atlet, pengembangan klub, penyelenggaraan turnamen, serta
            sertifikasi pelatih dan wasit, sejalan dengan visi PB PABSI dalam memajukan padel di seluruh Indonesia.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/about" className="btn-o border-white/30 bg-transparent text-white hover:border-white">Tentang PBPI Garut</Link>
          <Link href="/organization" className="btn-o border-white/30 bg-transparent text-white hover:border-white">Struktur Pengurus</Link>
        </div>
      </div>
    </section>
  )
}
