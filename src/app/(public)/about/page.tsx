import { PageBanner } from '@/components/public/page-banner'

const MISI = [
  'Membina dan mengembangkan atlet padel di seluruh kecamatan Kabupaten Garut.',
  'Menyelenggarakan turnamen dan kompetisi padel yang terstruktur dan berjenjang.',
  'Menyediakan sistem peringkat (rating) yang transparan dan berbasis prestasi.',
  'Melatih dan mensertifikasi pelatih serta wasit padel yang kompeten.',
  'Membangun dan memfasilitasi jejaring klub padel di tingkat kabupaten.',
]

export default function AboutPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Tentang Kami"
        title="Tentang PBPI Kabupaten Garut"
        description="Mengenal lebih dekat organisasi resmi yang menaungi olahraga padel di Kabupaten Garut."
      />

      <div className="section max-w-3xl">
        <p className="section-title">Pendahuluan</p>
        <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">
          PBPI Kabupaten Garut (Persatuan Besar Padel Indonesia, Pengurus Kabupaten Garut) adalah induk
          organisasi resmi yang menaungi seluruh kegiatan olahraga padel di wilayah Kabupaten Garut. Sebagai
          bagian dari struktur PB PABSI di tingkat kabupaten, kami bertanggung jawab atas pembinaan atlet,
          pengembangan klub, penyelenggaraan turnamen, serta sertifikasi pelatih dan wasit di seluruh 42
          kecamatan.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="card p-6">
            <p className="section-title">Visi</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Menjadikan Kabupaten Garut sebagai salah satu pusat pengembangan olahraga padel terkemuka di
              Jawa Barat, dengan ekosistem atlet, klub, dan kompetisi yang berkelanjutan.
            </p>
          </div>
          <div className="card p-6">
            <p className="section-title">Misi</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
              {MISI.map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <p className="section-title">Peran PBPI di Kabupaten Garut</p>
          <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">
            Sebagai pengurus kabupaten, PBPI Garut menjembatani pemain, klub, pelatih, dan wasit dengan
            struktur PBPI di tingkat provinsi dan nasional, mulai dari pendataan atlet, verifikasi
            pertandingan, hingga penyelenggaraan turnamen resmi yang diakui secara berjenjang.
          </p>
        </div>

        <div className="mt-10">
          <p className="section-title">Pengembangan Padel di Kabupaten Garut</p>
          <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">
            Dengan 42 kecamatan yang tersebar di seluruh Kabupaten Garut, kami terus mendorong pemerataan
            akses terhadap lapangan, pelatihan, dan kompetisi padel, agar potensi atlet dari setiap wilayah
            dapat berkembang, bukan hanya terpusat di kota.
          </p>
        </div>

        <div className="mt-10">
          <p className="section-title">Tujuan Organisasi</p>
          <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">
            Membangun sistem pembinaan olahraga padel yang terukur, transparan, dan berkelanjutan, mulai
            dari akar rumput hingga jenjang kompetisi tertinggi yang dapat diikuti atlet Kabupaten Garut.
          </p>
        </div>
      </div>
    </div>
  )
}
