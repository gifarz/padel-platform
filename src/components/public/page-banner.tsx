export function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) {
  return (
    <div className="border-b border-navy-dark bg-navy pt-[var(--header-h)] text-white">
      <div className="mx-auto max-w-site px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <p className="lb text-white/60">{eyebrow}</p>
        <h1 className="d mt-3 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>}
      </div>
    </div>
  )
}
