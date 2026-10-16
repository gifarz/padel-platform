import Link from 'next/link'
import { PageBanner } from '@/components/public/page-banner'

const CONTACT_PHONE = '+62 262 000 0000'

export default function RegisterPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Pendaftaran"
        title="Gabung Jadi Pemain"
        description="Pendaftaran akun pemain diurus langsung oleh admin PBPI Kabupaten Garut."
      />
      <div className="section max-w-2xl">
        <p className="section-title">Bagaimana caranya?</p>
        <p className="mt-3 text-sm text-ink">
          Supaya data pemain tetap akurat, akun baru dibuatkan langsung oleh admin PBPI Kabupaten Garut.
          Hubungi sekretariat lewat telepon, email, atau Instagram dengan menyertakan nama lengkap, nomor HP,
          dan kecamatanmu. Admin akan membuatkan akun beserta kata sandi awal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="btn-p px-6 py-3 text-xs">
            Hubungi Sekretariat
          </a>
          <Link href="/contact" className="btn-line px-6 text-xs">Lihat Kontak Lengkap</Link>
        </div>
        <p className="mt-8 text-xs text-muted">
          Sudah punya akun? <Link href="/login" className="text-accent">Masuk di sini</Link>.
        </p>
      </div>
    </div>
  )
}
