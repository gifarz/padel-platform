export function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) {
  return (
    <div className="relative isolate overflow-hidden border-b border-navy-dark bg-navy pt-[var(--header-h)] text-white">
      <div className="court-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute -right-16 top-24 -z-10 h-80 w-80 rotate-[-20deg] rounded-[60px] border-[32px] border-lime/10 sm:right-16" aria-hidden="true" />
      <div className="mx-auto max-w-site px-4 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
        <p className="lb flex items-center gap-3 text-lime"><span className="h-2 w-2 rounded-full bg-lime" />{eyebrow}</p>
        <h1 className="d mt-5 break-words text-4xl sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>}
      </div>
    </div>
  )
}
