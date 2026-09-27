import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'

// Editorial sports-brand type system: Montserrat (wide, geometric, heavy)
// carries headings and display moments; Inter is the highly-readable
// workhorse for navigation, labels and body copy.
const display = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'PBPI Kabupaten Garut',
  description:
    'Situs resmi PBPI Kabupaten Garut, Persatuan Besar Padel Indonesia Pengurus Kabupaten Garut. Peringkat pemain, klub, turnamen, pelatih, dan wasit.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-bg text-ink antialiased">{children}</body>
    </html>
  )
}
