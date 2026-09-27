export function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) {
  return (
    <div className="-mt-0.5 border-b border-navy-dark bg-navy text-white">
      <div className="mx-auto max-w-site px-4 py-16 sm:px-8 sm:py-20">
        <p className="lb text-white/60">{eyebrow}</p>
        <h1 className="d mt-3 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>}
      </div>
    </div>
  )
}
