import Link from 'next/link'
import { PageBanner } from '@/components/public/page-banner'

const CONTACT_PHONE = '+62 262 000 0000'

export default function RegisterPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Pendaftaran"
        title="Gabung Jadi Atlet"
        description="Pendaftaran akun atlet PBPI Kabupaten Garut kini dikelola langsung oleh admin, bukan lewat formulir mandiri."
      />
      <div className="section max-w-2xl">
        <p className="section-title">Bagaimana caranya?</p>
        <p className="mt-3 text-sm text-ink">
          Untuk menjaga data pemain tetap akurat dan terverifikasi, akun atlet baru dibuatkan oleh admin
          PBPI Kabupaten Garut. Hubungi sekretariat lewat telepon, email, atau Instagram dengan menyertakan
          nama lengkap, nomor HP, dan kecamatan kamu. Admin akan membuatkan akun beserta kata sandi awal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="btn-p px-6 py-3 text-xs">
            Hubungi Sekretariat
          </a>
          <Link href="/contact" className="btn-o px-6 py-3 text-xs">Lihat Kontak Lengkap</Link>
        </div>
        <p className="mt-8 text-xs text-muted">
          Sudah punya akun? <Link href="/login" className="text-accent">Masuk di sini</Link>.
        </p>
      </div>
    </div>
  )
}
