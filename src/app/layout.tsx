import type { Metadata } from 'next'
import { Anton, Barlow_Condensed } from 'next/font/google'
import './globals.css'

// Sport-style type system: Anton is a bold condensed poster/jersey-numeral
// face for headings; Barlow Condensed is the athletic, slightly condensed
// workhorse used everywhere else (nav, labels, body copy).
const display = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })
const body = Barlow_Condensed({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })

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
