import { PageBanner } from '@/components/public/page-banner'

const CONTACT = {
  address: 'Sekretariat PBPI Kabupaten Garut, Jl. Ciledug, Tarogong Kidul, Kabupaten Garut, Jawa Barat',
  phone: '+62 262 000 0000',
  email: 'pengurus@pbpigarut.id',
  instagram: 'https://instagram.com/pbpigarut',
}

export default function ContactPage() {
  return (
    <div>
      <PageBanner eyebrow="Kontak" title="Hubungi Kami" description="Ada pertanyaan seputar keanggotaan, klub, atau turnamen? Hubungi sekretariat PBPI Kabupaten Garut." />

      <div className="section grid gap-10 sm:grid-cols-2">
        <div>
          <p className="section-title">Sekretariat</p>
          <ul className="mt-4 space-y-4 text-sm text-ink">
            <li>
              <p className="lb">Alamat</p>
              <p className="mt-1">{CONTACT.address}</p>
            </li>
            <li>
              <p className="lb">Telepon</p>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="mt-1 block text-accent">{CONTACT.phone}</a>
            </li>
            <li>
              <p className="lb">Email</p>
              <a href={`mailto:${CONTACT.email}`} className="mt-1 block text-accent">{CONTACT.email}</a>
            </li>
            <li>
              <p className="lb">Instagram</p>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="mt-1 block text-accent">@pbpigarut</a>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <p className="section-title">Kirim Pesan</p>
          <p className="mt-2 text-xs text-muted">
            Formulir ini belum terhubung ke sistem. Untuk saat ini silakan hubungi kami langsung melalui
            telepon, email, atau Instagram di samping.
          </p>
          <form className="mt-4 grid gap-3">
            <label htmlFor="contact-name" className="sr-only">Nama</label>
            <input id="contact-name" disabled placeholder="Nama" className="inp opacity-60" />
            <label htmlFor="contact-reach" className="sr-only">Email atau Nomor HP</label>
            <input id="contact-reach" disabled placeholder="Email atau Nomor HP" className="inp opacity-60" />
            <label htmlFor="contact-message" className="sr-only">Pesan</label>
            <textarea id="contact-message" disabled placeholder="Pesan" rows={4} className="inp resize-none opacity-60" />
            <button disabled type="button" className="btn-p opacity-50">Kirim (segera hadir)</button>
          </form>
        </div>
      </div>
    </div>
  )
}
