import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Trophy, Users, MapPin } from 'lucide-react'

const paths = [
  { number: '01', title: 'Temukan ritmemu.', description: 'Kenali pemain, bangun koneksi, dan jadilah bagian dari komunitas.', href: '/players', label: 'Jelajahi pemain', icon: Users, image: '/images/player-backhand.jpg' },
  { number: '02', title: 'Naikkan levelmu.', description: 'Bawa semangat kompetisimu ke lapangan. Setiap poin berarti.', href: '/tournaments', label: 'Temukan turnamen', icon: Trophy, image: '/images/player-return.jpg' },
  { number: '03', title: 'Temukan rumahmu.', description: 'Cari klub di dekatmu dan mulai cerita padel berikutnya.', href: '/clubs', label: 'Cari klub padel', icon: MapPin, image: '/images/racket-balls.jpg' },
]

export function ExploreSection() {
  return (
    <section className="section">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="section-title">Play. Connect. Grow.</p><h2 className="d mt-4 text-4xl text-navy sm:text-5xl">Lebih dari<br />sekadar permainan.</h2></div>
        <p className="max-w-sm text-sm leading-7 text-muted">Ada tempat untuk setiap pemain. Dari yang baru mengenal padel hingga yang siap mengejar prestasi.</p>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {paths.map(({ number, title, description, href, label, icon: Icon, image }) => (
          <Link key={number} href={href} className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-navy p-6 text-white sm:min-h-[400px] sm:p-7">
            <Image src={image} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-navy-dark/20" />
            <div className="relative flex items-center justify-between"><span className="lb text-white/80">/ {number}</span><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40"><Icon size={18} aria-hidden="true" /></span></div>
            <div className="relative mt-20"><h3 className="font-display text-2xl font-extrabold tracking-tight">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-white/70">{description}</p><div className="mt-6 flex items-center justify-between border-t border-white/20 pt-5 text-sm font-semibold"><span>{label}</span><ArrowUpRight size={21} className="text-lime transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" /></div></div>
          </Link>
        ))}
      </div>
    </section>
  )
}
